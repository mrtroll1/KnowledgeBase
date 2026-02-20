# Lesson 2: Context and `this` — Answers

## Q1

```
"inner"
undefined  (strict mode) — or "" in a browser sloppy mode (window.name defaults to "")
```

`obj.inner.getName()` — implicit binding. The object left of the dot is `obj.inner`, so `this.name` is `"inner"`. It's always the *closest* object to the left of the dot, not `obj`.

`fn()` — default binding. `fn` is a plain variable; there's nothing to the left of the dot. In strict mode, `this` is `undefined`, so `this.name` throws a TypeError. In sloppy mode, `this` is `window`, and `window.name` is typically `""`.

The key insight: extracting a method (`const fn = obj.inner.getName`) strips away the implicit binding. The function no longer "knows" about `obj.inner`.

## Q2

```
"Hello, Alice"
"Hello, Alice"
```

`greetAlice()` — `bind` locked `this` to `a`, so it returns `"Hello, Alice"`.

`greetAlice.call(b)` — still `"Hello, Alice"`. A `bind`-bound function cannot be overridden by `call` or `apply`. Once bound, it stays bound. `bind` creates a wrapper function that always forces the specified `this`, regardless of how it's later invoked.

The only thing that beats `bind` is `new`.

## Q3

```
TypeError: Cannot read properties of undefined (reading 'prefix')
```

(In strict mode — class bodies are always strict.)

`logFn('started')` is a plain function call with no object context. Since class methods run in strict mode, `this` is `undefined`. Accessing `undefined.prefix` throws a TypeError.

This is the classic "method extraction" gotcha. The fix is one of:
- `const logFn = logger.log.bind(logger);`
- Use an arrow wrapper: `const logFn = (msg) => logger.log(msg);`
- Bind in the constructor: `this.log = this.log.bind(this);`

## Q4

```
["Alice is on team undefined", "Bob is on team undefined"]
```

`this.members.map(function(member) { ... })` — the callback is a regular function called by `map`. Inside that callback, `this` is NOT `team`. It's `undefined` (strict mode) or `window` (sloppy mode), because `map` calls the callback as a plain function.

The outer `listMembers()` call has `this = team` (implicit binding), but the inner `function(member)` callback starts a new `this` context that follows default binding.

Fixes:
1. **Arrow function** (best): `this.members.map((member) => { ... })` — captures `this` from `listMembers`, which is `team`.
2. **`map`'s second argument**: `this.members.map(function(member) { ... }, this)` — `map` accepts a `thisArg`.
3. **`const self = this`**: The old-school approach.

## Q5

```
undefined
42
```

`obj.getValue()` — `getValue` is an arrow function. Arrow functions don't have their own `this`; they capture it from the enclosing scope. The enclosing scope here is the module/global scope (the object literal `{}` does NOT create a scope), where `this.value` is `undefined`.

`obj.getValueRegular()` — regular function with implicit binding. `this` is `obj`, so `this.value` is `42`.

This is why arrow functions should NOT be used as object methods. Object literals don't create a new scope, so `this` inside an arrow function defined in an object literal refers to whatever `this` is in the outer scope — not the object.
