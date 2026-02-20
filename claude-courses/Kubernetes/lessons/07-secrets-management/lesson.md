# Lesson 7 — Secrets Management

## The Problem You Already Have

Look at your Sparks chart's `secrets.yaml`:

```yaml
stringData:
  POSTGRES_USER: sparks_admin
  POSTGRES_PASSWORD: sup3rs3cret
  POSTGRES_DB: sparks_db
```

And your `values.yaml`:

```yaml
postgres:
  credentials:
    password: sup3rs3cret
```

This is checked into git. Anyone with repo access sees the password in plaintext. Every clone, every fork, every backup contains it. Even after you rotate the password, `git log` shows the old one forever.

This is not a theoretical risk — it's the #1 cause of credential leaks in real companies.

---

## Kubernetes Secrets: What They Are (and Aren't)

### Base64 Is NOT Encryption

When you create a Secret, Kubernetes stores it like this:

```yaml
apiVersion: v1
kind: Secret
data:
  POSTGRES_PASSWORD: c3VwM3JzM2NyZXQ=    # base64 of "sup3rs3cret"
```

```bash
$ echo "c3VwM3JzM2NyZXQ=" | base64 -d
sup3rs3cret
```

That's it. Base64 is an **encoding** (like converting to hex), not encryption. Anyone who can `kubectl get secret -o yaml` sees your password. This is Kubernetes's biggest security misconception.

### So Why Does the Secret Object Exist?

Without Secrets, you'd put credentials directly in ConfigMaps, Deployment manifests, or environment variables — mixed in with regular config. Secrets exist for **separation of concerns**, not for security by themselves:

| Feature | ConfigMap | Secret |
|---------|-----------|--------|
| Stored in etcd | Plaintext | Base64 (plaintext by default, encryptable) |
| Visible in `kubectl describe pod` | Yes | **No** — env vars from Secrets are hidden |
| Can be encrypted at rest | No | **Yes** — with `EncryptionConfiguration` |
| RBAC-separable | Yes | **Yes** — you can allow access to ConfigMaps but deny Secrets |
| Mounted as files | `644` permissions | **`600` permissions** (owner-read only) |

The Secret object is a **hook** for security policies. By itself it's just base64. Combined with RBAC + encryption at rest + external secret managers, it becomes secure.

---

## Three Ways to Get Secrets Into Pods

### 1. Environment Variables (What You're Using Now)

```yaml
envFrom:
- secretRef:
    name: db-credentials
```

**Pros**: Simple, works with any app that reads `process.env` or `os.getenv()`
**Cons**:
- Frozen at pod start (you learned this in the milestone quiz!)
- Visible in `kubectl exec <pod> -- env`
- Can leak into logs if the app prints environment
- Child processes inherit all env vars

### 2. Volume Mounts (More Secure)

```yaml
volumeMounts:
- name: db-creds
  mountPath: /etc/secrets
  readOnly: true
volumes:
- name: db-creds
  secret:
    secretName: db-credentials
```

This creates files in the pod:
```
/etc/secrets/POSTGRES_USER       → contains "sparks_admin"
/etc/secrets/POSTGRES_PASSWORD   → contains "sup3rs3cret"
/etc/secrets/POSTGRES_DB         → contains "sparks_db"
```

**Pros**:
- Auto-updates when the Secret changes (~60s, same as ConfigMaps!)
- Mounted with `600` permissions (more restrictive)
- Not visible in `kubectl exec -- env`
- Won't leak to child processes

**Cons**: App must read files instead of env vars (small code change)

### 3. Hybrid: Volume Mount + Env Var from File

Some apps only read env vars. You can mount the secret as a file and source it:

```yaml
command:
- sh
- -c
- |
  export POSTGRES_PASSWORD=$(cat /etc/secrets/POSTGRES_PASSWORD)
  exec myapp
```

Gets you auto-update capability while keeping env-var compatibility.

---

## The Real Problem: Secrets in Git

All three approaches above solve **runtime** delivery. But the actual danger is **storage** — your passwords live in `values.yaml` in plaintext, committed to git.

### The Spectrum of Solutions

```
Least secure                                              Most secure
────────────────────────────────────────────────────────────────────
Plaintext       Sealed          External Secrets    Vault/Cloud
in git          Secrets         Operator            KMS direct
(you now)       (encrypted      (fetched at         (never in
                in git)         deploy time)        cluster)
```

### Option A: Sealed Secrets (Good Starting Point)

**How it works:**

