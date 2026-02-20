# Lesson 2: Ingress — Quiz

## Q1
You join a team. They've deployed an Ingress resource with routing rules, but external traffic isn't reaching any services. The LoadBalancer Service exists and has an external IP. What's the most likely thing they forgot?

---

## Q2
Your cluster has 12 HTTP microservices that all need to be reachable from the internet. A junior engineer proposes creating a LoadBalancer Service for each. What's your argument against this?

---

## Q3
A user visits `https://myapp.com/api/health`. Which service handles it? What about `https://api.myapp.com/health`?

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
  - host: myapp.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.myapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 8080
```

---

## Q4
The backend services in the manifest above — should they be ClusterIP, NodePort, or LoadBalancer? Why?

---

## Q5
Your app currently terminates TLS inside each pod (each service has its own cert). You're migrating to Ingress. What changes for your pods?
