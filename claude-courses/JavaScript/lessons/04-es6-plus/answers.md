# Lesson 4: Modern JavaScript (ES6+) — Answers

## Q1

```
var: 3
var: 3
var: 3
let: 0
let: 1
let: 2
```

`var` is function-scoped. There is only ONE `i` variable, shared by all three setTimeout callbacks. By the time the callbacks execute (after the loop completes), `i` is `3`.

`let` is block-scoped. Each iteration of the loop gets its own `j`. The closure in each setTimeout captures a different `j`, so they print `0`, `1`, `2`.

This is the classic `var`-in-a-loop bug and the single most common reason to prefer `let` over `var`.

## Q2

```
{ y: 2, z: 99 }
3
```

`const { x, ...rest } = a` extracts `x` (value `1`) and collects the remaining properties into `rest` = `{ y: 2, z: 3 }`.

`const b = { ...rest, z: 99 }` spreads `rest` into a new object, then `z: 99` overwrites the `z: 3` from the spread. Later properties win in spread.

`a.z` is still `3`. Spread creates a shallow copy — the original object is not modified. `b` is an entirely new object.

## Q3

```
ReferenceError: Cannot access 'x' before initialization
```

This is the Temporal Dead Zone (TDZ) in action. Even though there's an `x = 1` in the outer scope, the inner block has its own `let x = 2` declaration. This inner `x` is hoisted to the top of the block, which means the inner `x` *shadows* the outer one from the very start of the block.

But `let` variables can't be accessed before their declaration line. So `console.log(x)` sees the inner `x` (shadowed) but it's in the TDZ. Result: ReferenceError.

Without understanding TDZ, you'd expect this to print `1` (the outer `x`). But the inner `let x` shadows it immediately, and the TDZ prevents access until the declaration.

## Q4

```
true 10 "anonymous" 5000
```

This demonstrates the critical difference between `||` and `??`:

- `config.debug || true` — `false || true` = `true`. The `||` operator treats `false` as falsy and falls through to the default. This is a **bug** if you intended `false` to be a valid value.
- `config.count || 10` — `0 || 10` = `10`. Same problem: `0` is falsy, so `||` replaces it. Another **bug**.
- `config.name || 'anonymous'` — `'' || 'anonymous'` = `'anonymous'`. Empty string is falsy. Yet another **bug** if empty string was intentional.
- `config.timeout ?? 5000` — `null ?? 5000` = `5000`. This one is **correct**: `??` only triggers for `null` and `undefined`.

If all four used `??` instead:
- `false ?? true` = `false` (correct)
- `0 ?? 10` = `0` (correct)
- `'' ?? 'anonymous'` = `''` (correct)
- `null ?? 5000` = `5000` (correct)

Rule: Use `??` when `0`, `''`, or `false` are valid values. Use `||` only when all falsy values should trigger the default.

## Q5

```
"NYC"
undefined
undefined
"Alice"
```

- `data.users[0]?.address?.city` — `users[0]` exists, `.address` exists, `.city` exists. Returns `"NYC"`.
- `data.users[1]?.address?.city` — `users[1]` exists (Bob), but `.address` is `undefined`. Optional chaining short-circuits at `?.city` and returns `undefined` instead of throwing.
- `data.users[2]?.address?.city` — `users[2]` is `undefined` (array only has indices 0 and 1). Optional chaining short-circuits and returns `undefined`.
- `data?.users?.[0]?.name` — all parts exist. Note the `?.[0]` syntax: when using bracket notation with optional chaining, the `?.` goes before the bracket. Returns `"Alice"`.

Without optional chaining, `data.users[2].address.city` would throw `TypeError: Cannot read properties of undefined (reading 'address')`. Optional chaining converts these errors into quiet `undefined` returns.
