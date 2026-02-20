# Lesson 1: Prototypes & Inheritance

## The Problem — Why Do Prototypes Exist?

You're building a game with 1,000 player objects. Each player needs a `takeDamage()` method. Here's the naive approach:

```js
function createPlayer(name, hp) {
  return {
    name,
    hp,
    takeDamage(amount) {
      this.hp -= amount;
      console.log(`${this.name} takes ${amount} damage. HP: ${this.hp}`);
    },
    heal(amount) {
      this.hp += amount;
      console.log(`${this.name} heals ${amount}. HP: ${this.hp}`);
    }
  };
}

const p1 = createPlayer('Alice', 100);
const p2 = createPlayer('Bob', 100);

p1.takeDamage === p2.takeDamage; // false — two separate function objects!
```

**Without prototypes**, every single player gets its own copy of `takeDamage` and `heal`. 1,000 players = 2,000 function objects sitting in memory, all doing the exact same thing.

**With prototypes**, all 1,000 players share a single `takeDamage` and a single `heal`. The methods live in one place; every player just knows where to look.

---

## What Is [[Prototype]]?

Every JavaScript object has a hidden internal link called `[[Prototype]]` that points to another object. When you access a property on an object and it doesn't exist there, JavaScript follows this link and looks on the prototype. If it's not there either, it follows *that* object's prototype, and so on — until it hits `null`.

```
  ┌──────────────────┐
  │     p1 object     │
  │  name: "Alice"   │
  │  hp: 100         │
  │  (no methods)    │
  │                  │
  │  [[Prototype]] ──┼──────►  ┌────────────────────────┐
  └──────────────────┘         │   Player.prototype      │
                               │  takeDamage: function   │
  ┌──────────────────┐         │  heal: function         │
  │     p2 object     │         │                        │
  │  name: "Bob"     │         │  [[Prototype]] ────────┼──►  ┌──────────────────┐
  │  hp: 100         │         └────────────────────────┘     │ Object.prototype  │
  │  (no methods)    │                                        │  toString()       │
  │                  │                                        │  hasOwnProperty() │
  │  [[Prototype]] ──┼──────►  (same Player.prototype)        │  [[Prototype]] ──┼──► null
  └──────────────────┘                                        └──────────────────┘
```

This is the **prototype chain**. When you call `p1.takeDamage(10)`:

1. JS looks on `p1` — no `takeDamage` property
2. JS follows `p1.[[Prototype]]` to `Player.prototype` — found it! Execute it.

When you call `p1.toString()`:

1. JS looks on `p1` — nope
2. Follows to `Player.prototype` — nope
3. Follows to `Object.prototype` — found `toString()`, execute it.

When you call `p1.nonExistent`:

1. `p1` — nope
2. `Player.prototype` — nope
3. `Object.prototype` — nope
4. `null` — end of chain, return `undefined`

---

## Accessing the Prototype

```js
// The modern, correct way
Object.getPrototypeOf(p1); // → Player.prototype

// The legacy way (still works, but don't use in production)
p1.__proto__; // → Player.prototype

// Check if an object is in another's prototype chain
Player.prototype.isPrototypeOf(p1); // → true
```

**Without `Object.getPrototypeOf()`**, you'd rely on `__proto__`, which was never part of the official spec until ES6 standardized it as a legacy feature. Always prefer the explicit API.

---

## Constructor Functions and the `.prototype` Property

Here's where it gets confusing. Every *function* in JavaScript has a `.prototype` property. This is NOT the function's own prototype — it's the object that will become the `[[Prototype]]` of any object created with `new`.

```js
function Player(name, hp) {
  this.name = name;
  this.hp = hp;
}

// Methods go on the .prototype object — shared by all instances
Player.prototype.takeDamage = function(amount) {
  this.hp -= amount;
  console.log(`${this.name} takes ${amount} damage. HP: ${this.hp}`);
};

Player.prototype.heal = function(amount) {
  this.hp += amount;
  console.log(`${this.name} heals ${amount}. HP: ${this.hp}`);
};

const p1 = new Player('Alice', 100);
const p2 = new Player('Bob', 100);

p1.takeDamage === p2.takeDamage; // true — same function object!
```

