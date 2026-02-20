# Lesson 1: Prototypes — Answers

## Q1

```
true
false
true
```

`d1.speak === d2.speak` is `true` because both instances share the same `speak` function on `Dog.prototype`. That's the whole point of prototypes — method reuse without duplication.

`d1.hasOwnProperty('speak')` is `false` because `speak` lives on the prototype, not on `d1` itself. `hasOwnProperty` only checks the object's own properties, not the prototype chain.

`d1.hasOwnProperty('name')` is `true` because the constructor `this.name = name` assigns `name` directly to each instance.

## Q2

The bug: `new` is missing. `const c = Car('Toyota')` calls `Car` as a regular function, not a constructor.

Without `new`:
- `this` inside `Car` is `undefined` in strict mode (throws an error) or `window`/`globalThis` in sloppy mode
- In sloppy mode, `this.make = 'Toyota'` pollutes the global scope with `window.make = 'Toyota'`
- `Car()` returns `undefined` (functions return `undefined` by default), so `c` is `undefined`
- `c.describe()` throws `TypeError: Cannot read properties of undefined`

The fix: `const c = new Car('Toyota')`. The `new` keyword creates a fresh object, binds `this` to it, wires up the prototype, and returns it.

## Q3

```
Whiskers meows
Whiskers makes a noise
```

`cat.speak()` finds `speak` on `Cat.prototype` first (closest in the chain), so it returns `"Whiskers meows"`.

The second line manually walks up the chain: `Object.getPrototypeOf(cat)` is `Cat.prototype`, and `Object.getPrototypeOf(Cat.prototype)` is `Animal.prototype`. So we're calling `Animal.prototype.speak` with `this` set to `cat` via `.call(cat)`, which gives us `"Whiskers makes a noise"`.

This shows that the overridden method on `Animal.prototype` still exists — `Cat.prototype.speak` just shadows it in the normal lookup.

## Q4

```
null
```

`obj`'s prototype is `Object.prototype`. `Object.prototype`'s prototype is `null` — it's the end of every prototype chain. So `Object.getPrototypeOf(Object.getPrototypeOf(obj))` is `null`.

This is how the prototype chain terminates. Without this `null` at the end, property lookups would loop forever.

## Q5

```
Hi, I'm Alice
Hello, I'm Bob
```

This is a subtle but important distinction. When you do `Person.prototype = { ... }`, you're replacing the entire `Person.prototype` with a new object. But `p` was already created — its `[[Prototype]]` still points to the *old* `Person.prototype` object. Reassigning `Person.prototype` doesn't retroactively update existing instances.

`p2` was created after the reassignment, so its `[[Prototype]]` points to the *new* object.

The lesson: `[[Prototype]]` is set at creation time (by `new`). Replacing `.prototype` later only affects future instances, not existing ones. If you want to modify behavior for all instances, mutate the existing prototype object (e.g., `Person.prototype.greet = ...`) rather than replacing it.
