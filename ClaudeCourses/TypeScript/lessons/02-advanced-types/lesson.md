# Lesson 2: Advanced Types

## The Problem — When Basic Types Aren't Enough

You've got the fundamentals: `string`, `number`, unions, interfaces. But real-world code demands more.

```ts
// You fetch user data from an API. Some fields are optional.
// You write a function that works with ANY array, not just string[].
// You want to create a type that's a subset of another type.
// You need to transform types programmatically.
```

In plain JS, you'd handle all this with runtime checks, documentation, and hope. TypeScript's advanced type features let you encode these patterns into the type system itself — so the compiler enforces them for you.

---

## Type Guards — Narrowing at Runtime

We saw `typeof` in Lesson 1. But real code needs more powerful narrowing.

### `typeof` — For Primitives

```ts
function format(value: string | number): string {
  if (typeof value === "string") {
    return value.trim();       // TS knows: string
  }
  return value.toFixed(2);     // TS knows: number
}
```

`typeof` only distinguishes primitives: `"string"`, `"number"`, `"boolean"`, `"object"`, `"function"`, `"undefined"`, `"symbol"`, `"bigint"`.

### `instanceof` — For Classes

```ts
class Dog {
  bark() { return "Woof!"; }
}
class Cat {
  meow() { return "Meow!"; }
}

function speak(animal: Dog | Cat): string {
  if (animal instanceof Dog) {
    return animal.bark();    // TS knows: Dog
  }
  return animal.meow();      // TS knows: Cat
}
```

In plain JS, you'd call `animal.bark()` and get `TypeError: animal.bark is not a function` at runtime if someone passed a Cat. TS catches this at compile time.

### `in` — For Object Properties

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim();    // TS knows: Fish
  } else {
    animal.fly();     // TS knows: Bird
  }
}
```

### Custom Type Predicates — The Power Move

When none of the built-in guards work, write your own:

```ts
type ApiSuccess = { status: "ok"; data: unknown };
type ApiError = { status: "error"; message: string };
type ApiResponse = ApiSuccess | ApiError;

// The return type `response is ApiError` is the type predicate
function isError(response: ApiResponse): response is ApiError {
  return response.status === "error";
}

function handleResponse(response: ApiResponse) {
  if (isError(response)) {
    console.log(response.message);   // TS knows: ApiError
  } else {
    console.log(response.data);      // TS knows: ApiSuccess
  }
}
```

In plain JS, `isError` would return a boolean and the caller would still have no idea what type `response` is after the check. The type predicate tells TypeScript: "if this function returns true, the argument is this specific type."

---

## Generics — Types as Parameters

Generics let you write functions and types that work with **any** type while keeping type safety.

### The Problem Generics Solve

```ts
// Without generics — you lose type information
function firstElement(arr: any[]): any {
  return arr[0];
}

const num = firstElement([1, 2, 3]);    // type: any — TS has no idea this is a number
num.toUpperCase();                       // No error at compile time, crash at runtime
```

```ts
// With generics — type flows through
function firstElement<T>(arr: T[]): T {
  return arr[0];
}

const num = firstElement([1, 2, 3]);    // type: number — TS infers T = number
num.toUpperCase();                       // ERROR: Property 'toUpperCase' does not exist on type 'number'
```

`<T>` is a **type parameter**. When you call `firstElement([1, 2, 3])`, TypeScript infers `T = number` from the argument. The return type is also `T`, so the compiler knows the result is a `number`.

### Generic Interfaces

```ts
interface ApiResponse<T> {
  data: T;
  status: number;
  timestamp: Date;
}

// T gets filled in when you use the interface
const userResponse: ApiResponse<{ name: string; age: number }> = {
  data: { name: "Alice", age: 30 },
  status: 200,
  timestamp: new Date(),
};

const listResponse: ApiResponse<string[]> = {
  data: ["Alice", "Bob"],
  status: 200,
  timestamp: new Date(),
};
```

### Generic Constraints — Limiting What T Can Be

```ts
// T must have a .length property
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("hello", "world");       // OK — strings have .length
longest([1, 2], [1, 2, 3]);     // OK — arrays have .length
longest(10, 20);                  // ERROR: number doesn't have .length
```

`extends` in a generic context means "must be assignable to" — it's a constraint, not inheritance.

---

## Utility Types — Built-In Type Transformations

TypeScript ships with types that transform other types. These save massive amounts of boilerplate.

### `Partial<T>` — Make All Properties Optional

```ts
interface User {
  id: string;
  name: string;
  email: string;
}

