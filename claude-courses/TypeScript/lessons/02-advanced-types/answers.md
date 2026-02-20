# Lesson 2: Advanced Types — Answers

## Q1

**No, it will not compile.** The error:

```
Property 'length' does not exist on type 'T'
```

`T` is unconstrained — it could be `number`, `boolean`, or anything that doesn't have `.length`. TypeScript prevents access to properties that aren't guaranteed to exist on all possible `T`.

Fix — add a constraint:

```ts
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}
```

Now `T` must have a `length` property. This accepts strings, arrays, and any object with `.length`, but rejects `number`, `boolean`, etc. The `extends` keyword in a generic context means "must be assignable to" — it's a constraint on what types `T` can be, not class inheritance.

## Q2

`result` has type `string`.

TypeScript infers the generic parameter from the argument: you passed `"hello"` (a `string`), so `T = string`. The return type is `T`, which resolves to `string`. The type information flows through the generic — input type determines output type.

Note: `result` is specifically `string`, not the literal `"hello"`, because TypeScript infers generic type parameters at their widened type unless you use `as const` or explicitly specify the type parameter: `identity<"hello">("hello")`.

## Q3

`Partial<Config>` produces:

```ts
{
  host?: string | undefined;
  port?: number | undefined;
  debug?: boolean | undefined;
}
```

Every property becomes optional.

**The `update` call will NOT compile.** The error:

```
Object literal may only specify known properties, and 'verbose' does not exist in type 'Partial<Config>'
```

`Partial<Config>` makes all properties of `Config` optional, but it doesn't allow new properties that weren't in `Config`. `verbose` is not a key in `Config`, so TypeScript flags it. This is TypeScript's **excess property checking** — when you pass an object literal directly, TS rejects unknown keys. This catches typos (maybe you meant `debug` instead of `verbose`).

## Q4

`EventHandler` resolves to:

```ts
"red-small" | "red-large" | "blue-small" | "blue-large"
```

Template literal types distribute over unions. TypeScript computes the Cartesian product of all union members in the template: every combination of `Color` and `Size`, joined by `"-"`. That's 2 colors x 2 sizes = 4 possible string literals.

## Q5

**Yes, it compiles.** This is a **discriminated union** — one of TypeScript's most powerful patterns.

`shape.kind` is the **discriminant property**. It exists on every member of the union with a different literal type. When TypeScript sees the check `shape.kind === "circle"`:

- **Inside the `if` block**: TypeScript narrows `shape` to `{ kind: "circle"; radius: number }`. Accessing `shape.radius` is safe.
- **In the `else` block**: TypeScript narrows `shape` to `{ kind: "square"; side: number }`. Accessing `shape.side` is safe.

In plain JS, you'd access `shape.radius` and hope the caller didn't pass a square. Or you'd add a runtime check and throw an error. TypeScript guarantees at compile time that you only access properties that exist on the narrowed type — no runtime surprises.

This pattern is everywhere in real codebases: Redux actions, API responses, event handlers, AST nodes. The discriminant property (often called `kind`, `type`, or `tag`) lets you branch safely on the union members.
