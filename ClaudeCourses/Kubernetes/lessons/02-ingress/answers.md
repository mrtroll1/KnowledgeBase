# Lesson 2: Ingress — Answers

## Q1
No Ingress Controller installed. The LoadBalancer gets traffic into the cluster, but there's no pod (nginx, Traefik, etc.) to read the Ingress rules and actually route that traffic to services. Traffic arrives, nobody's home.

## Q2
12 LoadBalancers = 12 public IPs, 12 monthly cloud LB bills, 12 TLS certs to manage, 12 external entry points (security headache), and no path-based routing. One Ingress with one LoadBalancer handles all 12 services — cheaper, simpler, more secure.

## Q3
`myapp.com/api/health` matches host `myapp.com`, path `/api` (Prefix) → `backend-service`. `api.myapp.com/health` matches host `api.myapp.com`, path `/` → `api-gateway`.

## Q4
ClusterIP. They sit behind the Ingress Controller — no need for external exposure. Only the Ingress Controller faces the outside world.

## Q5
Pods no longer handle TLS. The Ingress Controller terminates HTTPS, forwarding plain HTTP internally. Pods switch from listening on 443 with a cert to listening on a plain HTTP port. One place for TLS instead of N.