// For update operations, you don't need every field
function updateUser(id: string, updates: Partial<User>) {
  // updates could be { name: "Bob" } or { email: "new@email.com" } or both — all valid
}

updateUser("123", { name: "Bob" });  // OK — don't need id or email
```

In plain JS, `updateUser` would accept anything as `updates`. A typo like `{ naem: "Bob" }` would silently do nothing. With `Partial<User>`, TS catches the typo immediately.

### `Required<T>` — Make All Properties Required

```ts
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

// After loading defaults, all fields are guaranteed present
const finalConfig: Required<Config> = {
  host: "localhost",
  port: 3000,
  debug: false,
};
// Missing any property is an error
```

### `Pick<T, Keys>` — Select Specific Properties

```ts
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// For the public API, exclude sensitive fields
type PublicUser = Pick<User, "id" | "name" | "email">;
// { id: string; name: string; email: string } — no password
```

### `Omit<T, Keys>` — Remove Specific Properties

```ts
// Same result as Pick above, but by exclusion
type PublicUser = Omit<User, "password">;
// { id: string; name: string; email: string }
```

`Pick` vs `Omit` — use whichever reads more naturally. "Pick these fields" or "omit these fields."

### `Record<Keys, Value>` — Create Object Types from Key/Value Types

```ts
type Role = "admin" | "editor" | "viewer";

const permissions: Record<Role, string[]> = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
};
// Every Role MUST be present — miss one and TS complains
```

---

## Mapped Types — Programmatic Type Transformation

Mapped types iterate over keys to create new types. This is what powers utility types like `Partial` and `Required` under the hood.

```ts
// This IS how Partial<T> works internally:
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Make all properties readonly:
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};
```

`keyof T` produces a union of T's property names. `[K in keyof T]` iterates over each key. `T[K]` is the type of that property.

### Practical Example — Form Validation

```ts
interface LoginForm {
  username: string;
  password: string;
  rememberMe: boolean;
}

// Generate an errors type where every field maps to a string (error message) or null
type FormErrors<T> = {
  [K in keyof T]: string | null;
};

const errors: FormErrors<LoginForm> = {
  username: "Required",
  password: null,
  rememberMe: null,
};
```

In plain JS, nothing ensures your error object covers every form field. Add a field to the form, forget to add it to validation — silent bug. With mapped types, the compiler guarantees the two stay in sync.

---

## Conditional Types — Types That Branch

Types can use conditions, like a ternary expression at the type level.

```ts
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;   // "yes"
type B = IsString<number>;   // "no"
```

### Practical Example — Extract Return Types

```ts
// Built-in ReturnType does this:
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() { return { name: "Alice", age: 30 }; }

type UserResult = ReturnType<typeof getUser>;
// { name: string; age: number }
```

`infer R` means "figure out what R is from context." If `T` is a function, `R` becomes its return type. If `T` isn't a function, the result is `never`.

### Distributive Conditional Types

When a conditional type acts on a union, it distributes over each member:

```ts
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>;
// string[] | number[] — NOT (string | number)[]
```

Each member of the union is processed independently. This is powerful but can be surprising if you don't expect it.

---

## Template Literal Types — String Manipulation at the Type Level

TypeScript can construct and match string types using template literals.

```ts
type EventName = "click" | "scroll" | "keypress";
type EventHandler = `on${Capitalize<EventName>}`;
// "onClick" | "onScroll" | "onKeypress"
```

### Practical Example — CSS Properties

```ts
type CSSUnit = "px" | "em" | "rem" | "%";
type CSSValue = `${number}${CSSUnit}`;

let width: CSSValue = "100px";    // OK
let height: CSSValue = "3.5em";   // OK
let margin: CSSValue = "100";     // ERROR: not assignable to CSSValue
let padding: CSSValue = "big";    // ERROR: not assignable to CSSValue
```

In plain JS, CSS values are just strings — `"100px"`, `"banana"`, doesn't matter. TS template literal types let you encode the pattern into the type system.

---

## Key Takeaways

1. **Type guards narrow unions** — `typeof` for primitives, `instanceof` for classes, `in` for properties, custom predicates for everything else
2. **Generics preserve type information** — use `<T>` instead of `any` to keep the compiler informed
3. **Constraints (`extends`)** limit generic parameters to types with the properties you need
4. **Utility types** (`Partial`, `Pick`, `Omit`, `Record`) eliminate boilerplate — learn them, they're everywhere
5. **Mapped types** programmatically transform types — this is how utility types work under the hood
6. **Conditional types** bring if/else logic to the type level — essential for library authors
7. **Template literal types** construct string types from patterns — great for APIs with naming conventions
