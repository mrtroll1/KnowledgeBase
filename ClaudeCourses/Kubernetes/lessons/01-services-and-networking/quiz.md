# Lesson 1: Services & Networking — Quiz

## Q1
You have a pod `payment-service` with 3 replicas. Another pod `checkout` needs to call it. Why can't `checkout` just use the IP of one of the `payment-service` pods directly?

---

## Q2
Here's a Service manifest. What's wrong with it — why will it route traffic to **zero** pods?

```yaml
# Service
apiVersion: v1
kind: Service
metadata:
  name: payment
spec:
  selector:
    app: payment-svc
  ports:
  - port: 443
    targetPort: 3000
```

```yaml
# Deployment (abbreviated)
spec:
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
      - name: payment
        ports:
        - containerPort: 3000
```

---

## Q3
You have two services: `auth` in namespace `security`, and `webapp` in namespace `default`. How does `webapp` call `auth`?

---

## Q4
Your team is building an internal microservice that only other pods in the cluster will ever call. Your colleague suggests using `type: LoadBalancer`. Why is that overkill, and what should they use instead?

---

## Q5
ClusterIP, NodePort, LoadBalancer — are these three completely separate mechanisms, or is there a relationship between them?
