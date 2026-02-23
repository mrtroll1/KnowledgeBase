# Authentication — Weaknesses

**Source:** InternetSecurity
**Tags:** jwt, bcrypt, session-management, web-security

**Tendency to over-attribute design decisions to a single cause.** Initially attributed JWT's existence solely to bcrypt overhead, missing the broader architectural motivations (statelessness, no DB round-trip, horizontal scaling). Needs to distinguish between "one contributing factor" vs "the primary reason" — JWT would exist even with fast password hashing.
