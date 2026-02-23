# Lesson 7 Quiz — Answers

---

### Q1. Answer: **B**

By itself a Secret is just base64 — anyone who can `kubectl get secret -o yaml` sees the value. The Secret object exists for **separation of concerns**: RBAC can grant ConfigMap access but deny Secret access, Secrets can be encrypted at rest via `EncryptionConfiguration`, and volume-mounted Secrets get `600` permissions vs `644` for ConfigMaps.

---

### Q2.

The secret was injected as an **environment variable** (via `envFrom` / `secretRef`). Risks:

- Visible through `kubectl exec -- env`
- Can leak into logs if the app prints its environment
- Child processes inherit all env vars
- Frozen at pod start — can't rotate without restarting the pod

Volume-mounting the secret avoids all of these.

---

### Q3. Answer: **A**

Volume-mounted secrets are updated by the kubelet within ~60 seconds (same mechanism as ConfigMaps). Environment variables are frozen at pod start — you must `kubectl rollout restart` to pick up changes.

---

### Q4.

1. **Plaintext in `values.yaml`** — passwords visible to anyone with repo access, forever in git history
2. **Sealed Secrets** — encrypted in git, only the cluster's private key can decrypt
3. **External Secrets Operator** — secrets never touch git; fetched from cloud KMS at deploy time
4. **Direct Vault sidecar injection** — secrets exist only in memory, no Kubernetes Secret object created at all

---

### Q5.

| Approach | What the new dev sees |
|----------|----------------------|
| Plaintext in values.yaml | All passwords in cleartext — full access from day one |
| Sealed Secrets | Encrypted blobs they can't decrypt (only the cluster has the private key) |
| External Secrets Operator | An `ExternalSecret` manifest pointing to a path in AWS/GCP/Vault — no secret value at all |

---

### Q6.

Use the **hybrid approach**: mount the secret as a volume file, then source it into an env var at container startup:

```yaml
command:
- sh
- -c
- |
  export POSTGRES_PASSWORD=$(cat /etc/secrets/POSTGRES_PASSWORD)
  exec myapp
```

The mounted file auto-updates when the Secret changes. However, the env var is still set once at process start — for true live rotation you'd need to restart the pod (or have the app re-read the file).

---

### Q7.

**RBAC** (Role-Based Access Control). Because Secrets and ConfigMaps are different resource types, you can write a Role that grants `get`/`list` on `configmaps` but gives **zero verbs** on `secrets`:

```yaml
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["secrets"]
  verbs: []
```

If passwords lived in ConfigMaps, RBAC couldn't distinguish "safe config" from "sensitive credentials" — anyone allowed to read config would see passwords too. This is the core reason Secrets exist as a separate object type.

---

### Q8. Answer: **False**

`EncryptionConfiguration` encrypts Secrets **at rest in etcd**. When you query the API server with `kubectl`, it decrypts the data before returning it. Anyone with RBAC access to read Secrets still sees the base64 value. Encryption at rest protects against someone accessing the etcd database directly (backup tapes, disk theft, etcd compromise).
