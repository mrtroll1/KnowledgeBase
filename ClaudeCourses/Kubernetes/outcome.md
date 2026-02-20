# Kubernetes Learning — Outcome Tracker

## Solid Understanding
- **Cluster architecture**: Knows pods run on nodes, control plane components (scheduler, controller manager, etcd), master vs worker node distinction
- **Core objects**: Understands relationship chain: Containers → Pods → ReplicaSets → Deployments
- **Declarative config**: Knows manifests are YAML, applied via kubectl
- **ConfigMaps**: Knows they mount config data into pods
- **Namespaces**: Good intuition — isolation, structure, permissions
- **Probes (hands-on)**: Understands liveness (restart), readiness (remove from traffic), and startupProbe (gate for slow-starting apps like postgres). Experienced postgres getting killed by liveness before startup finished — fixed with startupProbe
- **Helm**: Aware it's a package manager, reduces boilerplate. Understands conditional templating (`{{- if }}`) for feature flags like autoscaling on/off
- **Resource requests & limits**: Understands requests = scheduler placement + HPA baseline, limits = hard ceiling. Knows memory breach = OOMKill, CPU breach = throttle. Triggered a real OOMKill with 6Mi limit on nginx
- **QoS classes**: Knows Guaranteed (requests==limits), Burstable (requests<limits), BestEffort (none set) and eviction priority
- **HPA**: Understands the metrics-server → HPA controller → Deployment loop, the scaling formula, and why scale-down has a 5-minute cooldown. Saw it react to load and stabilize
- **ConfigMap volume mounts**: Used ConfigMaps to inject custom nginx configs, replacing default behavior without building images
- **Services**: Understands why pod IPs aren't reliable, the role of labels/selectors, all 3 types (ClusterIP, NodePort, LoadBalancer) and when to use each
- **Service DNS**: Knows same-namespace (just name) vs cross-namespace (name.namespace) resolution
- **Service type layering**: Understands LoadBalancer ⊃ NodePort ⊃ ClusterIP (nesting, not separate mechanisms)
- **kube-proxy**: Understands it maintains routing rules on each node to forward Service IP traffic to pods
- **Ingress**: Understands the two-piece model (Resource + Controller), why it replaces N LoadBalancers with 1, path/host-based routing, TLS termination
- **Ingress vs LoadBalancer**: Knows L7 (HTTP) → Ingress, L4 (TCP/UDP) → LoadBalancer Service
- **Ingress as pattern**: Understands Ingress is a standardized reverse-proxy pattern, not a new invention
- **PV/PVC/StorageClass**: Understands the three-layer model — PV is the physical disk, PVC is the developer's request, StorageClass automates PV creation
- **PVC mounting**: Knows the volumes + volumeMounts wiring pattern (same as ConfigMaps)
- **Reclaim policies**: Knows Retain for production, Delete for dev/test
- **hostPath limitations**: Understands it's node-local and breaks on multi-node clusters
- **Debugging methodology**: Can systematically troubleshoot (logs → endpoints → ingress → events → rollback)
- **Workload type selection**: Strong intuition for when to use Deployment vs StatefulSet vs DaemonSet vs Job vs CronJob. Understands the decision tree (continuous vs run-to-completion, identity needed vs not, per-node vs replicated)
- **DaemonSet**: Understands one-per-node guarantee, auto-scheduling on new nodes, and why hostPath is appropriate here (node↔pod bijection)
- **Job/CronJob**: Understands run-to-completion semantics, restartPolicy: Never, backoffLimit, and CronJob's concurrencyPolicy: Forbid
- **"Everything is pods"**: Grasps that all workload types are just different controllers answering "under what conditions should this pod exist?"
- **Migration architecture**: Understands that in production, migrations use the app's own image + framework CLI (one-liner), not custom scripts. Knows one service should own the DB schema

