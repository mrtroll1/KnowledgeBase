# Lesson 4: Modern JavaScript (ES6+)

## The Problem — Why Did JavaScript Need a Major Update?

Before ES6 (2015), JavaScript had significant foot-guns: `var` had confusing scoping, there was no native class syntax, destructuring didn't exist, and string concatenation was tedious. ES6 wasn't just new features — it was fixing pain points that had tripped up developers for 20 years.

---

## `let` and `const` vs `var`

### The `var` Problem: Function Scope

```js
// var is function-scoped, NOT block-scoped
if (true) {
  var x = 10;
}
console.log(x); // 10 — leaked out of the if block!

// let/const are block-scoped
if (true) {
  let y = 10;
  const z = 20;
}
console.log(y); // ReferenceError: y is not defined
```

**Without `let`/`const`**, variables declared inside `if`, `for`, or `while` blocks leak into the surrounding function. This caused countless bugs, especially in loops:

```js
// THE BUG — with var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 — NOT 0, 1, 2
// Why? There's only ONE 'i' (function-scoped). By the time the callbacks run, i is 3.

// THE FIX — with let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2
// Why? Each loop iteration gets its OWN 'i' (block-scoped).
```

### Hoisting and the Temporal Dead Zone (TDZ)

All declarations (`var`, `let`, `const`) are hoisted — but they behave differently:

```js
// var — hoisted AND initialized to undefined
console.log(a); // undefined (no error!)
var a = 5;

// let/const — hoisted but NOT initialized (Temporal Dead Zone)
console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 5;
```

The **Temporal Dead Zone** is the period between entering the scope and the actual declaration line. During this zone, the variable exists (it's hoisted) but you can't access it. This is a deliberate safety feature — it catches bugs where you accidentally use a variable before declaring it.

```js
let x = 'outer';
{
  // TDZ for inner x starts here
  console.log(x); // ReferenceError — NOT 'outer'! The inner x shadows it, but it's in the TDZ
  let x = 'inner'; // TDZ ends here
}
```

### `const` — Immutable Binding, Not Immutable Value

```js
const name = 'Alice';
name = 'Bob';          // TypeError: Assignment to constant variable

const user = { name: 'Alice' };
user.name = 'Bob';     // Works! The object is mutable; only the binding is constant.
user = { name: 'Bob' }; // TypeError: can't reassign the variable itself
```

**Without understanding this**, you'd think `const` makes everything immutable. It doesn't — it prevents reassignment of the variable. The contents of objects and arrays are still mutable. Use `Object.freeze()` if you need true immutability (shallow only).

---

## Arrow Functions

```js
// Traditional
function add(a, b) {
  return a + b;
}

// Arrow — concise for short functions
const add = (a, b) => a + b;

// With a body block (needs explicit return)
const add = (a, b) => {
  const result = a + b;
  return result;
};

// Single parameter — parentheses optional
const double = x => x * 2;

// No parameters — parentheses required
const greet = () => 'Hello';
```

Arrow functions have two behavioral differences from regular functions:
1. **No own `this`** — they capture `this` from the enclosing scope (covered in Lesson 2)
2. **No `arguments` object** — use rest parameters instead

```js
// Regular function has 'arguments'
function legacy() {
  console.log(arguments); // [1, 2, 3]
}
legacy(1, 2, 3);

// Arrow function — use rest params
const modern = (...args) => {
  console.log(args); // [1, 2, 3]
};
modern(1, 2, 3);
```

---

## Destructuring

### Object Destructuring

```js
// WITHOUT destructuring
const user = { name: 'Alice', age: 30, role: 'admin' };
const name = user.name;
const age = user.age;
const role = user.role;

// WITH destructuring
const { name, age, role } = user;

// Renaming
const { name: userName, age: userAge } = user;
console.log(userName); // 'Alice'

// Default values
const { name, country = 'Unknown' } = user;
console.log(country); // 'Unknown' (user has no country property)

// Nested
const response = {
  data: {
    user: { name: 'Alice', settings: { theme: 'dark' } }
  }
};
const { data: { user: { settings: { theme } } } } = response;
console.log(theme); // 'dark'
```

### Array Destructuring

```js
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]

// Skip elements
const [, , third] = [1, 2, 3];
// third = 3

// Swap variables — no temp needed!
let a = 1, b = 2;
[a, b] = [b, a];
// a = 2, b = 1
```

### Destructuring in Function Parameters

```js
// WITHOUT — you pass an object and dig into it
function createUser(options) {
  const name = options.name;
  const age = options.age || 25;
  // ...
}

// WITH — destructure right in the parameter
function createUser({ name, age = 25, role = 'user' }) {
  console.log(`${name}, ${age}, ${role}`);
}

createUser({ name: 'Alice', age: 30 }); // "Alice, 30, user"
```

---

## Spread and Rest Operators

Both use `...` but do opposite things:
- **Spread** — expands an iterable into individual elements
- **Rest** — collects individual elements into an array/object

### Spread

```js
// Arrays
const a = [1, 2, 3];
const b = [...a, 4, 5];     // [1, 2, 3, 4, 5]
const copy = [...a];         // shallow copy

// Objects
const defaults = { theme: 'light', lang: 'en' };
const userPrefs = { theme: 'dark' };
const config = { ...defaults, ...userPrefs };
// { theme: 'dark', lang: 'en' } — later spread wins on conflicts

// Function arguments
const nums = [1, 2, 3];
Math.max(...nums); // same as Math.max(1, 2, 3)
```

### Rest

```js
// In function parameters — collect remaining args
function sum(first, ...others) {
  return first + others.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

// In destructuring — collect remaining properties
const { name, ...rest } = { name: 'Alice', age: 30, role: 'admin' };
// name = 'Alice', rest = { age: 30, role: 'admin' }
```

**Without spread/rest**, you'd use `Array.prototype.concat`, `Object.assign`, and the `arguments` object — all more verbose and harder to read.

---

## Template Literals

```js
// OLD — string concatenation
const greeting = 'Hello, ' + name + '! You are ' + age + ' years old.';

// NEW — template literal
const greeting = `Hello, ${name}! You are ${age} years old.`;

// Multi-line strings
const html = `
  <div class="card">
    <h2>${user.name}</h2>
    <p>${user.bio}</p>
  </div>
`;

// Expressions inside ${}
const msg = `Total: ${price * quantity}`;
const status = `User is ${active ? 'online' : 'offline'}`;
```

### Tagged Templates (Advanced)

You can "tag" a template literal with a function that processes it:

```js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `**${values[i]}**` : '');
  }, '');
}

const name = 'Alice';
const role = 'admin';
highlight`User ${name} has role ${role}`;
// "User **Alice** has role **admin**"
```

Tagged templates power libraries like `styled-components` in React and `sql` template tags for safe SQL queries.

---

## Classes

Covered in depth in Lesson 1 (syntactic sugar over prototypes). Quick recap:

```js
class Animal {
  #sound;  // private field (ES2022)

  constructor(name, sound) {
    this.name = name;
    this.#sound = sound;
  }

  speak() {
    return `${this.name} says ${this.#sound}`;
  }

  static create(name, sound) {
    return new Animal(name, sound);
  }
}

