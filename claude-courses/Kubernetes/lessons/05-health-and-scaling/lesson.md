# Lesson 5 — Health Checks, Resource Management & Auto-Scaling

> **Starting point:** An exact copy of the Lesson 4 Helm chart lives in `sparks-helm/`.
> We'll evolve it step by step — each change builds on the previous one.

---

## Part 1 — Making Services Real (Custom nginx Configs)

### The problem

Right now every microservice is `nginx:alpine` serving the default "Welcome to nginx!" page.
That was fine for learning networking and Helm, but we can't meaningfully:

- **Probe** health — every service looks the same
- **Load-test** — there's nothing to stress
- **Debug** — `curl sparks.local/api` returns HTML, not a JSON API response

### The fix

We'll give each service its own **nginx config** mounted via ConfigMap. No Docker builds needed — just different configs producing different responses:

| Service | `GET /` | `GET /healthz` |
|---------|---------|----------------|
| frontend | HTML page | `{"status":"ok","service":"frontend"}` |
| api-gateway | `{"service":"api-gateway","routes":[...]}` | `{"status":"ok","service":"api-gateway"}` |
| profiles-service | `{"service":"profiles","version":"1.0"}` | `{"status":"ok","service":"profiles"}` |
| matcher-service | `{"service":"matcher","version":"1.0"}` | `{"status":"ok","service":"matcher"}` |

**Why `/healthz`?** It's a Kubernetes convention (like `/readyz`, `/livez`). Having a dedicated
health endpoint means probes don't interfere with real traffic — and the response can include
diagnostics without exposing them to end users.

### What we'll change

```
templates/nginx-configs.yaml   ← NEW: ConfigMap with per-service nginx.conf files
templates/frontend.yaml        ← mount the config, override default nginx.conf
templates/api-gateway.yaml     ← same
templates/profiles-service.yaml ← same
templates/matcher-service.yaml  ← same
```

---

## Part 2 — Liveness & Readiness Probes

### Why do we need them?

You learned the theory in Lesson 1. Now let's see what happens **without** them:

```
WITHOUT PROBES                          WITH PROBES
─────────────────                       ──────────────
App crashes internally                  App crashes internally
  └─ Container still running              └─ Container still running
     └─ Service keeps sending traffic        └─ livenessProbe fails
        └─ Users see 502 errors                 └─ kubelet restarts container
           └─ Nobody knows until                   └─ Users see brief blip
              someone complains                       then auto-recovery
```

And for **readiness** — the difference is even sneakier:

```
WITHOUT readinessProbe                  WITH readinessProbe
──────────────────────                  ───────────────────
Pod starts                              Pod starts
  └─ Immediately added to Service         └─ readinessProbe starts checking
     └─ Traffic arrives                      └─ NOT in Service yet
        └─ App still loading deps               └─ App finishes loading
           └─ Users see connection refused          └─ readinessProbe passes
                                                       └─ Added to Service
                                                          └─ Traffic arrives cleanly
```

### The three probe types

| Property | `livenessProbe` | `readinessProbe` | `startupProbe` |
|----------|----------------|-------------------|----------------|
| **Question it answers** | "Is the process alive?" | "Can it handle traffic?" | "Has it finished starting?" |
| **Failure action** | Kill & restart the container | Remove from Service endpoints | Kill & restart (blocks liveness/readiness until pass) |
| **When to use** | Detect deadlocks, hangs | Detect temporary overload | Slow-starting apps (e.g., JVM loading) |

### What a probe looks like

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 80
  initialDelaySeconds: 5      # wait before first check
  periodSeconds: 10            # check every 10s
  failureThreshold: 3          # 3 failures → restart

readinessProbe:
  httpGet:
    path: /healthz
    port: 80
  initialDelaySeconds: 2
  periodSeconds: 5
  failureThreshold: 2          # 2 failures → remove from Service
```

### What we'll change

Add `livenessProbe` and `readinessProbe` to all four app deployments (frontend, api-gateway,
profiles-service, matcher-service) and a TCP probe for postgres and redis.

---

## Part 3 — Resource Requests & Limits (Deep Dive)

### The two numbers and what they actually mean

```
resources:
  requests:           # "I need at LEAST this much"
    memory: "64Mi"    #  → used by scheduler to PLACE the pod
    cpu: "100m"       #  → 100 millicores = 10% of one CPU core
  limits:             # "I must NEVER exceed this"
    memory: "128Mi"   #  → exceed → OOMKilled (container killed immediately)
    cpu: "200m"       #  → exceed → CPU throttled (slowed, not killed)
