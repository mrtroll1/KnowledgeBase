# Milestone Quiz 1 — Lessons 1–5 & Kubernetes Fundamentals

**Scope**: Cluster architecture, core objects, Services, Ingress, Persistent Storage, Health Checks, Resources, Auto-Scaling, Helm, and hands-on debugging.

**Format**: Mix of conceptual, scenario-based, and A/B comparison questions. Answer in your own words — no multiple choice.

---

### Q1 — Core Objects (Chain of Responsibility)

A junior dev says: *"I deleted a Pod and it came back on its own. Kubernetes must be caching it."*

Explain what actually happened. Walk through the chain of objects that caused the Pod to reappear, starting from the Deployment.

---

### Q2 — Services (Why They Exist)

Imagine Services didn't exist in Kubernetes. You have 3 replicas of a backend Pod and a frontend Pod that needs to talk to them.

Describe **two concrete problems** the frontend would face, and explain how a Service solves each one.

---

### Q3 — Service Types (Choosing the Right One)

Match each scenario to the correct Service type (`ClusterIP`, `NodePort`, `LoadBalancer`) and explain **why** the other two are wrong for that case:

- **A)** A Redis cache that only your backend pods need to reach
- **B)** A TCP-based game server that external players connect to directly

---

### Q4 — Ingress vs LoadBalancer

Your company runs 12 HTTP microservices, each currently exposed via its own `LoadBalancer` Service.

1. What is the **cost and operational problem** with this setup?
2. How does switching to Ingress fix it?
3. Name one case where you'd **still** keep a LoadBalancer Service even after adding Ingress.

---

### Q5 — PV / PVC / StorageClass (The Three Layers)

A teammate writes this PVC:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: db-data
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd
```

But the Pod stays `Pending`. The cluster has a PV with 50Gi capacity and `storageClassName: standard`.

1. Why won't the PVC bind to the existing PV?
2. What are the **two ways** to fix this (without creating a new PV manually)?

---

### Q6 — Probes (Scenario Debugging)

You deploy a Java app that takes ~45 seconds to start up. You configure:

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
```

No readinessProbe or startupProbe is set.

1. What will happen to this Pod and **why**?
2. What is the best fix — and why is it better than just increasing `initialDelaySeconds` to 60?

---

### Q7 — Resources & QoS

You have three Pods in a namespace:

| Pod | requests.memory | limits.memory |
|-----|----------------|---------------|
| A   | 256Mi          | 256Mi         |
| B   | 128Mi          | 512Mi         |
| C   | (none)         | (none)        |

1. What QoS class is each Pod?
2. The node runs out of memory. In what **order** does Kubernetes evict them, and why?
3. Pod B's actual usage hits 520Mi. What happens — throttling or termination? Why?

---

### Q8 — HPA (Scaling Mechanics)

Your HPA is configured for `targetCPUUtilizationPercentage: 50` with `minReplicas: 2` and `maxReplicas: 10`. Each replica requests `200m` CPU.

Current state: 2 replicas, each using 180m CPU.

1. What is the current utilization percentage as the HPA sees it?
2. How many replicas will the HPA scale to? Show the formula.
3. If load drops back to normal 10 seconds later, will the HPA immediately scale down? Why or why not?

---

### Q9 — Helm (Why It Matters)

Without Helm, you need to deploy the same app to 3 environments (dev, staging, prod) with different replica counts, image tags, and resource limits.

1. Describe **what you'd have to do** without Helm (the pain).
2. How does Helm's templating solve this specifically?
3. In your Lesson 5 chart, you used `{{- if .Values.autoscaling.enabled }}`. Why is this better than always including the HPA manifest?

---

### Q10 — ConfigMap Volume Mounts vs Environment Variables

You used a ConfigMap to inject a custom `nginx.conf` into your Pods in Lesson 5.

1. Why did you use a **volume mount** instead of an **environment variable** for this?
2. If you update the ConfigMap's data after the Pod is running, what happens to the mounted file? What happens to env vars sourced from ConfigMaps?
3. Name a case where env vars from a ConfigMap **are** the right choice.

---

### Q11 — Cross-Cutting Debugging (Scenario)

You deploy a new version of `api-gateway`. The Pod is `Running`, readiness probe passes, but users report **502 errors** when hitting the Ingress at `sparks.local/api/`.

Walk through your **debugging steps in order**. For each step, state what you're checking and what tool/command you'd use. List at least 4 steps.

---

### Q12 — Namespaces & DNS

Service `profiles-service` lives in namespace `sparks`. Service `monitoring-agent` lives in namespace `observability`.

1. How does a Pod in `sparks` reach `profiles-service`? Write the hostname.
2. How does that same Pod reach `monitoring-agent`? Write the hostname.
3. Why does Kubernetes use this two-tier DNS scheme instead of just flat names?

---

## Scoring

- **10–12 correct**: You've built a strong Kubernetes foundation. Ready for intermediate topics.
- **7–9 correct**: Solid, but revisit the topics you missed before moving on.
- **< 7**: Let's review — no shame in reinforcing the basics before advancing.

Good luck!