const dog = Animal.create('Rex', 'woof');
dog.speak();    // "Rex says woof"
dog.#sound;     // SyntaxError: Private field
```

---

## Optional Chaining and Nullish Coalescing

### Optional Chaining (`?.`)

```js
// WITHOUT — defensive checks everywhere
const theme = user && user.settings && user.settings.theme;

// WITH — optional chaining
const theme = user?.settings?.theme;
// Returns undefined if any part of the chain is null/undefined — no error

// Works with methods too
const result = api?.getData?.();

// And arrays
const first = arr?.[0];
```

### Nullish Coalescing (`??`)

```js
// THE PROBLEM with || for defaults
const count = response.count || 10;
// If count is 0, this gives you 10! Because 0 is falsy.

// THE FIX with ??
const count = response.count ?? 10;
// Only uses 10 if count is null or undefined — NOT for 0, '', or false
```

**Without `??`**, you'd accidentally override legitimate falsy values like `0`, `''`, and `false`. The `||` operator treats all falsy values as "missing," but `??` only triggers on `null` and `undefined`.

```js
0 || 10     // 10  — 0 is falsy, so || falls through
0 ?? 10     // 0   — 0 is not null/undefined, so ?? keeps it

'' || 'default'   // 'default'
'' ?? 'default'   // ''

false || true     // true
false ?? true     // false
```

---

## A/B Summary

| Old way (A) | Modern way (B) |
|-------------|---------------|
| `var` (function-scoped, hoisted to undefined) | `let`/`const` (block-scoped, TDZ) |
| `function(a, b) { return a + b; }` | `(a, b) => a + b` |
| `var name = obj.name; var age = obj.age;` | `const { name, age } = obj;` |
| `Array.prototype.concat` / `Object.assign` | `...spread` |
| `'Hello, ' + name + '!'` | `` `Hello, ${name}!` `` |
| `x && x.y && x.y.z` | `x?.y?.z` |
| `x \|\| defaultValue` (falsy gotcha) | `x ?? defaultValue` (null/undefined only) |

---

## Key Takeaways

1. **Use `const` by default**, `let` when you need reassignment, **never `var`**
2. **Arrow functions** are concise and capture lexical `this` — use them for callbacks, not methods
3. **Destructuring** makes extracting values clean and readable — especially in function parameters
4. **Spread/rest** replaces `concat`, `Object.assign`, and `arguments` with a single `...` syntax
5. **Optional chaining (`?.`)** eliminates defensive null checks; **nullish coalescing (`??`)** fixes the falsy-default bug of `||`
