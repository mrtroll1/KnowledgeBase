# Lesson 6 Quiz — Answers

## Q1
Three things break with a 3-replica Deployment for postgres:
1. **Storage collision** — all 3 pods fight over the same PVC. StatefulSet's `volumeClaimTemplates` gives each pod its own PVC automatically (pgdata-postgres-0, pgdata-postgres-1, pgdata-postgres-2).
2. **No stable identity** — pod names are random hashes. You can't address the primary vs replicas. StatefulSet gives ordered names (postgres-0, postgres-1, postgres-2) and stable DNS (postgres-0.postgres-headless).
3. **No startup ordering** — Deployment starts all pods simultaneously. Replicas need the primary (postgres-0) to be up first. StatefulSet starts sequentially: 0 → 1 → 2.

## Q2
Node 5 gets no metrics pod. The scheduler doesn't guarantee even distribution — it could put 2 pods on node A and 0 on node C. Use a **DaemonSet** — it guarantees exactly one pod per node and auto-schedules on new nodes.

## Q3
Init containers are wrong because:
1. They run **every time a pod starts** — restarts, reschedules, rolling updates all re-trigger the migration.
2. They **block the main container** — your app won't start until the 2-minute migration finishes.
3. The migration's lifecycle is **coupled** to the app — can't run or inspect it independently.

Use a **Job** — runs once, exits on success, stays for log inspection.

## Q4
Two things missing:
1. A **Headless Service** (`clusterIP: None`) that gives pods individual DNS records.
2. The **`serviceName`** field in the StatefulSet spec linking it to that Headless Service.

## Q5
- **Postgres → StatefulSet**: needs stable identity + per-pod persistent storage
- **Node logger → DaemonSet**: only way to guarantee exactly one pod per node
- **Database migration → Job**: runs to completion and stops (Deployment would restart it forever)
- **Nightly match stats → CronJob**: a Job that runs on a schedule

## Q6
Scaling 1 → 3: Kubernetes auto-creates `pgdata-postgres-1` and `pgdata-postgres-2`.

Scaling 3 → 1: Pods 1 and 2 are deleted but **PVCs are retained**. This is a safety feature — if you scale back to 3, the pods rebind to their old PVCs with data intact. Orphaned PVCs must be manually deleted.

## Q7
`concurrencyPolicy: Forbid` — prevents a new Job from being created if the previous one is still running.

## Q8
With `restartPolicy: Never`, Kubernetes creates **new pods** (doesn't restart the failed one). `backoffLimit: 3` means 3 retries after the initial attempt. Total: up to **4 pods** (1 initial + 3 retries), all visible with status Error. After the 4th failure, the Job is marked Failed.

## Q9
Lesson 3's warning was about Deployments using hostPath — pods can land on any node, so hostPath data is unreliable. DaemonSets guarantee a 1:1 node↔pod mapping, so each pod reads its own node's local files. That's the entire point of a log collector — hostPath is the correct choice here.

## Q10
- A) Web API → **Deployment** (stateless, interchangeable replicas)
- B) Elasticsearch cluster → **StatefulSet** (stable identity + per-node storage)
- C) Cert renewal every 90 days → **CronJob** (scheduled task)
- D) GPU driver installer on every node → **DaemonSet** (must run on every node)
- E) One-time CSV import → **Job** (run to completion, don't repeat)
