# Python — Strengths

**Source:** Republic/Agent
**Tags:** python, pydantic, typing, data-modeling

Effective use of Python typing and data modeling:

- **Pydantic BaseModel** for data validation
- **Dataclasses** for DSL constructs
- **ClassVar** for per-subclass metadata (`SHEET_COLUMNS`, `FIELD_META`)
- **Union types** with discriminated subclasses (`AnyContractor`)

Clean use of polymorphism — contractor subclasses define their own sheet columns, field metadata, currency, and display names.

The `FieldMeta` pattern for declaring both labels and required flags on model fields is elegant for driving both UI prompts and validation.
