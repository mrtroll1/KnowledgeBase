# Lesson 7 Quiz — Secrets Management

Answers are in [quiz-answers.md](quiz-answers.md) — no peeking until you're done.

---

### Q1. Why does the Secret object exist if base64 isn't encryption?

**A)** To make passwords harder to read in YAML files
**B)** To provide a hook for security policies — RBAC separation, encryption at rest, restrictive file permissions
**C)** To encrypt secrets so nobody can decode them
**D)** To compress large credential strings

---

### Q2. You run `kubectl exec my-pod -- env` and see `POSTGRES_PASSWORD=sup3rs3cret`. What delivery method was used, and what's the risk?

---

### Q3. You update a Secret that's consumed by a Deployment. In which scenario do the pods pick up the new value automatically (no restart)?

**A)** Secret mounted as a volume
**B)** Secret injected as an env var via `envFrom`
**C)** Both
**D)** Neither — Secrets never auto-update

---

### Q4. Place these secret-storage approaches in order from least to most secure:

- External Secrets Operator
- Plaintext in `values.yaml`
- Direct Vault sidecar injection
- Sealed Secrets

---

### Q5. A new developer joins your team and clones the repo. What do they see in each case?

| Approach | What the new dev sees |
|----------|----------------------|
| Plaintext in values.yaml | ? |
| Sealed Secrets | ? |
| External Secrets Operator | ? |

---

### Q6. Your app reads `POSTGRES_PASSWORD` from `process.env` and you can't change the code. You still want auto-rotation of the secret. How?

---

### Q7. You want developers to manage ConfigMaps freely but prevent them from reading Secrets. What Kubernetes mechanism makes this possible, and why couldn't you do it if secrets were stored in ConfigMaps instead?

---

### Q8. True or False: Enabling `EncryptionConfiguration` for Secrets means that `kubectl get secret -o yaml` will show encrypted data.

---

**Score yourself** (after checking answers):
- 7-8 correct: Solid grasp — you understand both the runtime and storage sides of secrets management.
- 5-6 correct: Good foundation — revisit the Sealed Secrets vs External Secrets spectrum.
- < 5: Re-read the lesson, focusing on the A/B comparisons and the decision flowchart.
