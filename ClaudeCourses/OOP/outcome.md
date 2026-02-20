# OOP Learning — Outcome Tracker

## Solid Understanding
- **Static members**: When and why to use static fields and methods, class-level vs instance-level state
- **Encapsulation**: Access modifiers (public, protected, private), information hiding, getters/setters as controlled access points
- **Inheritance**: "is-a" relationships, method overriding, the fragile base class problem
- **Abstract classes**: Defining contracts with partial implementation, template for subclasses
- **Relationships**: Association (uses), aggregation (has, independent lifecycle), composition (has, dependent lifecycle)
- **Inheritance vs composition**: Tradeoffs — inheritance for "is-a" with shared behavior, composition for "has-a" and flexibility. "Favor composition over inheritance"
- **DRY, KISS, YAGNI**: Core principles and their tensions (DRY vs KISS: don't abstract too early, OCP vs YAGNI: don't build extension points you don't need yet)
- **SOLID**: SRP (one reason to change), OCP (open/closed), LSP (substitutability), ISP (thin interfaces), DIP (depend on abstractions)
- **Design patterns**: Publisher-Subscriber, Singleton (and its controversy), Factory Method, Abstract Factory, Template Method, MVC (fat model, thin controller, dumb view)
- **Cohesion & coupling**: High cohesion (focused classes), loose coupling (depend on abstractions), how to identify and fix low cohesion
- **UML basics**: Reading class diagrams — associations, composition, inheritance arrows

## Partial / Needs Refinement
- **Strategy pattern**: Not in checklist — essential for replacing conditional logic with polymorphism. The checklist covers Factory and Template but misses Strategy, which is arguably more commonly needed in day-to-day code
- **Observer vs Pub/Sub distinction**: The checklist covers Pub/Sub but doesn't clarify the difference from the classic Observer pattern (direct vs mediated). In practice they're often conflated
- **Adapter/Decorator/Proxy patterns**: Structural patterns not covered — Adapter for incompatible interfaces, Decorator for extending behavior without inheritance, Proxy for controlled access. Very common in real codebases
- **SOLID in practice**: The principles are covered individually but applying multiple principles together during a real refactoring (the judgment of "which principle applies here?") needs practice
- **When NOT to apply patterns**: The checklist teaches patterns but doesn't emphasize that premature patterns are as bad as no patterns. Over-engineering awareness

## Gaps — Not Yet Covered
- **Strategy pattern** — polymorphic behavior selection
- **Adapter pattern** — interface compatibility
- **Decorator pattern** — extending behavior dynamically
- **Proxy pattern** — controlled access, lazy loading
- **Builder pattern** — complex object construction
- **State pattern** — state machines with OOP
- **Repository pattern** — data access abstraction
- **Dependency injection containers** — automated DI beyond manual wiring
- **Domain-Driven Design basics** — entities, value objects, aggregates

## Lessons Completed
- **Lesson 01 — OOP Fundamentals**: Covered via checklist (oop.fundamentals.ts)
- **Lesson 02 — Design Principles**: Covered via checklist (oop.principles.ts)
- **Lesson 03 — Design Patterns**: Covered via checklist (oop.patterns.ts)
- **Lesson 04 — Relationships & Cohesion**: Covered via checklist (oop.other.ts)
