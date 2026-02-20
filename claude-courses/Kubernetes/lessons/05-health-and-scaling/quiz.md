# Lesson 5 Quiz — Health Checks, Resources & Auto-Scaling

Answer each question, then check against the answers at the bottom.

---

### Q1
A pod's liveness probe is failing. A pod's readiness probe is also failing on a different pod.
What does Kubernetes do to each?

---

### Q2
Your postgres container takes 90 seconds to initialize on first boot.
You have `livenessProbe` with `initialDelaySeconds: 30`, `periodSeconds: 10`, `failureThreshold: 3`.
What happens, and how do you fix it?

---

### Q3
A container has these resources:
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "200m"
  limits:
    memory: "256Mi"
    cpu: "400m"
```
a) What QoS class does this pod get?
b) The container starts using 300Mi of memory. What happens?
c) The container starts using 500m of CPU. What happens?

---

### Q4
You create an HPA with `targetCPUPercent: 50` for a deployment whose containers
have `requests.cpu: 100m`. Currently 2 replicas are running at 90% CPU each.
How many replicas will HPA scale to? Show the formula.

---

### Q5
You deploy a Helm chart with HPA enabled (`minReplicas: 2, maxReplicas: 10`).
The deployment template also has `replicas: 3`.
What problem does this cause, and how did we solve it in this lesson?
