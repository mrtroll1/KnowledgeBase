# Software Architecture — Strengths

**Source:** ChatDHD
**Tags:** architecture, microservices, DDD, system-design, resilience, observability

**Strong domain-driven design discipline.** Consistently applies layered architecture (presentation → domain → infrastructure) across both TypeScript and Python services, keeping domain logic free of infrastructure dependencies. The `BaseRepository<TModel, TEntity>` generic pattern with automatic entity-to-model mapping shows mature abstraction thinking.

**Excellent cross-language consistency.** The unified `DomainError` system is implemented identically in TypeScript and Python — same error codes, same HTTP status mapping, same structured response format. This is rare and shows deliberate architectural governance across a polyglot stack.

**Gateway pattern for service isolation.** All inter-service calls go through dedicated gateway classes (16 types), making services independently testable and replaceable. This is textbook microservice boundary management.

**Polyglot persistence done right.** Separate databases per bounded context (main, vector/embeddings, billing, matching) with appropriate technologies — pgvector for AI workloads, standard PostgreSQL elsewhere. Shows understanding that different domains have different storage needs.

**Clean monorepo organization.** Clear service boundaries with consistent internal folder structures. Each service follows the same conventions, making the codebase navigable despite spanning 6+ services in two languages.

**Thoughtful async architecture.** Redis-based queue system with segmented databases (DB 0-3) for different concerns, dedicated worker processes, and proper separation between synchronous API calls and background processing.

---

**Source:** Republic/Agent
**Tags:** architecture, python, telegram, dsl, state-machines

**Custom declarative DSL for conversation flows.** Built a state-machine DSL (flow_dsl.py + flow_engine.py) where flows are defined as dataclasses with transitions, handlers, and actions, interpreted by a separate engine. This cleanly separates flow logic from callback implementation — a pattern that avoids the typical spaghetti of Telegram bot handler registrations.

**Proper domain-driven layering.** Domain use-cases (GenerateInvoice, ComputeBudget, ParseBankStatement), infrastructure gateways (Sheets, Docs, Drive, Airtable, Gemini, Republic API), and repositories (contractor_repo, invoice_repo, rules_repo) are cleanly separated. The `backend/__init__.py` acts as a facade, re-exporting everything the bot needs — a deliberate coupling boundary that keeps the bot layer thin.