What `new Player('Alice', 100)` does under the hood:

1. Creates a brand-new empty object `{}`
2. Sets its `[[Prototype]]` to `Player.prototype`
3. Calls `Player()` with `this` bound to the new object
4. Returns the new object (unless the constructor explicitly returns a different object)

**Without `new`**, `Player('Alice', 100)` would just be a regular function call — `this` would be `undefined` (strict mode) or `window` (sloppy mode), and you'd be polluting the global scope with `name` and `hp` properties.

---

## The Confusing `.prototype` vs `[[Prototype]]` Distinction

This trips up everyone:

| Term | What it is | Who has it |
|------|-----------|------------|
| `[[Prototype]]` | The hidden link to the parent object in the chain | Every object |
| `.prototype` | A regular property that `new` uses to set `[[Prototype]]` | Only functions |

```js
function Player() {}

// Player's OWN [[Prototype]] — it's a function, so it inherits from Function.prototype
Object.getPrototypeOf(Player) === Function.prototype; // true

// Player.prototype — the object that new Player() instances will link to
typeof Player.prototype; // "object"

// These are completely different things!
Object.getPrototypeOf(Player) !== Player.prototype; // true
```

---

## ES6 Classes — Syntactic Sugar Over Prototypes

ES6 classes don't add a new inheritance model. They're a cleaner syntax for the exact same prototype-based system.

```js
// ES6 class syntax
class Player {
  constructor(name, hp) {
    this.name = name;
    this.hp = hp;
  }

  takeDamage(amount) {
    this.hp -= amount;
    console.log(`${this.name} takes ${amount} damage. HP: ${this.hp}`);
  }

  heal(amount) {
    this.hp += amount;
    console.log(`${this.name} heals ${amount}. HP: ${this.hp}`);
  }
}

const p1 = new Player('Alice', 100);

// Proof it's still prototypes under the hood:
typeof Player;                          // "function"
p1.takeDamage === Player.prototype.takeDamage; // true
Object.getPrototypeOf(p1) === Player.prototype; // true
```

**Without understanding that classes are sugar**, you'd think JavaScript has two inheritance systems. It doesn't. `class` is a cleaner way to write constructor functions + prototype methods.

### Inheritance with `extends`

```js
class Mage extends Player {
  constructor(name, hp, mana) {
    super(name, hp);    // calls Player's constructor
    this.mana = mana;
  }

  castSpell(spellCost) {
    if (this.mana >= spellCost) {
      this.mana -= spellCost;
      console.log(`${this.name} casts a spell! Mana: ${this.mana}`);
    }
  }
}

const m = new Mage('Gandalf', 80, 200);
m.takeDamage(10);  // inherited from Player.prototype
m.castSpell(50);   // from Mage.prototype
```

The prototype chain for `m`:

```
  m → Mage.prototype → Player.prototype → Object.prototype → null
```

---

## A/B Summary — Old Way vs Modern Way

| Without prototypes (A) | With prototypes (B) |
|------------------------|---------------------|
| Every object gets its own copy of every method | Methods live on the prototype, shared by all instances |
| 1,000 objects = 1,000 copies of each function | 1,000 objects = 1 copy of each function |
| No inheritance — must copy methods manually | Prototype chain gives you automatic lookup |
| "Classes" don't exist | `class` syntax gives clean, familiar structure over prototypes |

---

## Key Takeaways

1. **Every object has a `[[Prototype]]`** — a hidden link to another object. Property lookups walk this chain.
2. **Prototypes exist for memory efficiency and method reuse** — without them, every object duplicates every method.
3. **`Object.getPrototypeOf()`** is the correct way to inspect the prototype chain. Avoid `__proto__`.
4. **Constructor functions + `new`** automatically wire up the prototype chain via the function's `.prototype` property.
5. **ES6 classes are syntactic sugar** — they don't change the underlying prototype mechanism. Understanding prototypes is understanding classes.
