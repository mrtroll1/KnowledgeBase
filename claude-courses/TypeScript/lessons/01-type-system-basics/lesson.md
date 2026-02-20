# Lesson 1: Type System Basics

## The Problem — Why TypeScript Exists

JavaScript is dynamically typed. That means bugs hide until runtime — sometimes until production.

```js
// Plain JavaScript
function calculateTotal(price, quantity) {
  return price * quantity;
}

calculateTotal(19.99, "3");  // Returns "19.9919.9919.99" — string repetition, not math
calculateTotal(19.99);       // Returns NaN — no error, just silent failure
```

You ship this code. Tests pass (because you tested with numbers). A form sends a string. Your invoice shows `$19.9919.9919.99`. Nobody catches it until a customer complains.

**With TypeScript**, the compiler catches this before your code ever runs:

```ts
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

calculateTotal(19.99, "3");  // ERROR: Argument of type 'string' is not assignable to parameter of type 'number'
calculateTotal(19.99);       // ERROR: Expected 2 arguments, but got 1
```

TypeScript is a **static type checker** that sits on top of JavaScript. Every valid JS is valid TS — but TS adds a type system that catches mistakes at compile time instead of runtime.

---

## Type Annotations vs Type Inference

You can explicitly annotate types, or let TypeScript figure them out.

### Explicit Annotations

```ts
let username: string = "alice";
let age: number = 30;
let isActive: boolean = true;
```

### Type Inference — Let the Compiler Do the Work

```ts
let username = "alice";    // TypeScript infers: string
let age = 30;              // TypeScript infers: number
let isActive = true;       // TypeScript infers: boolean
```

Both are equally type-safe. The compiler knows `username` is a `string` either way — you'll get an error if you try `username = 42`.

**Best practice**: Use inference for variable initialization. Use annotations for function parameters and return types, where the intent isn't obvious.

```ts
// Good — inference handles the simple cases
let count = 0;
let items = ["apple", "banana"];

// Good — annotations clarify the contract
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Unnecessary — the annotation adds noise without value
let count: number = 0;  // We can see it's a number from the value
```

In plain JS, you'd add JSDoc comments or hope your variable names are descriptive enough. TS makes the types part of the language itself — enforced, not aspirational.

---

## Basic Types

### Primitives

```ts
let name: string = "Alice";
let age: number = 30;           // no int vs float distinction — it's all number
let isStudent: boolean = false;
let nothing: null = null;
let notDefined: undefined = undefined;
```

### Arrays

```ts
let scores: number[] = [95, 87, 92];
let names: string[] = ["Alice", "Bob"];

// Alternative syntax (identical behavior)
let scores: Array<number> = [95, 87, 92];
```

In plain JS, nothing stops you from doing `scores.push("not a number")`. In TS:

```ts
scores.push("not a number");
// ERROR: Argument of type 'string' is not assignable to parameter of type 'number'
```

### Tuples — Fixed-Length, Fixed-Type Arrays

```ts
let coordinate: [number, number] = [10, 20];
let userRecord: [string, number, boolean] = ["Alice", 30, true];

// Unlike arrays, each position has a specific type:
coordinate[0] = "hello";
// ERROR: Type 'string' is not assignable to type 'number'

// And length is enforced at the type level:
let pair: [string, number] = ["Alice", 30, true];
// ERROR: Source has 3 element(s) but target allows only 2
```

In plain JS, you'd use arrays for this and just *hope* everyone remembers that index 0 is the name and index 1 is the age. TS enforces the structure.

---

## Type Aliases vs Interfaces

Both let you name a shape of data. The differences are subtle but matter.

### Type Alias — Names Any Type

```ts
type UserID = string;
type Coordinate = [number, number];
type Status = "active" | "inactive" | "pending";

type User = {
  id: UserID;
  name: string;
  status: Status;
};
```

### Interface — Describes Object Shapes

```ts
interface User {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
}
```

### When to Use Which

| Use Case | Prefer |
|----------|--------|
| Object shapes (APIs, models, props) | `interface` |
| Unions, tuples, primitives | `type` |
| Declaration merging needed | `interface` |
| Computed/mapped types | `type` |

