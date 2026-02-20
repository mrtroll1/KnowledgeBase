# Software Architecture — Weaknesses

**Source:** ChatDHD
**Tags:** architecture, microservices, DDD, system-design, resilience, observability

**Missing resilience patterns.** No circuit breakers, retry logic, or bulkhead isolation in service gateways. The main API makes synchronous HTTP calls to downstream services (some with 90-second timeouts) — a single slow service cascades failures to all users. This is the biggest gap between the clean domain architecture and production readiness.

**Weak inter-service authentication.** A single shared `SERVICE_SECRET` across all services means one compromise exposes everything. No service-specific credentials, no mTLS, no fine-grained permissions. The domain-level auth (JWT) is solid, but the infrastructure-level trust model is flat.

**No distributed tracing or observability.** Metrics middleware exists but there's no apparent Prometheus/Grafana/Jaeger setup. No request ID propagation across service boundaries. Debugging production issues across 6+ services without distributed tracing will be painful at scale.

**Inconsistent operational hardening.** No visible rate limiting on API endpoints, inconsistent timeout configurations across gateways, no content-length limits on streaming endpoints. The code architecture is production-grade but the operational architecture isn't there yet.

**Testing strategy unclear.** Jest and pytest are configured, but test coverage visibility is low. Load testing is documented, but the ratio of unit/integration/e2e tests isn't apparent. For a microservices system, contract testing between services seems absent.

**Tends toward synchronous coupling.** Despite having Redis queues, many operations that could be event-driven (notifications, billing updates, match computations) appear to use synchronous HTTP calls through the main API. This creates a hub-and-spoke bottleneck.
