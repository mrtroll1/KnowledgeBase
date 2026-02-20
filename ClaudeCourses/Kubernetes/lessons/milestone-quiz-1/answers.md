# Milestone Quiz 1 — Answers

## Q1 — Core Objects
When you delete a Pod managed by a Deployment, the **ReplicaSet controller** (inside the controller-manager) detects that the current pod count < desired count. It creates a new Pod spec. The **scheduler** then assigns the new Pod to a node, and the **kubelet** on that node starts the container.

The chain: **Deployment** manages ReplicaSets (handles rollouts/versioning) → **ReplicaSet** maintains Pod count (the reconciliation loop) → **Pod** runs containers. The Deployment doesn't directly watch Pods — the ReplicaSet does.

## Q2 — Why Services Exist
Without Services, the frontend faces three problems:
1. **Discovery** — must know the IP addresses of all backend pods
2. **Stability** — IPs change when pods restart, frontend must track changes
3. **Load balancing** — frontend must distribute requests across replicas itself

A Service provides a single stable virtual IP + DNS name, automatically updates when pods come and go, and load-balances across all matching pods.

## Q3 — Service Types
**A) Redis cache → ClusterIP.** Internal-only traffic. NodePort wastes a port and exposes unnecessarily. LoadBalancer provisions cloud infrastructure and costs money for zero benefit.

**B) TCP game server → LoadBalancer.** External L4 traffic. ClusterIP isn't reachable from outside. NodePort works technically but requires clients to know node IPs and specific ports — fragile in production.

## Q4 — Ingress vs LoadBalancer
1. **Cost/ops problem**: 12 public IPs, 12 monthly LB bills, 12 TLS certs, 12 security surfaces — no path-based routing.
2. **Ingress fix**: One LoadBalancer → one Ingress Controller → path/host-based routing to all 12 services. One cert, one entry point.
3. **Keep LoadBalancer for**: Non-HTTP (L4) services — TCP databases, UDP streams, gRPC. Ingress only operates at L7 (HTTP/HTTPS).

## Q5 — PV/PVC/StorageClass
The PVC won't bind because **`storageClassName` doesn't match** — PVC requests `fast-ssd`, PV has `standard`.

Two fixes (without manually creating a new PV):
1. Change the PVC's `storageClassName` to `standard` to match the existing PV
2. Create a StorageClass named `fast-ssd` with dynamic provisioning, so a new PV is auto-created

## Q6 — Probes
1. **CrashLoopBackOff.** `10 + (5 × 3) = 25s` — liveness kills the container before the 45s startup completes. No readiness or startup probe to protect it.
2. **Best fix: startupProbe.** It gates liveness/readiness until the app finishes booting. Better than increasing `initialDelaySeconds` because it separates boot-time tolerance from runtime health-check frequency — clear intent, no guessing.

Note: startupProbe disables liveness during boot. ReadinessProbe (separately) controls whether the pod receives traffic.

## Q7 — Resources & QoS
1. **Pod A**: Guaranteed (requests == limits). **Pod B**: Burstable (requests < limits). **Pod C**: BestEffort (nothing set).
2. **Eviction order: C → B → A.** BestEffort first (no guarantees made), then Burstable, then Guaranteed last. Kubernetes honors commitments.
3. **Termination (OOMKill).** 520Mi exceeds the 512Mi limit. Memory can't be throttled — once allocated, the kernel can't reclaim pages without killing the process. CPU is time-sliceable (throttle); memory is not (kill).

## Q8 — HPA
1. **90%.** `(180m × 2) / (200m × 2) = 360/400 = 90%`
2. **4 replicas.** `ceil(currentReplicas × currentUtil / targetUtil) = ceil(2 × 90/50) = ceil(3.6) = 4`
3. **No — 5-minute cooldown.** Prevents flapping from short-lived spikes. Real traffic grows in sustained waves; scaling down too fast risks killing pods that will be needed again moments later.

## Q9 — Helm
1. **Without Helm**: Maintain 3 separate copies of every YAML file (or use sed/envsubst hacks). Every change must be applied to all copies. Drift is inevitable.
2. **With Helm**: One template, multiple `values-{env}.yaml` files. `helm install -f values-prod.yaml` — done. Changes propagate from a single source.
3. **Conditional HPA**: HPA requires metrics-server and adds operational complexity. Dev/test environments don't need auto-scaling. `{{- if }}` lets you toggle it per environment without maintaining separate charts.

## Q10 — ConfigMap Volume Mounts vs Env Vars
1. **Volume mount** because `nginx.conf` is a structured multi-line file. Env vars are key-value pairs — you can't stuff a 30-line config block into `$NGINX_CONF` and have nginx read it.
2. **Volume-mounted ConfigMaps update automatically** (~60s delay). **Env vars from ConfigMaps never update** — they're frozen at pod start time. (Pod restart required for env var changes.)
3. **Env vars are the right choice for simple key-value settings**: `LOG_LEVEL=debug`, `DATABASE_PORT=5432`, `FEATURE_FLAG=true` — things your app reads via `os.getenv()`.

## Q11 — Debugging 502s
Ordered steps:
1. `kubectl logs deploy/api-gateway` — check for app-level errors or crash output
2. `kubectl get endpoints api-gateway` — is the Service wired to any pods? Empty endpoints = label/selector mismatch
3. `kubectl describe ingress` — does the path rule point to the correct service name and port?
4. `kubectl get events -n <namespace>` — any warnings from the Ingress controller about misconfiguration?
5. `helm rollback` if needed, then inspect `git diff` between versions

The most commonly missed step: **checking endpoints**. A pod can be Running and Ready but still unreachable if the Service selector doesn't match.

## Q12 — Namespaces & DNS
1. `profiles-service` — same namespace, just the service name
2. `monitoring-agent.observability` — cross-namespace, `name.namespace`
3. **Flat names would collide.** Two teams could both name their service `api` in different namespaces. The structured DNS (`name.namespace.svc.cluster.local`) prevents conflicts while keeping same-namespace calls simple.
