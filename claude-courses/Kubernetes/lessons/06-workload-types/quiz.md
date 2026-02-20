# Lesson 6 Quiz — Workload Types Beyond Deployments

---

### Q1

Your team runs a single postgres instance as a Deployment with 1 replica and a manually created PVC. It works fine. Your tech lead says: *"We need to add 2 read replicas for high availability. Just change replicas to 3."*

What breaks, and what workload type should you switch to? Give at least 3 specific reasons why.

---

### Q2

A junior dev is tasked with collecting node metrics from every machine in the cluster. They write this:

```yaml
kind: Deployment
spec:
  replicas: 4    # "we have 4 nodes, so 4 replicas"
```

What happens when the team adds a 5th node? What happens if the scheduler puts 2 pods on the same node and 0 on another? What should they use instead?

---

### Q3

You need to run a one-time data backfill script that takes about 2 minutes. A colleague suggests adding it as an init container on the main Deployment. What's wrong with that approach, and what should you use instead?

---

### Q4

Look at this StatefulSet. It has a bug — the pods will get random DNS names instead of stable per-pod DNS. What's missing?

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-cluster
spec:
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7
        ports:
        - containerPort: 6379
```

---

### Q5

Your Sparks chart now has four workload types. Match each component to its type and explain **in one sentence** why that type and not a Deployment:

- Postgres
- Node logger
- Database migration
- Nightly match stats

---

### Q6

StatefulSets use `volumeClaimTemplates` instead of a standalone PVC. What happens when you scale `replicas` from 1 to 3? What happens when you scale back down to 1 — do the extra PVCs get deleted?

---

### Q7

You have a CronJob that runs a report every hour. One execution gets stuck and takes 90 minutes. The next scheduled run fires at the top of the hour. Now you have two report pods running simultaneously, corrupting each other's output.

What CronJob field prevents this, and what value would you set?

---

### Q8

A Job has `backoffLimit: 3` and `restartPolicy: Never`. The container fails on the first run. Describe what happens next — does Kubernetes restart the same pod, or create a new one? How many total pods could you see before the Job is marked as Failed?

---

### Q9

Your colleague argues: *"DaemonSets using hostPath is a contradiction — you told me hostPath is bad in Lesson 3!"*

Explain why hostPath is actually the right choice for DaemonSets specifically, and why the Lesson 3 warning doesn't apply here.

---

### Q10

You're designing a new microservice platform. Categorize each of these into the correct workload type:

- A) Web API that serves user requests
- B) Elasticsearch cluster (3 nodes, each needs its own data volume)
- C) Certificate renewal that runs every 90 days
- D) GPU driver installer that must run on every node
- E) CSV import uploaded by a user (takes ~5 min, should not repeat)