## Refined After Milestone Quiz 1
- **Deployment vs ReplicaSet responsibility**: Now clearer that ReplicaSet (not Deployment) does the pod reconciliation loop. Deployment manages ReplicaSets, ReplicaSet manages Pods
- **Scheduler vs controller-manager**: Clarified that the scheduler assigns pods to nodes; the ReplicaSet controller (in controller-manager) detects missing pods and creates replacements
- **L4 vs L7 distinction**: Reinforced — Ingress = HTTP only. Non-HTTP traffic (TCP/UDP) still needs LoadBalancer Service. Knew it from Lesson 2 but didn't recall under pressure
- **ConfigMap update behavior**: Learned that volume-mounted ConfigMaps auto-update (~60s), env vars from ConfigMaps are frozen at pod start. New knowledge
- **ConfigMap env vars vs volume mounts**: Now understands when to use each — volume for structured files, env for simple key-value settings
- **Memory vs CPU constraint model**: Sharpened — CPU is a flow (time-sliceable, throttle), memory is a pool (can't reclaim without kill). Previously understood the outcome but not the underlying reason

## Refined After Lesson 6 Quiz
- **StatefulSet PVC retention**: Learned that PVCs are NOT deleted on scale-down — safety feature so data survives scale-down/scale-up cycles. Must be manually cleaned up
- **StatefulSet serviceName**: Needs both a Headless Service object AND `serviceName` field in StatefulSet spec for stable DNS
- **Init containers vs Jobs**: Clarified that init containers run every pod start (restarts, reschedules), not just once — and they block the main container. Jobs are for truly one-time tasks
- **Job backoffLimit**: backoffLimit = retries after initial attempt, so total pods = backoffLimit + 1
- **ReplicaSets are Deployment-only**: Other workload types (StatefulSet, DaemonSet, Job) manage pods directly — no ReplicaSet middleman

## Partial / Needs Refinement
- **Containers per pod**: Thought many-to-one is the norm → clarified that 1:1 is the typical pattern (sidecars are the exception)
- **Kubelet role**: Correctly associates kubelet with pod communication, but doesn't yet see the full networking picture (Services, kube-proxy, DNS)
- **StatefulSet storage details**: Understands volumeClaimTemplates conceptually but initially thought PVCs get deleted on scale-down

## Gaps — Not Yet Covered
- **RBAC** — role-based access control
- **Observability** — logging, monitoring, metrics
- **Network Policies** — pod-to-pod traffic control
- **ConfigMap/Secret management** — sealed secrets, external-secrets, reloading on change

## Lessons Completed
- **Lesson 01 — Services & Networking**: Passed quiz (5/5 conceptually correct, minor nuances noted)
- **Lesson 02 — Ingress**: Passed quiz (5/5 correct, needs to sharpen explanations on "why" — e.g., cost/security arguments, and understanding that LB existing ≠ traffic being routed)
- **Lesson 03 — Persistent Storage**: Passed quiz (two rounds — struggled with debugging simple-cause-first and PV vs PVC distinction in round 1, much sharper in round 2. Learned that StorageClass must match for PV/PVC binding.)
- **Lesson 04 — Hands-on (Sparks dating app)**: Deployed full microservice stack on minikube — namespace, secrets, configmap, postgres+PVC, redis, profiles-service, matcher-service, api-gateway, frontend, ingress. Debugged real issues: YAML indentation (envFrom), CrashLoopBackOff (bad image args), stale Service name, minikube tunnel networking. First hands-on experience complete.
- **Lesson 05 — Health Checks, Resources & Auto-Scaling**: Evolved lesson 4 chart with custom nginx configs (ConfigMap volumes), liveness/readiness/startup probes, resource limits (triggered real OOMKill), and HPA for api-gateway. Key debugging: discovered postgres needs startupProbe because liveness kills it during slow initialization. Quiz: 4.5/5 — minor gap on runtime OOMKill behavior (thought container fails to start vs being killed when it exceeds limit at runtime).
- **Milestone Quiz 1 — Lessons 1–5 Review**: Scored 50/60 (83%). Strong across Services, HPA, Helm, QoS. Gaps identified in ConfigMap delivery mechanisms and L4/L7 recall under pressure — both addressed in review.
- **Lesson 06 — Workload Types**: Scored 41.5/55 (75.5%). Strong on DaemonSet reasoning, workload selection, CronJob concurrency. Gaps in StatefulSet PVC retention behavior, init container lifecycle, and Job backoffLimit counting. Evolved Sparks chart: postgres → StatefulSet, added migration Job, node-logger DaemonSet, match-stats CronJob.