**The key difference**: Interfaces can be **extended and merged**. Type aliases are **closed** once defined.

```ts
// Interfaces merge — both declarations combine into one
interface User {
  name: string;
}
interface User {
  age: number;
}
// User now has both name AND age

// Type aliases don't merge — this is an error
type User = { name: string };
type User = { age: number };
// ERROR: Duplicate identifier 'User'
```

**Best practice**: Default to `interface` for object shapes. Use `type` when you need unions, tuples, or type-level computations. Don't overthink it — both work for objects.

---

## Union Types — "This OR That"

A value that can be one of several types.

```ts
type Status = "success" | "error" | "loading";
type ID = string | number;

function printId(id: string | number) {
  console.log(`ID is: ${id}`);
}

printId(101);      // OK
printId("abc");    // OK
printId(true);     // ERROR: Argument of type 'boolean' is not assignable
```

In plain JS, you'd write `printId` and silently accept anything. A boolean would go through, `ID is: true` would print, and nobody would notice the bug upstream that passed a boolean instead of an ID.

### Narrowing Unions

When you have a union, you can only use operations common to **all** members — unless you narrow:

```ts
function printId(id: string | number) {
  // id.toUpperCase();  // ERROR — number doesn't have toUpperCase

  if (typeof id === "string") {
    console.log(id.toUpperCase());  // OK — TypeScript knows it's a string here
  } else {
    console.log(id.toFixed(2));     // OK — TypeScript knows it's a number here
  }
}
```

---

## Intersection Types — "This AND That"

Combines multiple types into one that has **all** their properties.

```ts
type HasName = { name: string };
type HasAge = { age: number };
type Person = HasName & HasAge;

const alice: Person = {
  name: "Alice",
  age: 30,
};
// Must have BOTH name and age — missing either is an error
```

Think of it as: Union (`|`) = "can be A or B", Intersection (`&`) = "must be A and B".

```
Union:         string | number      →  the value is a string OR a number
Intersection:  HasName & HasAge     →  the value has name AND age
```

---

## Literal Types — Exact Values as Types

In JS, `let status = "active"` means `status` is a `string`. In TS, you can be more precise:

```ts
let status: "active" | "inactive" = "active";
status = "inactive";  // OK
status = "pending";   // ERROR: Type '"pending"' is not assignable

let dice: 1 | 2 | 3 | 4 | 5 | 6;
dice = 3;    // OK
dice = 7;    // ERROR: Type '7' is not assignable
```

### `const` vs `let` and Literal Inference

```ts
let greeting = "hello";     // TypeScript infers: string (mutable, could change)
const greeting = "hello";   // TypeScript infers: "hello" (literal type — can never change)
```

This matters when passing values to functions expecting literals:

```ts
type Direction = "up" | "down" | "left" | "right";

function move(direction: Direction) { /* ... */ }

const dir = "up";   // inferred as literal "up"
move(dir);           // OK

let dir2 = "up";    // inferred as string
move(dir2);          // ERROR: Argument of type 'string' is not assignable to type 'Direction'
```

In plain JS, there's no way to express "this variable can only be one of these exact strings." You'd use constants or enums, but nothing stops someone from passing `"diagonal"` — the bug surfaces at runtime, if at all.

### `as const` — Make Everything Literal

```ts
const config = {
  endpoint: "https://api.example.com",
  retries: 3,
} as const;

// config.endpoint is type "https://api.example.com", not string
// config.retries is type 3, not number
// The entire object is deeply readonly
config.retries = 5;  // ERROR: Cannot assign to 'retries' because it is a read-only property
```

---

## Key Takeaways

1. **TypeScript catches bugs at compile time** — not runtime, not in production, not when a customer complains
2. **Prefer inference** for variables, **use annotations** for function signatures and complex cases
3. **`interface` for object shapes, `type` for everything else** — but both work for objects
4. **Union types (`|`)** model "one of" — use narrowing to work with specific members
5. **Intersection types (`&`)** model "all of" — combine multiple shapes into one
6. **Literal types** let you be exact — `"active"` is more precise than `string`
