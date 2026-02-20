# Clean Code Learning — Outcome Tracker

## Solid Understanding
- **Naming**: Intention-revealing names, avoiding misinformation, pronounceable/searchable names, class nouns vs method verbs, one word per concept, solution/problem domain vocabulary, meaningful context
- **Functions**: Small functions (~10 lines), do one thing, one level of abstraction, the stepdown rule, minimizing arguments, no flag arguments, no side effects, command-query separation, DRY
- **Comments**: Good comments (legal, informative, intent, warning, TODO, amplification) vs bad (mumbling, redundant, misleading, mandated, journal, closing brace, commented-out code). Expressing intent through code instead of comments
- **Formatting**: Newspaper metaphor, vertical openness between concepts, vertical density for related code, vertical distance (variable declarations near usage, dependent functions close), vertical ordering (caller above callee)
- **Objects vs Data Structures**: Procedural vs OOP tradeoff (new types vs new operations), data abstraction, encapsulation, class organization (constants → fields → constructor → public → protected → private)
- **Class design**: Single Responsibility Principle, cohesion, organizing for change (OCP), isolating from change (DIP)

## Partial / Needs Refinement
- **Error handling** (Ch7): Not covered in checklist — throwing exceptions vs return codes, unchecked exceptions, providing context with exceptions, the special case pattern, never returning null
- **Unit testing** (Ch9): Not covered — the three laws of TDD, clean tests, one assert per test, F.I.R.S.T. principles for tests. Critical for maintaining clean code long-term
- **Boundaries** (Ch8): Working with third-party code, learning tests, wrapping external APIs — important for real projects but absent from the checklist
- **Successive refinement** (Ch14): The practice of iterative cleanup — writing messy first drafts and then refactoring step by step. The checklist covers the end state but not the *process* of getting there

## Gaps — Not Yet Covered
- **Error handling** — exceptions, context, null handling
- **Unit testing & TDD** — clean tests, test design principles
- **Boundaries** — third-party code integration
- **Emergence** — Kent Beck's rules of simple design
- **Concurrency** — clean concurrent code patterns
- **Smells & heuristics** — the full catalog from Ch17

## Lessons Completed
- **Lesson 01 — Naming**: Covered via checklist (Clean Code Ch2)
- **Lesson 02 — Functions**: Covered via checklist (Clean Code Ch3)
- **Lesson 03 — Comments**: Covered via checklist (Clean Code Ch4)
- **Lesson 04 — Formatting**: Covered via checklist (Clean Code Ch5)
- **Lesson 05 — Objects & Data Structures**: Covered via checklist (Clean Code Ch6 & Ch10)
