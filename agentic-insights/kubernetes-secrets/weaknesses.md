# Kubernetes Secrets — Weaknesses

**Source:** Kubernetes
**Tags:** kubernetes, security, secrets

- Conflates runtime delivery risks with storage risks — when asked about env var exposure via `kubectl exec`, jumped to "secrets in source code" instead of focusing on env-var-specific risks (child process inheritance, log leakage, frozen at pod start).
- Incorrectly believes Kubernetes cannot encrypt Secrets at rest — said "no data is encrypted by kube" when in fact `EncryptionConfiguration` provides real AES encryption in etcd; it's just opt-in. Needs to internalize that base64 != the full story of K8s secret encryption capabilities.
