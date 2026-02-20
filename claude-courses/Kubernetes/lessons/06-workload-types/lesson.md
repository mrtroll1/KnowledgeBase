# Lesson 6 — Workload Types Beyond Deployments

## Why This Matters

So far, every workload you've deployed has been a **Deployment**. That works great for stateless web servers — but what happens when you need:

- A database where **Pod identity matters** (postgres-0, postgres-1, not random hashes)?
- A log collector running on **every single node**?
- A one-time data migration that should **run once and stop**?
- A nightly report that runs **on a schedule**?

If you try to shoehorn all of these into Deployments, you'll fight Kubernetes instead of working with it. Each workload type exists because Deployments **can't** handle these patterns correctly.

---

## The Workload Family

```
                        ┌─────────────────────────────────────┐
                        │          Controller Manager         │
                        └──────┬──────┬──────┬──────┬────────┘
                               │      │      │      │
                    ┌──────────┘      │      │      └──────────┐
                    ▼                 ▼      ▼                 ▼
              Deployment        StatefulSet  DaemonSet     Job/CronJob
              ──────────        ───────────  ─────────     ──────────
              Stateless         Stateful     One per       Run to
              replicas          with         node          completion
                                identity
              ──────────        ───────────  ─────────     ──────────
              Web servers       Databases    Log agents    Migrations
              APIs              Caches       Monitoring    Reports
              Microservices     Message      CNI plugins   Backups
                                queues
```

All four are managed by the controller-manager — the same reconciliation loop you learned about. They differ in **what guarantees they provide**.

---

## 1. StatefulSet — When Identity Matters

### The Problem Deployments Can't Solve

You deployed postgres in Lesson 4 as a Deployment with 1 replica. That worked. But what if you need a **3-node postgres cluster** with replication?

With a Deployment:
```
postgres-7f8b9c6d4-xk2mq    ← random name
postgres-7f8b9c6d4-9j3nw    ← random name
postgres-7f8b9c6d4-lp4vz    ← random name
```

Problems:
- **No stable identity** — pod names are random. Which one is the primary? Which are replicas? After a restart, names change
- **No startup order** — all 3 start simultaneously. But postgres replicas need the primary to be up first
- **Shared storage** — all pods fight over the same PVC, or you need manual PVC-per-pod hacks

With a StatefulSet:
```
postgres-0    ← always postgres-0, even after restart
postgres-1    ← always postgres-1
postgres-2    ← always postgres-2
```

### What StatefulSet Guarantees

| Guarantee | Deployment | StatefulSet |
|-----------|-----------|-------------|
| Pod names | Random hash (`-xk2mq`) | Ordered index (`-0`, `-1`, `-2`) |
| Startup order | All at once | Sequential: 0 → 1 → 2 |
| Shutdown order | All at once | Reverse: 2 → 1 → 0 |
| Storage | Shared or manual | Each pod gets its own PVC automatically |
| Network identity | Random | Stable DNS: `postgres-0.postgres-headless.ns.svc` |

### StatefulSet Manifest

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless    # Required — creates DNS records
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: pgdata
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:             # <-- Each pod gets its own PVC
  - metadata:
      name: pgdata
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

### Key Differences from Deployment Syntax

1. **`serviceName`** — required. Points to a Headless Service (ClusterIP: None) that gives each pod a DNS name
2. **`volumeClaimTemplates`** — replaces `volumes`. Kubernetes auto-creates `pgdata-postgres-0`, `pgdata-postgres-1`, `pgdata-postgres-2` — one PVC per pod
3. **No `strategy`** — StatefulSets use `updateStrategy` (default: `RollingUpdate` one at a time, in order)

### The Headless Service

A StatefulSet needs a **Headless Service** (`clusterIP: None`) to create per-pod DNS records:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None              # <-- Headless: no virtual IP
  selector:
    app: postgres
  ports:
  - port: 5432
```

Regular Service: `postgres-svc` → round-robins to any pod
Headless Service: `postgres-0.postgres-headless` → always hits pod 0

**Why?** Because for a database cluster, you need to reach **specific** pods. The primary (postgres-0) handles writes. Replicas handle reads. You can't round-robin writes to replicas.

### When to Use StatefulSet vs Deployment

```
Does pod identity matter?
  │
  ├── No  → Deployment (web servers, APIs, workers)
  │
  └── Yes → Does the pod need stable storage per instance?
              │
              ├── No  → Probably still Deployment with sticky sessions
              │
              └── Yes → StatefulSet (databases, Kafka, Elasticsearch, Zookeeper)
```

---

## 2. DaemonSet — One Pod Per Node

### The Problem

You want to run a log collector (like Fluentd) on every node in your cluster. With a Deployment, you'd have to:

1. Set `replicas` to your node count (what if it changes?)
2. Hope the scheduler spreads them evenly (it won't guarantee 1 per node)
3. Manually update `replicas` every time you add/remove nodes

That's fighting Kubernetes. A **DaemonSet** handles this automatically:

```
Node A          Node B          Node C          Node D (new)
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ fluentd  │   │ fluentd  │   │ fluentd  │   │ fluentd  │ ← auto
│  pod     │   │  pod     │   │  pod     │   │  pod     │   added
└──────────┘   └──────────┘   └──────────┘   └──────────┘
```

- Add a node → DaemonSet automatically schedules a pod on it
- Remove a node → pod is removed
- No `replicas` field — it's always "one per node"

### DaemonSet Manifest

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      containers:
      - name: fluentd
        image: fluentd:v1.16
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      volumes:
      - name: varlog
        hostPath:                 # <-- hostPath makes sense here!
          path: /var/log
```

