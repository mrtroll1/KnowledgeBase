# Buffer Overflows — Strengths

**Source:** KnowledgeBase/InternetSecurity
**Tags:** security, C, memory, stack

Demonstrates strong systems-level reasoning about buffer overflows: correctly traces the full attack chain from `strcpy` → stack overflow → return address overwrite → arbitrary code execution.

Independently articulated the insight that shellcode is sent as data, stored at a predictable address, then the return address is overwritten to point there — this is exactly the Morris Worm technique.

Also correctly identifies C's design tradeoff (performance/control vs safety) and mentions modern mitigations like safe compilers. Good instinct for code quality issues (spotted the unused `msg` parameter as suspicious).
