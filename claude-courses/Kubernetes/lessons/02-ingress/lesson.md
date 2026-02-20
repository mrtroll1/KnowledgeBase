# Lesson 2: Ingress

## The Problem — Why Not Just Use LoadBalancer Services?

You have three microservices that need to be reachable from the internet:

```
api.myapp.com/users    →  users-service
api.myapp.com/orders   →  orders-service
myapp.com              →  frontend-service
```

**Without Ingress**, you'd create a LoadBalancer Service for each:

```
users-service    →  LoadBalancer  →  external IP 1  →  $$$
orders-service   →  LoadBalancer  →  external IP 2  →  $$$
frontend-service →  LoadBalancer  →  external IP 3  →  $$$
```

Three cloud load balancers. Three public IPs. Three monthly bills. Three SSL certificates to manage. And you still can't do path-based routing (`/users` vs `/orders`) at the LB level — that's Layer 4 (TCP), not Layer 7 (HTTP).

**With Ingress**, you get ONE entry point that routes based on HTTP rules:

```
                         ┌─► users-service (ClusterIP)
                         │
internet ──► Ingress ────┼─► orders-service (ClusterIP)
             (1 LB)      │
                         └─► frontend-service (ClusterIP)
```

One load balancer. One IP. One place for TLS. HTTP-aware routing. Much cheaper, much cleaner.

---

## Two Pieces: Ingress Resource + Ingress Controller

This is the part that confuses most people. Ingress has **two separate components**:

### 1. Ingress Resource (the rules)

A YAML manifest — just a set of routing rules. By itself, it does **nothing**. It's like writing traffic signs without anyone to enforce them.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
spec:
  rules:
  - host: api.myapp.com
    http:
      paths:
      - path: /users
        pathType: Prefix
        backend:
          service:
            name: users-service
            port:
              number: 80
      - path: /orders
        pathType: Prefix
        backend:
          service:
            name: orders-service
            port:
              number: 80
  - host: myapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### 2. Ingress Controller (the engine)

A pod running inside your cluster that actually **reads the Ingress rules and enforces them**. It's a reverse proxy (like Nginx, Traefik, or HAProxy) that watches for Ingress resources and configures itself accordingly.

**Kubernetes does NOT ship with an Ingress Controller.** You have to install one yourself. This is a common gotcha — people create Ingress resources and wonder why nothing works.

```
Without controller:   Ingress YAML exists → nothing happens
With controller:      Ingress YAML exists → controller reads it → configures routing → traffic flows
```

Popular Ingress Controllers:
- **nginx-ingress** — most common, battle-tested
- **Traefik** — auto-discovery, good for dynamic environments
- **AWS ALB Ingress Controller** — native AWS Application Load Balancer integration
- **Istio Gateway** — if you're in the service mesh world

---

## How Traffic Flows Through Ingress

```
 User's browser
      │
      │  https://api.myapp.com/users
      ▼
 ┌──────────────┐
 │  Cloud LB     │  ← provisioned by the Ingress Controller
 │  (1 public IP)│
 └──────┬───────┘
        │
        ▼
 ┌──────────────────────────────────────────────────┐
 │  Cluster                                          │
 │                                                   │
 │  ┌────────────────────┐                           │
 │  │  Ingress Controller │  ← reads Ingress rules   │
 │  │  (nginx pod)        │  ← acts as reverse proxy │
 │  └────────┬───────────┘                           │
 │           │                                       │
 │           │  host: api.myapp.com                  │
 │           │  path: /users → users-service         │
 │           │  path: /orders → orders-service       │
 │           │                                       │
 │           ▼                                       │
 │  ┌─────────────────┐                              │
 │  │  users-service   │  ← regular ClusterIP        │
 │  │  (ClusterIP)     │                              │
 │  └────────┬────────┘                              │
 │           │                                       │
 │           ▼                                       │
 │  ┌─────────────────┐                              │
 │  │  users-pod       │                              │
 │  └─────────────────┘                              │
 │                                                   │
 └───────────────────────────────────────────────────┘
```

Notice something important: the backend services are **ClusterIP** — not NodePort, not LoadBalancer. The Ingress Controller is the only thing that needs external access. Everything behind it stays internal. This is both cheaper and more secure.

---

## TLS / HTTPS

Ingress is also where you terminate TLS. Instead of each service managing its own certificates:

**Without Ingress TLS**: each service handles HTTPS → 3 certs to manage, renew, and configure inside your app code.

**With Ingress TLS**: one place, one cert (or one per domain), your app just speaks plain HTTP internally.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
spec:
  tls:
  - hosts:
    - myapp.com
    - api.myapp.com
    secretName: myapp-tls-secret    # ← a Kubernetes Secret holding the cert + key
  rules:
    # ... same rules as before
```

The certificate lives in a Kubernetes Secret. The Ingress Controller picks it up and terminates TLS. Your pods never see HTTPS — they just receive plain HTTP from the controller.

```
Browser ──HTTPS──► Ingress Controller ──HTTP──► ClusterIP Service ──► Pod
          (encrypted)                   (plain, inside cluster)
```

---

## Ingress vs LoadBalancer Service — When to Use Which

| | LoadBalancer Service | Ingress |
|---|---|---|
| **Layer** | L4 (TCP/UDP) | L7 (HTTP/HTTPS) |
| **Routing** | One service per LB | Many services behind one LB |
| **Path-based routing** | No | Yes (`/api`, `/web`) |
| **Host-based routing** | No | Yes (`api.myapp.com`, `myapp.com`) |
| **TLS termination** | At the LB or in the app | At the Ingress Controller |
| **Cost** | One cloud LB per service | One cloud LB total |
| **Use case** | Non-HTTP (gRPC, TCP, databases) | HTTP/HTTPS web traffic |

Rule of thumb: **If it speaks HTTP, use Ingress. If it's raw TCP/UDP, use LoadBalancer.**

---

## Key Takeaways

1. **Ingress = routing rules + controller** — the YAML alone does nothing without a controller running in the cluster
2. **One entry point, many services** — path and host-based routing replaces multiple LoadBalancers
3. **Backend services stay ClusterIP** — Ingress is the single external-facing component
4. **TLS in one place** — terminate HTTPS at the Ingress, services speak plain HTTP internally
5. **You must install a controller** — Kubernetes doesn't include one out of the box (nginx-ingress is the most common choice)
