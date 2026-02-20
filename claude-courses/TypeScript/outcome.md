# TypeScript Learning — Outcome Tracker

## Solid Understanding
- **Type system rationale**: Why TypeScript exists — catching bugs at compile time vs runtime
- **Annotations vs inference**: When to annotate explicitly vs letting TS infer, `const` narrowing
- **Basic types**: string, number, boolean, arrays (`T[]` vs `Array<T>`), tuples, `Promise<T>`
- **Type aliases vs interfaces**: Syntax differences, when to use which (interfaces for objects/classes, types for unions/utilities)
- **Union types**: `string | number`, discriminated unions, exhaustive checks
- **Intersection types**: `A & B` for combining types
- **Literal types**: `'success' | 'error'`, const assertions
- **Type guards**: `typeof`, `instanceof`, `in` operator, custom type predicates (`x is Type`)
- **Generics**: Generic functions, generic interfaces, constraints (`extends`), default type parameters
- **Utility types**: `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`
- **Mapped types**: `{ [K in keyof T]: ... }` pattern
- **Conditional types**: `T extends U ? X : Y`, `infer` keyword
- **Template literal types**: String manipulation at the type level
- **Access modifiers**: `public`, `protected`, `private`, and the shorthand constructor syntax
- **Abstract classes**: Template pattern with abstract methods
- **Structural typing**: Duck typing — compatibility based on shape, not name
- **Declaration merging**: Extending interfaces across files
- **Assertions vs narrowing**: Why `as` is unsafe and narrowing is preferred

## Partial / Needs Refinement
- **Enums**: Not covered in the checklist — `enum` vs `const enum` vs union literals. Union literals are generally preferred in modern TS but enums still appear in many codebases
- **Module augmentation**: Extending third-party types — common need when libraries have incomplete typings
- **Decorators**: Experimental but widely used (Angular, NestJS, TypeORM). The checklist doesn't cover them
- **Type-level programming**: The checklist covers the building blocks (mapped, conditional, template literal) but not complex compositions like recursive types or type-level parsers
- **`strict` mode nuances**: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes` — understanding what each flag does and why

## Gaps — Not Yet Covered
- **Enums** — numeric, string, const enums, and when to avoid them
- **Decorators** — experimental/stage 3, used in Angular/NestJS
- **Module augmentation** — extending third-party type definitions
- **`satisfies` operator** — type checking without widening (TS 4.9+)
- **Branded/nominal types** — simulating nominal typing in a structural system
- **Variance** — covariance/contravariance in function types
- **Project configuration** — tsconfig.json options, strict mode flags, module resolution

## Lessons Completed
- **Lesson 01 — Type System Basics**: Covered via checklist (ts/all.md — basics section)
- **Lesson 02 — Advanced Types**: Covered via checklist (ts/all.md — generics, guards, utilities)
- **Lesson 03 — Classes & Patterns**: Covered via checklist (ts/all.md — classes, structural typing, narrowing)
