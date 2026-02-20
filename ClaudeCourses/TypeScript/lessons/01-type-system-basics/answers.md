# Lesson 1: Type System Basics — Answers

## Q1

```ts
let a = "hello";               // string — let is mutable, so TS widens to string
const b = "hello";             // "hello" — const is immutable, so TS infers the literal type
let c = [1, 2, 3];             // number[]
let d = [1, "two", true];     // (string | number | boolean)[] — TS infers a union array
const e = { name: "Alice", age: 30 };  // { name: string; age: number } — object properties are mutable even with const
```

No compile errors. The key insight: `const` narrows primitives to literal types, but object properties remain mutable (and thus widened) because `const` only prevents reassigning the variable, not mutating the object. If you wanted literal types on `e`, you'd use `as const`.

## Q2

**No, it will not compile.** The error is on the last line:

```
Argument of type 'string' is not assignable to parameter of type 'Shape'
```

`let myShape = "circle"` infers `myShape` as type `string`, not `"circle"`. Since `string` is wider than `Shape` (which only accepts three specific literals), TypeScript rejects it.

Fixes:
- `const myShape = "circle"` — infers literal type `"circle"`
- `let myShape: Shape = "circle"` — explicit annotation
- `describeShape("circle" as const)` — assert the literal

This is the `let` vs `const` literal inference behavior in action.

## Q3

**No, it will not compile.** The error:

```
Property 'email' is missing in type '{ name: string; }' but required in type 'Contact'
```

`Contact` is an intersection (`HasName & HasEmail`), meaning a value must satisfy **both** interfaces. The object has `name` but is missing `email`. Intersection means "all of," not "any of" — every property from every intersected type is required.

## Q4

For this simple case, they behave identically at compile time and produce the same JavaScript output (nothing — types are erased).

The practical difference: **interfaces support declaration merging, type aliases don't.**

If somewhere else in the codebase (or in a `.d.ts` file) someone writes another `interface User { age: number }`, both declarations merge into one interface with `id`, `name`, and `age`. With `type User`, the second declaration is a compile error (`Duplicate identifier 'User'`).

This makes `interface` better for library APIs and extensible contracts. `type` is better when you want a closed, non-extensible definition.

## Q5

**It will not compile.** The error:

```
Property 'toUpperCase' does not exist on type 'string | number'
```

`input` is `string | number`. TypeScript only allows operations that are valid for **every** member of the union. Since `number` doesn't have `toUpperCase`, the call is rejected — even though it would work fine if a string were passed at runtime.

To fix it, narrow the type first:

```ts
function process(input: string | number) {
  if (typeof input === "string") {
    const result = input.toUpperCase();  // OK — TS knows it's a string here
    return result;
  }
  return input.toFixed(2);  // OK — TS knows it's a number here
}
```

This is TypeScript's **control flow analysis** — it tracks type narrowing through `if`, `switch`, `typeof`, and other checks. The type system reasons: "after the `typeof` check, inside this branch, `input` can only be `string`."