```
Developer                    Cluster
─────────                    ───────
1. Write a regular Secret
2. Encrypt it with kubeseal    →   SealedSecret controller
   (uses cluster's public key)      decrypts with private key
3. Commit encrypted blob            creates real Secret
   to git (safe!)                   pods use it normally
```

```bash
# Install sealed-secrets controller in cluster
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system

# Encrypt your secret (only this cluster can decrypt it)
kubeseal --format yaml < my-secret.yaml > my-sealed-secret.yaml

# The sealed version looks like this — safe to commit:
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: db-credentials
spec:
  encryptedData:
    POSTGRES_PASSWORD: AgA3j8f...long encrypted blob...k2Qx
```

**A/B comparison:**

| | Without Sealed Secrets | With Sealed Secrets |
|--|----------------------|---------------------|
| In git | `password: sup3rs3cret` | `AgA3j8f...encrypted...k2Qx` |
| Decryptable by | Anyone with repo access | Only the cluster's private key |
| Rotation | Change value, commit, pray nobody saw | Change value, re-seal, commit |
| New developer joins | Sees all passwords day one | Sees encrypted blobs, can't decrypt |

### Option B: External Secrets Operator (Production Standard)

Instead of storing secrets in git at all, fetch them from an external vault at deploy time:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h                    # Re-fetch every hour
  secretStoreRef:
    name: aws-secrets-manager
  target:
    name: db-credentials                 # Creates this K8s Secret
  data:
  - secretKey: POSTGRES_PASSWORD
    remoteRef:
      key: sparks/production/db-password  # Path in AWS Secrets Manager
```

**The secret never touches git.** It lives in AWS Secrets Manager / HashiCorp Vault / GCP Secret Manager, and the operator syncs it into the cluster as a regular Kubernetes Secret.

```
AWS Secrets Manager          Cluster
───────────────────          ───────
sparks/prod/db-password  →   ExternalSecret operator
                              polls every 1h
                              creates/updates K8s Secret
                              pods use it normally
```

### Option C: Direct Vault Integration (Maximum Security)

The app itself talks to Vault at startup, no Kubernetes Secret ever created:

```
Pod starts → Vault sidecar → authenticates with Vault → injects secrets → app reads them
```

Most complex, most secure. The secret exists only in memory, never on disk.

---

## Choosing the Right Approach

```
Is this a learning/personal project?
  │
  ├── Yes → Plaintext in values.yaml is fine (what you have now)
  │
  └── No → Is this a small team with a simple setup?
              │
              ├── Yes → Sealed Secrets (encrypted in git, easy to adopt)
              │
              └── No → Do you already have AWS/GCP/Azure?
                          │
                          ├── Yes → External Secrets Operator + cloud KMS
                          │
                          └── No → HashiCorp Vault + sidecar injection
```

---

## Practical Tips

### 1. Never Log Secrets

```python
# BAD — this prints the password to stdout (and therefore kubectl logs)
print(f"Connecting to {os.getenv('DATABASE_URL')}")

# GOOD — redact sensitive parts
print(f"Connecting to postgres at {os.getenv('DB_HOST')}:5432")
```

### 2. Separate Secret RBAC from ConfigMap RBAC

```yaml
# Allow devs to read ConfigMaps but NOT Secrets
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["secrets"]
  verbs: []                      # No access to secrets
```

This is why Secrets exist as a separate object type — so RBAC can differentiate.

### 3. Rotate Secrets Without Downtime

With volume-mounted secrets:
1. Update the Secret (`kubectl apply` or operator syncs)
2. Kubelet updates the mounted file within ~60s
3. If your app watches the file → zero-downtime rotation
4. If your app only reads at startup → rolling restart: `kubectl rollout restart deployment/myapp`

With env var secrets:
1. Update the Secret
2. Nothing happens (frozen at pod start)
3. Must restart pods: `kubectl rollout restart deployment/myapp`

This is the same ConfigMap behavior from Q10 of the milestone quiz — and now you know why volume mounts are preferred for secrets that might need rotation.

---

## Connecting to What You Know

| You learned... | Now you know... |
|---------------|-----------------|
| ConfigMap volume mounts auto-update (Milestone Q10) | Secret volume mounts do too — and that's key for rotation |
| ConfigMap env vars freeze at pod start (Milestone Q10) | Same for Secret env vars — another reason to prefer mounts |
| `values.yaml` stores config (Lesson 4) | Passwords in values.yaml = passwords in git. Sealed Secrets or External Secrets fix this |
| RBAC is a gap (outcome.md) | Secrets are a major reason RBAC exists — separating who can see config vs credentials |
| hostPath is for node-local data (Lesson 6) | Vault sidecar injection avoids writing secrets to disk entirely — they exist only in memory |
