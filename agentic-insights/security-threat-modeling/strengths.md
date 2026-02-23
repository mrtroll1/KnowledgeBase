# Security Threat Modeling — Strengths

**Source:** InternetSecurity
**Tags:** bcrypt, password-cracking, threat-modeling, attacker-economics

Independently reasoned through the attacker's economics for bcrypt cracking — realized that "slow" doesn't mean "impossible" and did back-of-envelope math on realistic attack scenarios (spray top-10 across 1M users, or deep-dive on 1K targets). Shows genuine attacker-mindset thinking: asking "what CAN the attacker still do?" rather than stopping at "bcrypt is secure." Connected parallelization (multi-core) to feasibility without being prompted.