```

**Critical difference:** memory limit breach = death, CPU limit breach = slowdown.

### Why requests matter — the scheduler's perspective

```
Node A: 4 CPU, 8Gi RAM                  Node B: 4 CPU, 8Gi RAM
┌─────────────────────┐                  ┌─────────────────────┐
│ Used: 3.5 CPU, 7Gi  │                  │ Used: 1 CPU, 2Gi    │
│ Free: 0.5 CPU, 1Gi  │                  │ Free: 3 CPU, 6Gi    │
└─────────────────────┘                  └─────────────────────┘

New pod: requests 1 CPU, 2Gi
  → Node A? NO — not enough free requests
  → Node B? YES — fits comfortably
```

Without `requests`, the scheduler has no idea how much your pod needs. It might pack 50 pods
on one node and starve them all.

### QoS Classes — Kubernetes ranks your pods

| Class | Criteria | Eviction priority |
|-------|----------|-------------------|
| **Guaranteed** | requests == limits for all containers | Last to be evicted |
| **Burstable** | requests < limits (or only requests set) | Middle |
| **BestEffort** | No requests or limits at all | First to be evicted |

When a node runs low on memory, Kubernetes evicts **BestEffort** pods first, then
**Burstable**, and only kills **Guaranteed** as a last resort.

Our lesson 4 chart already sets both requests and limits (making most pods Guaranteed).
We'll examine this and experiment with the values.

---

## Part 4 — Horizontal Pod Autoscaler (HPA)

### The big idea

```
WITHOUT HPA                              WITH HPA
───────────                              ────────
replicas: 2 (forever)                    minReplicas: 1, maxReplicas: 5
  │                                        │
  ├─ Low traffic  → 2 pods (wasting $$)    ├─ Low traffic  → 1 pod (saving $$)
  ├─ Peak traffic → 2 pods (overloaded)    ├─ Peak traffic → 5 pods (handling it)
  └─ You guess    → You're wrong           └─ K8s adapts   → based on metrics
```

### How HPA works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ metrics-     │────▶│  HPA controller  │────▶│  Deployment     │
│ server       │     │                  │     │  .spec.replicas  │
│ (CPU/memory) │     │  "CPU > 50%?     │     │  = calculated    │
└─────────────┘     │   scale up!"     │     └─────────────────┘
                     └──────────────────┘
```

1. **metrics-server** collects CPU/memory from every pod (via kubelet)
2. **HPA controller** checks metrics every 15s by default
3. If average CPU > target → increase replicas
4. If average CPU < target → decrease replicas (with cooldown)

### The formula

```
desiredReplicas = ceil( currentReplicas × (currentMetric / targetMetric) )

Example: 2 pods at 80% CPU, target is 50%
  = ceil( 2 × (80 / 50) ) = ceil(3.2) = 4 pods
```

### What HPA needs to work

1. **metrics-server** must be running (`minikube addons enable metrics-server`)
2. **Resource requests** must be set on containers (HPA uses them as the 100% baseline)
3. **readinessProbe** — so new pods don't receive traffic before they're ready

This is why we did Parts 1-3 first!

### What we'll change

```
templates/hpa.yaml             ← NEW: HPA targeting api-gateway
values.yaml                    ← add autoscaling config section
```

---

## Hands-On Exercises

We'll do these together, step by step:

1. **Deploy the base chart** (copied from lesson 4) and verify everything works
2. **Add nginx configs** — make each service respond differently
3. **Add probes** — then deliberately break one and watch Kubernetes react
4. **Experiment with resources** — trigger an OOMKill by setting a tiny memory limit
5. **Enable HPA** — generate load and watch pods scale up
6. **Break things** — remove readiness probes and see how HPA behaves without them

---

## Key Commands for This Lesson

```bash
# Watch pods in real-time
kubectl get pods -n sparks -w

# See probe events
kubectl describe pod <pod-name> -n sparks

# Check resource usage (needs metrics-server)
kubectl top pods -n sparks

# See HPA status
kubectl get hpa -n sparks -w

# Generate load for HPA testing
kubectl run load-generator --image=busybox -n sparks --rm -it -- \
  sh -c "while true; do wget -q -O- http://api-gateway/healthz; done"
```
