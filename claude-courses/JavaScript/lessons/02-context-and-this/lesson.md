# Lesson 2: Context and `this`

## The Problem — Why Is `this` So Confusing?

In most languages, `this` (or `self`) always refers to the instance that owns the method. It's determined by where the method is *defined*. JavaScript is different: `this` is determined by how the function is *called* — the call-site, not the definition-site.

```js
const user = {
  name: 'Alice',
  greet() {
    return `Hi, I'm ${this.name}`;
  }
};

user.greet(); // "Hi, I'm Alice" — this = user

const greetFn = user.greet;
greetFn();    // "Hi, I'm undefined" — this = undefined (strict) or window (sloppy)
```

**Without understanding call-site binding**, you'd look at `greetFn` and think "it came from `user`, so `this` must be `user`." But JavaScript doesn't care where the function was defined — it cares about what's to the left of the dot when it's called.

---

## The 4 Rules of `this` (In Priority Order)

When a function is invoked, JavaScript determines `this` using these rules, checked from highest to lowest priority:

```
  ┌─────────────────────────────────────────────────────────┐
  │                    PRIORITY ORDER                        │
  │                                                         │
  │  1. new binding         new Foo()       → brand-new {}  │
  │         ▲                                               │
  │         │  overrides                                    │
  │  2. explicit binding    fn.call(obj)    → obj           │
  │         ▲               fn.apply(obj)   → obj           │
  │         │  overrides    fn.bind(obj)    → obj           │
  │  3. implicit binding    obj.fn()        → obj           │
  │         ▲                                               │
  │         │  overrides                                    │
  │  4. default binding     fn()            → undefined     │
  │                                           (strict mode) │
  │                                         → window/global │
  │                                           (sloppy mode) │
  └─────────────────────────────────────────────────────────┘
```

---

### Rule 4: Default Binding (Lowest Priority)

A plain function call with nothing to the left of the dot.

```js
function showThis() {
  console.log(this);
}

showThis(); // undefined (strict mode) or window (sloppy mode)
```

**Without strict mode**, `this` silently defaults to the global object, which means accidental property assignments pollute `window`. Strict mode catches this by making `this` be `undefined`, which throws an error if you try to use it.

---

### Rule 3: Implicit Binding

When a function is called as a method of an object — there's an object to the left of the dot.

```js
const user = {
  name: 'Alice',
  greet() {
    return `Hi, I'm ${this.name}`;
  }
};

user.greet(); // "Hi, I'm Alice" — this = user (the thing left of the dot)
```

Only the **last** object in a chain matters:

```js
const team = {
  lead: {
    name: 'Bob',
    greet() {
      return `Hi, I'm ${this.name}`;
    }
  }
};

team.lead.greet(); // "Hi, I'm Bob" — this = team.lead, NOT team
```

---

### Rule 2: Explicit Binding (`call`, `apply`, `bind`)

You explicitly tell JavaScript what `this` should be.

```js
function greet(greeting) {
  return `${greeting}, I'm ${this.name}`;
}

const user = { name: 'Alice' };

// call — pass args one by one
greet.call(user, 'Hey');      // "Hey, I'm Alice"

// apply — pass args as an array
greet.apply(user, ['Hey']);   // "Hey, I'm Alice"

// bind — returns a NEW function with this permanently set
const aliceGreet = greet.bind(user);
aliceGreet('Hey');            // "Hey, I'm Alice"
aliceGreet.call({ name: 'Bob' }, 'Hey'); // "Hey, I'm Alice" — bind can't be overridden!
```

**Without explicit binding**, you couldn't borrow methods from one object and use them on another. You'd have to duplicate the function or restructure your objects.

Key difference: `call`/`apply` invoke immediately. `bind` returns a new function for later use.

---

### Rule 1: `new` Binding (Highest Priority)

When a function is called with `new`, `this` is a brand-new empty object.

```js
function Player(name) {
  // 'this' is a brand new {} created by 'new'
  this.name = name;
}

const p = new Player('Alice');
// p.name === 'Alice'
```

`new` overrides everything — even `bind`:

```js
function Foo(val) {
  this.val = val;
}

