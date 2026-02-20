A kubernetes introductory course to complete with Claude Code.

## Prerequisites

Tools to have installed:
 - claude
 - kubectl
 - docker
 - minikube
 - helm

## Quick Start — Getting Minikube Running

### 1. Start the cluster

```bash
minikube start
```

### 2. Enable the addons

```bash
minikube addons enable ingress
minikube addons enable metrics-server
```

### 3. Ensure `/etc/hosts` has the sparks.local entry

```bash
# Check if the entry exists:
grep sparks.local /etc/hosts

# If missing, add it:
sudo sh -c 'echo "127.0.0.1 sparks.local" >> /etc/hosts'
```

### 4. Start the tunnel (keep this terminal open)

```bash
minikube tunnel
```

> `minikube tunnel` creates a network route from your Mac to the cluster's
> LoadBalancer IPs and ClusterIPs.  The Ingress controller gets an external IP
> through this tunnel, which lets `sparks.local` resolve to it via your
> `/etc/hosts` entry.  You'll be prompted for your password (it modifies
> routing tables).

---

## Deploying Sparks — Without Helm (plain manifests)

```bash
kubectl apply -f lessons/04-hands-on-dating-app/sparks/namespace.yaml
kubectl apply -f lessons/04-hands-on-dating-app/sparks/
```

To tear down:
```bash
kubectl delete namespace sparks
```

## Deploying Sparks — With Helm

```bash
# Production (default values)
helm install sparks lessons/04-hands-on-dating-app/sparks-helm/

# Or staging
helm install sparks-staging lessons/04-hands-on-dating-app/sparks-helm/ \
  -f lessons/04-hands-on-dating-app/sparks-helm/values-staging.yaml
```

To tear down:
```bash
helm uninstall sparks          # or sparks-staging
kubectl delete namespace sparks  # helm doesn't delete namespaces it created
```

## Verify everything works

```bash
# All pods running?
kubectl get pods -n sparks

# Ingress has an address?
kubectl get ingress -n sparks

# Hit the frontend (with tunnel running)
curl http://sparks.local/
```