Notice: **`hostPath` is actually appropriate here.** The whole point is to read each node's local `/var/log`. This is the exception where hostPath is the right choice — the DaemonSet guarantees one pod per node, so every node's logs get collected.

### What's Already Running as DaemonSets in Your Cluster

Run `kubectl get daemonsets -A` and you'll see system components:

| DaemonSet | Purpose |
|-----------|---------|
| `kube-proxy` | Maintains network rules on every node |
| `kindnet` / `calico-node` / `cilium` | CNI plugin — pod networking on every node |
| `fluentd` / `filebeat` | Log collection (if installed) |
| `node-exporter` | Prometheus metrics per node (if installed) |

These are things that **must run everywhere** — DaemonSet is the only workload type that guarantees it.

### When to Use DaemonSet vs Deployment

```
Must this pod run on every node?
  │
  ├── No  → Deployment
  │
  └── Yes → Does it need access to node-level resources (logs, metrics, network)?
              │
              ├── Yes → DaemonSet (log collectors, monitoring agents, CNI plugins)
              │
              └── Yes → DaemonSet (there's really no other option for per-node work)
```

---

## 3. Job — Run to Completion

### The Problem

You need to run a database migration. With a Deployment:

```yaml
# DON'T DO THIS
kind: Deployment
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: migrate
        command: ["python", "manage.py", "migrate"]
```

What happens: migration runs, container exits with code 0, Kubernetes **restarts it** (Deployment's job is to keep pods running). Your migration runs in an infinite loop.

A **Job** does the opposite: it runs a task and **stops when it's done**.

### Job Manifest

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: myapp:v2
        command: ["python", "manage.py", "migrate"]
      restartPolicy: Never        # <-- Don't restart on success
  backoffLimit: 3                  # <-- Retry up to 3 times on failure
```

Key differences:
- **`restartPolicy: Never`** (or `OnFailure`) — Deployments use `Always`
- **`backoffLimit`** — how many times to retry if it fails
- **No `replicas`** — runs once by default

### Parallel Jobs

Need to process 100 items? Jobs support parallelism:

```yaml
spec:
  completions: 100     # Total tasks to complete
  parallelism: 10      # Run 10 at a time
```

Kubernetes runs 10 pods concurrently, creates new ones as old ones finish, until all 100 complete.

### Job Lifecycle

```
Job created → Pod runs → Container exits
                            │
                    ┌───────┴───────┐
                    ▼               ▼
               Exit code 0     Exit code ≠ 0
               (success)       (failure)
                    │               │
                    ▼               ▼
              Job Complete     Retry (up to backoffLimit)
              Pod stays for       │
              log inspection      ▼
                              backoffLimit reached
                                  │
                                  ▼
                              Job Failed
```

---

## 4. CronJob — Jobs on a Schedule

A **CronJob** is just a Job with a cron schedule. It creates a new Job at each interval.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"          # 2 AM every day
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup-tool:latest
            command: ["backup.sh"]
          restartPolicy: OnFailure
  successfulJobsHistoryLimit: 3   # Keep last 3 successful jobs
  failedJobsHistoryLimit: 1       # Keep last failed job
```

### CronJob → Job → Pod

```
CronJob (schedule)
  └── creates Job (2 AM Monday)
        └── creates Pod (runs backup.sh, exits)
  └── creates Job (2 AM Tuesday)
        └── creates Pod (runs backup.sh, exits)
  └── ...
```

Common uses:
- Database backups
- Report generation
- Cache cleanup
- Certificate renewal
- Data aggregation

---

## The Complete Picture

| Workload | Replicas | Identity | Storage | Terminates? | Use Case |
|----------|----------|----------|---------|-------------|----------|
| **Deployment** | N identical | Random names | Shared or none | Never (restarts) | Stateless services |
| **StatefulSet** | N ordered | Stable names + DNS | Per-pod PVCs | Never (restarts) | Databases, clusters |
| **DaemonSet** | 1 per node | Per-node | Usually hostPath | Never (restarts) | Node agents |
| **Job** | Run N tasks | Not important | Usually none | Yes (on success) | One-time tasks |
| **CronJob** | Scheduled Jobs | Not important | Usually none | Yes (on success) | Recurring tasks |

### Decision Tree

```
What kind of work is this?
│
├── Runs continuously (server/daemon)
│   │
│   ├── Same pod on every node? → DaemonSet
│   │
│   ├── Needs stable identity + per-pod storage? → StatefulSet
│   │
│   └── Stateless, interchangeable replicas? → Deployment
│
└── Runs to completion (task/batch)
    │
    ├── One-time? → Job
    │
    └── On a schedule? → CronJob
```

---

## Connecting to What You Know

| You learned... | Now you know... |
|---------------|-----------------|
| PV/PVC (Lesson 3) | StatefulSet auto-creates PVCs via `volumeClaimTemplates` — no manual wiring |
| hostPath is bad (Lesson 3) | Except for DaemonSets — per-node access is the whole point |
| Deployments recreate pods (Lesson 1) | Jobs do the **opposite** — they let pods stay dead after completion |
| Probes (Lesson 5) | StatefulSets respect probes for ordered startup — pod-1 won't start until pod-0's readiness passes |
| Helm conditionals (Lesson 5) | Real charts use `{{- if eq .Values.workloadType "statefulset" }}` to switch between Deployment and StatefulSet |
