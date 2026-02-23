# Authentication — Strengths

**Source:** InternetSecurity
**Tags:** jwt, bcrypt, session-management, web-security

**Cross-boundary reasoning between storage security and request lifecycle.** Correctly connected bcrypt's intentional slowness to the need for token-based auth — spotted that re-running password verification on every request would be a performance problem. Shows ability to reason across system boundaries (storage security ↔ request lifecycle).
