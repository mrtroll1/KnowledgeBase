# Lesson 3: Persistent Storage

## The Problem — Containers Are Ephemeral

You deploy a PostgreSQL pod. Users write data. The pod crashes and restarts.

**Without persistent storage**: all data is gone. The container's filesystem is scratch space — it dies with the container. You just lost your production database.

**With persistent storage**: the data lives on a disk *outside* the container. Pod dies, new pod starts, mounts the same disk, picks up where it left off. No data loss.

You already know ConfigMaps mount config data into pods. Persistent storage is the same *concept* — mounting something external into the pod's filesystem — but for durable, stateful data like databases, file uploads, and logs.

---

## Three Layers: PV, PVC, and StorageClass

This is the part that seems overcomplicated until you see *why* each layer exists.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Developer (you)           Cluster Admin           │
│                                                     │
│   "I need 10Gi of          "Here are the disks     │
│    fast storage"             available in           │
│        │                     this cluster"          │
│        ▼                         │                  │
│   ┌─────────┐              ┌─────▼──────┐           │
│   │   PVC   │──── binds ──►│    PV      │           │
│   │ (claim) │              │  (volume)  │           │
│   └─────────┘              └─────┬──────┘           │
│                                  │                  │
│                            actual disk              │
│                          (AWS EBS, GCP PD,          │
│                           NFS, local disk)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1. PersistentVolume (PV) — The Actual Disk

A PV represents a real piece of storage: an AWS EBS volume, a GCP Persistent Disk, an NFS share, or even a local disk on a node.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 50Gi
  accessModes:
    - ReadWriteOnce          # ← one node can mount it read-write
  persistentVolumeReclaimPolicy: Retain    # ← keep data after PVC is deleted
  hostPath:                  # ← for local dev only! (uses node's filesystem)
    path: /data/postgres
```

**Who creates PVs?** Typically the cluster admin or an automated provisioner — not you as a developer. You shouldn't need to care about *which specific disk* your data sits on, just like you don't pick which physical server your pod runs on.

### 2. PersistentVolumeClaim (PVC) — Your Request

A PVC is your way of saying "I need X amount of storage with Y characteristics." Kubernetes finds a matching PV and binds them together.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi          # ← "I need at least 10Gi"
```

Kubernetes looks for a PV that satisfies the claim (≥10Gi, ReadWriteOnce). If it finds one, they bind. If not, the PVC stays in `Pending` state until a suitable PV appears.

**Why this separation?** Because it decouples *who provisions storage* from *who uses it*:

- **Without PV/PVC separation**: developers need to know about AWS EBS volume IDs, NFS server addresses, disk types — infrastructure details that change between environments.
- **With PV/PVC separation**: developer says "give me 10Gi", admin (or automation) handles the actual disk. Same PVC manifest works in dev, staging, and prod.

### 3. StorageClass — The Automation Layer

Creating PVs manually for every request doesn't scale. StorageClass lets Kubernetes **create PVs automatically** when a PVC is submitted.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs    # ← talks to AWS API
parameters:
  type: gp3                           # ← SSD-backed EBS volume
  fsType: ext4
reclaimPolicy: Delete                 # ← delete disk when PVC is deleted
```

Now a developer can reference the StorageClass in their PVC:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  storageClassName: fast-ssd    # ← "use the fast-ssd class"
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

What happens:
1. Developer applies the PVC
2. Kubernetes sees `storageClassName: fast-ssd`
3. The `fast-ssd` StorageClass tells its provisioner to create a 10Gi gp3 EBS volume
4. A PV is automatically created and bound to the PVC
5. No admin intervention needed

**Without StorageClass**: admin manually creates a PV for every database, every environment, every team. Monday morning: 47 Slack messages asking for storage.

**With StorageClass**: self-service. Developers request what they need, automation handles the rest.

---

## Mounting Storage in a Pod

Once you have a PVC, mounting it is straightforward:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: postgres
spec:
  containers:
  - name: postgres
    image: postgres:16
    volumeMounts:
    - name: pg-data
      mountPath: /var/lib/postgresql/data    # ← where postgres expects data
  volumes:
  - name: pg-data
    persistentVolumeClaim:
      claimName: postgres-pvc                # ← references the PVC
```

Two-step wiring:
1. `volumes` — declares which PVC to use, gives it a local name (`pg-data`)
2. `volumeMounts` — tells the container where to mount it (`/var/lib/postgresql/data`)

**This is the same pattern as ConfigMaps** — you already know this structure. ConfigMap mounts config files, PVC mounts data directories. Same `volumes` + `volumeMounts` mechanism.

---

## Access Modes

Not all storage can be shared:

| Mode | Short | Meaning | Example |
|---|---|---|---|
| ReadWriteOnce | RWO | One node reads/writes | Database (PostgreSQL, MySQL) |
| ReadOnlyMany | ROX | Many nodes read | Shared config, static assets |
| ReadWriteMany | RWX | Many nodes read/write | Shared file uploads (NFS) |

Most cloud block storage (EBS, GCP PD) only supports **ReadWriteOnce**. If you need ReadWriteMany, you need a network filesystem like NFS or EFS.

This is why databases typically run as single instances or use StatefulSets (future lesson) — you can't just mount one EBS volume to 5 pods across 5 nodes.

---

## Reclaim Policies — What Happens When You Delete a PVC?

| Policy | What happens | Use case |
|---|---|---|
| **Retain** | PV and disk survive, data preserved, but PV must be manually cleaned up | Production databases — you NEVER want accidental deletion |
| **Delete** | PV and underlying disk are deleted | Dev/test environments — clean up after yourself |

**Without Retain**: intern runs `kubectl delete pvc postgres-pvc` → production database disk is destroyed.

**With Retain**: same command → PVC is gone, but the actual disk and data survive. Admin can recover it.

---

## The Full Picture — How It All Connects

```
Developer writes:           Kubernetes does:              Cloud does:

PVC manifest ──apply──►  finds/creates PV  ──provisions──► actual disk
     │                        │                               │
Pod manifest ──apply──►  mounts PV into pod ◄──attaches──────┘
                              │
                         Pod starts with
                         /var/lib/postgresql/data
                         backed by real disk
                              │
                         Pod crashes & restarts
                              │
                         New pod mounts SAME PV
                              │
                         Data is still there ✓
```

---

## Comparison: ConfigMap vs PVC

Since you already know ConfigMaps, here's how they relate:

| | ConfigMap | PersistentVolumeClaim |
|---|---|---|
| **What it stores** | Config data (env vars, config files) | Persistent data (databases, uploads) |
| **Size** | Small (1MB limit) | Gigabytes to terabytes |
| **Survives pod restart?** | N/A (config is re-mounted) | Yes — that's the whole point |
| **Backed by** | etcd (cluster state store) | Real disks (EBS, NFS, local) |
| **Who creates it** | Developer | Developer (PVC) + admin/automation (PV/StorageClass) |
| **Mount mechanism** | `volumes` + `volumeMounts` | Same: `volumes` + `volumeMounts` |

---

## Key Takeaways

1. **Containers are ephemeral** — without PVs, data dies with the pod
2. **PV = the disk, PVC = your request** — separation lets developers ignore infrastructure details
3. **StorageClass = automation** — no more manual PV creation, self-service provisioning
4. **Same mount pattern as ConfigMaps** — `volumes` + `volumeMounts`, you already know this
5. **Access modes matter** — most cloud disks are ReadWriteOnce; sharing needs NFS or similar
6. **Retain policy for production** — never let a `kubectl delete` destroy your data
