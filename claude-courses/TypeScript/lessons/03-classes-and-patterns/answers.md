# Lesson 3: Classes & Patterns — Answers

## Q1

**No, it will not compile.** The error is in `SavingsAccount.addInterest`:

```
Property 'balance' is private and only accessible within class 'BankAccount'
```

`private` means only the declaring class can access the member — not even subclasses. `SavingsAccount` cannot touch `this.balance` directly.

Fix — change `private` to `protected`:

```ts
class BankAccount {
  protected balance: number;
  // ...
}
```

Now `BankAccount` and its subclasses can access `balance`, but outside code still cannot. This is the exact use case for `protected`: internal state that subclasses need to read or modify.

## Q2

**It depends on your `tsconfig.json` strictness, but under strict mode, it will NOT compile.** The error:

```
Property 'level' in type 'ConsoleLogger' is not assignable to the same property in base type 'Logger'.
  Type 'string' is not assignable to type '"info" | "warn" | "error"'
```

The issue: `level = "info"` infers `level` as type `string` (because it's a mutable class property with `let`-like inference). But the interface declares `level` as `"info" | "warn" | "error"` — a narrower union of literals.

Fix — explicitly annotate the type:

```ts
class ConsoleLogger implements Logger {
  level: "info" | "warn" | "error" = "info";
  // ...
}
```

This is the same `let` vs `const` widening behavior from Lesson 1, but in a class context. Class properties are mutable, so TypeScript widens `"info"` to `string` unless you annotate.

## Q3

**Yes, it compiles perfectly.** This is structural typing in action.

`Invoice` never says `implements Printable`. But it has a `print()` method that returns `string` — which is exactly what `Printable` requires. TypeScript doesn't care about the declared relationship; it cares about the shape.

`printDocument` accepts anything with a compatible `print()` method. `Invoice` qualifies because its structure matches. This is fundamentally different from Java/C#, where you'd need the explicit `implements Printable` declaration.

The tradeoff: flexibility (no need for explicit implements) vs documentation (explicit implements makes intent clear). In practice, using `implements` is recommended even though it's not required — it gives you better error messages when your class drifts out of compliance.

## Q4

The problem is the `as` assertion. `response.json()` returns `any`. The assertion `data as { name: string; email: string }` tells TypeScript "trust me, this is a user object" — but:

- The API could return an error: `{ error: "Not found" }`
- The API could return `null`
- The field could be `name: null` instead of a string
- The endpoint could be down and return HTML

In all these cases, `user.name.toUpperCase()` crashes at runtime, and TypeScript gave no warning because the assertion bypassed checking.

**Safer approach — validate at runtime with narrowing:**

```ts
interface User {
  name: string;
  email: string;
}

function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as User).name === "string" &&
    "email" in data &&
    typeof (data as User).email === "string"
  );
}

async function fetchUser(id: string): Promise<string | null> {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();

  if (isUser(data)) {
    return data.name.toUpperCase();  // Safe — verified at runtime
  }

  return null;  // Graceful handling of unexpected data
}
```

In production, you'd use a validation library like Zod or io-ts to do this more concisely, but the principle is the same: verify the shape at the boundary, then let TypeScript narrow from there.

## Q5

**No, it will not compile.** Due to declaration merging, the two `Config` interfaces combine into one:

```ts
interface Config {
  host: string;
  port: number;
  debug: boolean;  // merged in from the second declaration
}
```

The error:

```
Property 'debug' is missing in type '{ host: string; port: number; }' but required in type 'Config'
```

The merged interface requires all three properties. The object literal is missing `debug`.

This is why declaration merging is both powerful and something to be aware of: adding a second interface declaration doesn't replace the first — it extends it. All properties from all declarations become required (unless marked optional). In large codebases, this can cause surprising compile errors when a dependency adds fields to an interface you're implementing.
