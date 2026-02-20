# Sparks — Dating Matching App

## Architecture

```
                    ┌─────────────────────────────────────────────────────┐
                    │                  Cluster (minikube)                  │
                    │                  namespace: sparks                   │
                    │                                                     │
  Users ──HTTPS──►  │  ┌──────────────────────┐                           │
                    │  │   Ingress Controller   │                          │
                    │  │   (minikube addon)     │                          │
                    │  └──────────┬─────────────┘                         │
                    │             │                                       │
                    │    sparks.local/           sparks.local/api/        │
                    │             │                      │                │
                    │             ▼                      ▼                │
                    │  ┌──────────────┐      ┌───────────────┐           │
                    │  │   frontend   │      │   api-gateway  │           │
                    │  │   (nginx +   │      │   (Node.js)    │           │
                    │  │    React)    │      │                │           │
                    │  │   2 replicas │      │   2 replicas   │           │
                    │  └──────────────┘      └───────┬───────┘           │
                    │                                │                   │
                    │                    ┌───────────┼───────────┐       │
                    │                    ▼           ▼           ▼       │
                    │          ┌──────────┐  ┌───────────┐  ┌────────┐  │
                    │          │ profiles │  │  matcher   │  │ redis  │  │
                    │          │ service  │  │  service   │  │        │  │
                    │          │(Node.js) │  │ (Node.js)  │  │ cache +│  │
                    │          │          │  │            │  │ pub/sub│  │
                    │          │2 replicas│  │ 1 replica  │  │        │  │
                    │          └────┬─────┘  └─────┬─────┘  └────────┘  │
                    │               │              │                     │
                    │               ▼              ▼                     │
                    │          ┌─────────────────────┐                   │
                    │          │     PostgreSQL       │                   │
                    │          │     (1 replica)      │                   │
                    │          │     + PVC            │                   │
                    │          └─────────────────────┘                   │
                    │                                                     │
                    └─────────────────────────────────────────────────────┘
```

## Services Breakdown

| Service | Role | Why it exists |
|---|---|---|
| **frontend** | Serves React SPA | Static files via nginx |
| **api-gateway** | Public-facing API, auth, request routing | Single entry point for all API calls |
| **profiles-service** | User profiles CRUD, photo management | Domain separation — profiles are their own concern |
| **matcher-service** | Matching algorithm, swipe logic, match storage | Core business logic, isolated for independent scaling |
| **redis** | Session cache, online-status pub/sub | Fast ephemeral data (who's online, rate limiting) |
| **postgres** | User data, profiles, matches, messages | Durable relational data |

## Kubernetes Concepts Exercised

| Concept | Where it appears |
|---|---|
| Deployments + ReplicaSets | Every service |
| Services (ClusterIP) | All internal communication |
| Ingress | External HTTP routing |
| PersistentVolumeClaim | PostgreSQL data |
| Secrets | DB credentials, API keys |
| ConfigMaps | App configuration (feature flags, service URLs) |
| Namespaces | Everything in `sparks` namespace |
| Probes | Liveness + readiness on each service |
| Resource limits | CPU/memory per container |

## Build Order

1. Local cluster setup (minikube)
2. Namespace + secrets + configmap
3. PostgreSQL + PVC
4. Redis
5. profiles-service
6. matcher-service
7. api-gateway
8. frontend
9. Ingress
10. Probes + resource limits