const bound = Foo.bind({ val: 'old' });
const obj = new bound('new');
console.log(obj.val); // "new" — new wins over bind
```

---

## Arrow Functions — The Exception

Arrow functions don't have their own `this`. They capture `this` from the enclosing lexical scope at the time they're defined. None of the 4 rules apply.

```js
const user = {
  name: 'Alice',
  // regular function — this is determined by call-site
  greetRegular() {
    return `Hi, I'm ${this.name}`;
  },
  // arrow function — this is captured from the surrounding scope
  greetArrow: () => {
    return `Hi, I'm ${this.name}`;
  }
};

user.greetRegular(); // "Hi, I'm Alice"
user.greetArrow();   // "Hi, I'm undefined" — 'this' is the outer scope (module/window), NOT user
```

**Without understanding lexical `this`**, you'd think `greetArrow` works like `greetRegular`. But the arrow function's `this` was locked to the outer scope when it was defined — the object literal `{}` doesn't create a new scope.

### Where Arrow Functions Shine

Arrow functions solve the classic callback problem:

```js
// THE PROBLEM — without arrow functions
class Timer {
  constructor() {
    this.seconds = 0;
  }
  start() {
    setInterval(function() {
      this.seconds++;          // BUG: 'this' is NOT the Timer instance
      console.log(this.seconds); // 'this' is undefined (strict) or window (sloppy)
    }, 1000);
  }
}

// THE OLD FIX — save 'this' in a variable
class Timer {
  constructor() {
    this.seconds = 0;
  }
  start() {
    const self = this;        // <-- the hack
    setInterval(function() {
      self.seconds++;          // works, but ugly
    }, 1000);
  }
}

// THE MODERN FIX — arrow function
class Timer {
  constructor() {
    this.seconds = 0;
  }
  start() {
    setInterval(() => {
      this.seconds++;          // 'this' is the Timer instance — captured from start()
      console.log(this.seconds);
    }, 1000);
  }
}
```

---

## Common Gotchas

### Gotcha 1: Method Extraction

```js
class Button {
  constructor(label) {
    this.label = label;
  }
  click() {
    console.log(`${this.label} clicked`);
  }
}

const btn = new Button('Submit');
btn.click();               // "Submit clicked"

const handler = btn.click; // extracted — no longer called on btn
handler();                 // "undefined clicked" — this is lost!

// Fix: bind it
const handler2 = btn.click.bind(btn);
handler2();                // "Submit clicked"
```

### Gotcha 2: Passing Methods as Callbacks

```js
class API {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  fetchData(endpoint) {
    console.log(`Fetching from ${this.baseUrl}/${endpoint}`);
  }
}

const api = new API('https://example.com');

// BUG: passing the method as a callback loses 'this'
['users', 'posts'].forEach(api.fetchData);
// "Fetching from undefined/users"
// "Fetching from undefined/posts"

// Fix 1: bind
['users', 'posts'].forEach(api.fetchData.bind(api));

// Fix 2: arrow wrapper
['users', 'posts'].forEach(e => api.fetchData(e));
```

### Gotcha 3: Arrow Functions as Methods

```js
// WRONG — arrow function as a method
const counter = {
  count: 0,
  increment: () => {
    this.count++;  // 'this' is NOT counter — it's the outer scope
  }
};

// RIGHT — regular function as a method
const counter = {
  count: 0,
  increment() {
    this.count++;  // 'this' is counter (implicit binding)
  }
};
```

Rule of thumb: Use **regular functions** for object methods. Use **arrow functions** for callbacks inside methods.

---

## A/B Summary

| Situation | What you might expect (A) | What actually happens (B) |
|-----------|--------------------------|--------------------------|
| `const fn = obj.method; fn()` | `this` is `obj` | `this` is `undefined` — extraction loses binding |
| `arr.forEach(obj.method)` | `this` is `obj` | `this` is `undefined` — same extraction problem |
| `obj.arrow = () => {}` | `this` is `obj` | `this` is outer scope — arrows don't bind `this` |
| `new fn.bind(x)()` | `this` is `x` | `this` is new object — `new` wins over `bind` |

---

## Key Takeaways

1. **`this` is determined at the call-site**, not where the function is defined. Always ask: "how is this function being called?"
2. **4 rules in priority order**: `new` > explicit (`call`/`apply`/`bind`) > implicit (`obj.fn()`) > default
3. **Arrow functions are the exception** — they inherit `this` from the enclosing scope, permanently
4. **Method extraction is the #1 source of `this` bugs** — use `.bind()` or arrow wrappers when passing methods as callbacks
5. **Use regular functions for methods, arrow functions for callbacks inside methods**
