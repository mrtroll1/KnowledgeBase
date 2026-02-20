# Lesson 3: Persistent Storage — Quiz

## Round 1

### Q1
Your PostgreSQL pod restarts after a crash. The data is gone. You check and see a PVC is bound to a PV. What's the most likely mistake in the pod manifest?

---

### Q2
You create a PVC requesting 10Gi. It stays in `Pending` state forever. No StorageClass is configured. What's going on?

---

### Q3
Your team has a self-hosted cluster with 3 databases. A new dev asks "why can't we just skip PVs and PVCs and use `hostPath` directly in the pod spec?" What's your argument against it?

---

### Q4
Production cluster on AWS. An engineer deletes a PVC by accident. The database disk is destroyed and data is lost. What setting would have prevented the data loss, and where is it configured?

---

### Q5
You have a postgres PV using `hostPath: /mnt/data/postgres` on Node A. Your cluster has 3 nodes. The postgres pod gets killed and Kubernetes reschedules it onto Node B. What happens and why?

---

## Round 2

### Q1
The PVC `postgres-pvc` exists and is bound. But postgres is writing to its ephemeral filesystem, not the PVC. What's the bug?

```yaml
spec:
  containers:
  - name: postgres
    image: postgres:16
    volumeMounts:
    - name: pgdata
      mountPath: /var/lib/postgresql/data
  volumes:
  - name: pg-data
    persistentVolumeClaim:
      claimName: postgres-pvc
```

---

### Q2
Your PVC looks like this. A PV exists with 20Gi, ReadWriteOnce. But the PVC stays Pending. Why?

```yaml
spec:
  storageClassName: fast-ssd
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

---

### Q3
You're running a self-hosted cluster with one node. A colleague says: "We only have one node, so `hostPath` is fine — the pod can't get rescheduled elsewhere anyway." Are they right?

---

### Q4
Two PVCs in the same namespace: `postgres-pvc` (10Gi) and `redis-pvc` (2Gi). One PV exists: 10Gi, ReadWriteOnce, no StorageClass. What happens — which PVC binds and which stays Pending?

