# Lesson 3: Persistent Storage — Answers

## Round 1

### Q1
The pod doesn't mount the PVC. Either the `volumeMounts` or `volumes` section is missing or misconfigured. The PVC and PV exist and are bound, but if the pod never references them, data goes into the container's ephemeral filesystem instead. Always check the simplest cause first.

### Q2
No PV exists that matches the PVC's requirements (≥10Gi, correct access mode). No StorageClass = no auto-provisioning. The PVC waits for an admin to manually create a matching PV.

### Q3
Two problems: (1) Not persistent across node changes — if the pod moves to another node, data is gone. (2) No separation of concerns — infrastructure details (disk paths) get hardcoded into application manifests. Change servers or move to cloud? Rewrite everything. PV/PVC abstracts that away.

### Q4
`persistentVolumeReclaimPolicy: Retain` on the PV (or `reclaimPolicy: Retain` on the StorageClass). With Retain, deleting the PVC leaves the actual disk and data intact. The default on many cloud StorageClasses is `Delete` — must be explicitly changed for production.

### Q5
The data is inaccessible. `/mnt/data/postgres` exists on Node A's local disk — Node B has no such data. PostgreSQL starts fresh with an empty directory. This is the fundamental limitation of `hostPath` — it's node-local. Use network-attached storage (NFS, EBS) for multi-node clusters, or node affinity to pin the pod (but that defeats rescheduling benefits).

## Round 2

### Q1
Name mismatch. `volumeMounts` references `pgdata`, but `volumes` defines `pg-data`. The mount silently fails — no error, just ephemeral storage used instead.

### Q2
StorageClass mismatch. The PVC requests `storageClassName: fast-ssd`, but if the PV doesn't have `storageClassName: fast-ssd`, they won't bind. Kubernetes matches on size, access mode, AND StorageClass — all three must align.

### Q3
Practically right for today, wrong as a habit. It breaks the moment you add a second node, and you won't remember to fix all manifests when that happens. Even on one node, hostPath bakes infrastructure details into pod specs. PV/PVC costs two small extra files but keeps things portable. Acceptable shortcut for a personal learning cluster — not beyond that.

### Q4
Either one could bind — it's first-come-first-served based on creation order. The 2Gi PVC can bind to a 10Gi PV (wastes 8Gi). Whichever Kubernetes processes first claims it, the other stays Pending. This is why you use StorageClass (each PVC gets its own auto-provisioned PV) or carefully create PVs to match specific PVCs.
