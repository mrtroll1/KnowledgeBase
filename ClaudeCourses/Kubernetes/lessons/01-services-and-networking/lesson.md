# Lesson 1: Services & Networking

## The Problem — Why Do We Need Services?

Imagine you have 3 replicas of your `api-server` pod. Kubernetes assigned them IPs:

```
api-server-abc    →  10.244.1.5
api-server-def    →  10.244.2.8
api-server-ghi    →  10.244.1.12
```

Your `frontend` pod needs to talk to the API. Which IP does it use?

**Without Services**, you'd have to:
- Hardcode one of those IPs
- Hope that pod never dies
- If it dies and restarts, it gets a NEW IP → your frontend is broken
- Manually track which pods are healthy
- Build your own load balancing

**With a Service**, Kubernetes gives you:
- A **single stable IP and DNS name** (e.g., `api-server.default.svc.cluster.local`)
- **Automatic load balancing** across all matching pods
- **Automatic updates** — pods die, new ones appear, the Service just knows

Think of a Service as a **receptionist desk** in front of a department. People come and go in the department, but the desk number never changes and someone always picks up the phone.

---

## How Services Find Pods — Labels & Selectors

Services don't know pod names. They use **labels** — key-value tags you stick on pods.

```yaml
# In your Deployment manifest
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server        # ← Deployment finds its pods by this label
  template:
    metadata:
      labels:
        app: api-server      # ← every pod gets this label
        version: v2          # ← you can add as many labels as you want
    spec:
      containers:
      - name: api
        image: my-api:2.0
        ports:
        - containerPort: 8080
```

```yaml
# The Service manifest
apiVersion: v1
kind: Service
metadata:
  name: api-server           # ← this becomes the DNS name
spec:
  selector:
    app: api-server          # ← "send traffic to any pod with this label"
  ports:
  - port: 80                 # ← port the Service listens on
    targetPort: 8080         # ← port the container actually listens on
```

The selector `app: api-server` matches the label on the pods. Any pod with that label gets traffic. Pod dies, new pod with that label appears → Service picks it up automatically.

**Without labels**, you'd need some kind of pod registry, health check system, and discovery mechanism — essentially rebuilding what Kubernetes already gives you.

---

## The Three Service Types

```
                    ┌─────────────────────────────────────────────┐
                    │              The Cluster                     │
                    │                                             │
  EXTERNAL          │    ┌──────────┐                             │
  TRAFFIC           │    │  Pod A   │                             │
     │              │    └────▲─────┘                             │
     │              │         │                                   │
     ▼              │    ┌────┴──────────┐                        │
 ┌───────┐  ┌──────►│   │   Service     │◄────── Other Pods      │
 │  LB   │  │      │    │  10.96.0.15   │   (inside cluster)     │
 └───┬───┘  │      │    └────┬──────────┘                        │
     │      │      │         │                                   │
     ▼      │      │    ┌────▼─────┐                             │
 ┌───────┐  │      │    │  Pod B   │                             │
 │ Node  ├──┘      │    └──────────┘                             │
 │:30080 │         │                                             │
 └───────┘         └─────────────────────────────────────────────┘

 LoadBalancer        NodePort            ClusterIP
 (Layer 3)          (Layer 2)           (Layer 1 — default)
```

### 1. ClusterIP (the default)

```yaml
spec:
  type: ClusterIP       # ← or just omit type entirely, this is the default
```

- Gets a virtual IP **only reachable from inside the cluster**
- Other pods call it by DNS name: `api-server.default.svc.cluster.local` (or just `api-server` if in the same namespace)
- **Use case**: backend services that only other pods need to reach (databases, internal APIs, caches)

**Without ClusterIP**, every pod would need to discover other pods' individual IPs and handle failover — you'd be building your own service mesh.

### 2. NodePort

```yaml
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080      # ← optional, k8s picks one from 30000-32767 if omitted
```

- Everything ClusterIP does, **plus** opens a port on **every node** in the cluster
- You can hit `<any-node-ip>:30080` from outside the cluster
- **Use case**: development, quick demos, when you don't have a cloud load balancer

**Without NodePort**, you'd have to set up manual port forwarding or iptables rules on each node — and update them every time a pod moves.

### 3. LoadBalancer

```yaml
spec:
  type: LoadBalancer
```

- Everything NodePort does, **plus** provisions a cloud load balancer (AWS ELB, GCP LB, etc.)
- Gets a real external IP
- **Use case**: production services that need to be reachable from the internet

**Without LoadBalancer**, you'd have to manually create a cloud LB, point it at your NodePorts, update it when nodes change — defeating the purpose of automation.

---

## DNS — How Pods Find Services By Name

Kubernetes runs an internal DNS server (CoreDNS). Every Service automatically gets a DNS entry:

```
<service-name>.<namespace>.svc.cluster.local
```

In practice:

```bash
# From a pod in the SAME namespace ("default"):
curl http://api-server              # ← just the name works

# From a pod in a DIFFERENT namespace:
curl http://api-server.default      # ← need the namespace

# The fully qualified domain name (always works):
curl http://api-server.default.svc.cluster.local
```

**Without DNS**, your app config would be littered with IPs like `10.96.0.15` — and those change when you recreate the Service. DNS means your code says `http://api-server:80` and Kubernetes resolves it.

---

## Traffic Flow — Putting It All Together

What happens when `frontend` pod calls `http://api-server:80`?

```
1. frontend pod                    "I need api-server:80"
       │
       ▼
2. CoreDNS                         resolves api-server → 10.96.0.15 (ClusterIP)
       │
       ▼
3. kube-proxy (iptables/IPVS)      intercepts traffic to 10.96.0.15
       │                           picks a healthy backend pod
       ▼
4. One of the api-server pods      10.244.1.5:8080 (the real pod IP)
```

**kube-proxy** is the unsung hero here. It runs on every node and maintains routing rules so traffic to the Service IP gets forwarded to an actual pod. You never interact with it directly — it just works.

---

## Quick Reference — When to Use What

| Scenario | Service Type |
|---|---|
| Pod A talks to Pod B inside the cluster | **ClusterIP** |
| You need to access a pod from your laptop during dev | **NodePort** |
| Users on the internet need to reach your app | **LoadBalancer** |
| HTTP routing with paths/domains (e.g., `/api` → service A, `/web` → service B) | **Ingress** (next lesson) |

---

## Key Takeaways

1. **Pods are ephemeral, Services are stable** — never rely on pod IPs directly
2. **Labels are the glue** — Services find pods through label selectors, not names or IPs
3. **ClusterIP is the default** and the most common — start there unless you need external access
4. **DNS is automatic** — just use the Service name as a hostname in your code
5. **The three types are layers** — LoadBalancer builds on NodePort, which builds on ClusterIP
