# Lesson 3: Classes & Patterns

## The Problem — OOP in JavaScript Is a Guessing Game

JavaScript has classes, but they lack enforcement. There's no way to express "this property is private," "this class can't be instantiated directly," or "this class must implement these methods."

```js
// Plain JavaScript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this._passwordHash = hashPassword("default");  // "private" by convention only
  }
}

const user = new User("Alice", "alice@test.com");
console.log(user._passwordHash);  // Oops — nothing stops this
user.name = 42;                    // Oops — was supposed to be a string
```

The underscore prefix is a polite suggestion, not enforcement. TypeScript gives you real access control, abstract classes, and structural guarantees — all checked at compile time.

---

## Access Modifiers — Real Encapsulation

### `public` (default)

```ts
class User {
  public name: string;  // accessible everywhere — "public" is optional, it's the default

  constructor(name: string) {
    this.name = name;
  }
}
```

### `private` — Class Only

```ts
class User {
  private passwordHash: string;

  constructor(private email: string, password: string) {
    this.passwordHash = this.hashPassword(password);
  }

  private hashPassword(password: string): string {
    return `hashed_${password}`;  // simplified for example
  }

  checkPassword(password: string): boolean {
    return this.hashPassword(password) === this.passwordHash;
  }
}

const user = new User("alice@test.com", "secret123");
user.checkPassword("secret123");   // OK — public method
user.passwordHash;                  // ERROR: Property 'passwordHash' is private
user.hashPassword("test");          // ERROR: Property 'hashPassword' is private
user.email;                         // ERROR: Property 'email' is private
```

Note the **parameter property shorthand** on `email`: writing `private email: string` in the constructor parameter both declares the property and assigns it. Saves boilerplate.

In plain JS, you'd use `#passwordHash` (ES2022 private fields) or the `_` convention. TypeScript's `private` is enforced at compile time — it's erased in the output JS, but the compiler guarantees no outside access in your TS code.

### `protected` — Class + Subclasses

```ts
class Animal {
  protected sound: string;

  constructor(sound: string) {
    this.sound = sound;
  }

  protected makeSound(): string {
    return this.sound;
  }
}

class Dog extends Animal {
  constructor() {
    super("Woof");
  }

  bark(): string {
    return this.makeSound();  // OK — subclass can access protected members
  }
}

const dog = new Dog();
dog.bark();         // OK — public method
dog.makeSound();    // ERROR: Property 'makeSound' is protected
dog.sound;          // ERROR: Property 'sound' is protected
```

```
┌─────────────────────────────────────────────────┐
│              Access Modifier Summary             │
├──────────┬──────────┬────────────┬──────────────┤
│ Modifier │  Class   │ Subclass   │  Outside     │
├──────────┼──────────┼────────────┼──────────────┤
│ public   │    OK    │    OK      │    OK        │
│ protected│    OK    │    OK      │    ERROR     │
│ private  │    OK    │    ERROR   │    ERROR     │
└──────────┴──────────┴────────────┴──────────────┘
```

---

## Abstract Classes — Blueprints That Can't Be Instantiated

```ts
abstract class Shape {
  abstract area(): number;       // no implementation — subclasses MUST provide one
  abstract perimeter(): number;

  // Concrete method — shared by all subclasses
  describe(): string {
    return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

const shape = new Shape();        // ERROR: Cannot create an instance of an abstract class
const circle = new Circle(5);     // OK
circle.describe();                 // "Area: 78.54..., Perimeter: 31.42..."
```

In plain JS, you'd throw an error in the base constructor (`if (new.target === Shape) throw...`) — runtime only, easy to forget. TypeScript enforces this at compile time and also guarantees every subclass implements every abstract method.

---

## Interface Implementation — Contracts for Classes

```ts
interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

interface Loggable {
  log(): void;
}

// A class can implement multiple interfaces
class User implements Serializable, Loggable {
  constructor(public name: string, public age: number) {}

  serialize(): string {
    return JSON.stringify({ name: this.name, age: this.age });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.name = parsed.name;
    this.age = parsed.age;
  }

  log(): void {
    console.log(`User: ${this.name}, Age: ${this.age}`);
  }
}
```

If `User` forgets to implement `serialize`, `deserialize`, or `log`, TypeScript reports an error immediately. In plain JS, you'd find out when `user.serialize()` throws `TypeError: user.serialize is not a function`.

### Abstract Classes vs Interfaces

| Feature | Abstract Class | Interface |
|---------|---------------|-----------|
| Can have implementation | Yes (concrete methods) | No |
| Can have state (fields) | Yes | No (just shape declarations) |
| Single inheritance | `extends` only one | `implements` many |
| Runtime existence | Yes (transpiles to a class) | No (erased completely) |

Use abstract classes when subclasses share behavior. Use interfaces when you just need a contract.

---

## Structural Typing — "Duck Typing" with Compile-Time Safety

This is where TypeScript fundamentally differs from Java/C#. TypeScript uses **structural typing**: if the shape matches, it's compatible — regardless of the name.

```ts
interface Point {
  x: number;
  y: number;
}

function printPoint(point: Point) {
  console.log(`(${point.x}, ${point.y})`);
}

// This object was NEVER declared as Point — but it has x and y, so it works
const myObj = { x: 10, y: 20, z: 30 };
printPoint(myObj);  // OK — myObj has at least x and y
```

In Java, you'd need `class MyObj implements Point`. In TypeScript, the structure is the type. If it walks like a Point and quacks like a Point, it IS a Point.

### Where This Matters

```ts
class Cat {
  name: string;
  constructor(name: string) { this.name = name; }
  meow() { return "Meow!"; }
}

class Robot {
  name: string;
  constructor(name: string) { this.name = name; }
  meow() { return "MEOW. I AM ROBOT."; }
}

function petTheCat(cat: Cat) {
  console.log(cat.meow());
}

const robot = new Robot("RoboCat");
petTheCat(robot);  // OK! Robot has name and meow() — structurally identical to Cat
```

`Robot` never `extends` or `implements` `Cat`, but it has the same shape. TypeScript accepts it. This is powerful but can be surprising — the function name says "petTheCat" but it happily accepts a Robot.

### Excess Property Checking — The Exception

```ts
// Direct object literals ARE checked for extra properties
printPoint({ x: 10, y: 20, z: 30 });
// ERROR: Object literal may only specify known properties, and 'z' does not exist in type 'Point'

// But assigned to a variable first, it passes
const obj = { x: 10, y: 20, z: 30 };
printPoint(obj);  // OK — no excess property check on variables
```

This is intentional: object literals are likely typos, variables might have a legitimate wider type.

---

## Declaration Merging — Extending Existing Types

Interfaces with the same name automatically merge:

```ts
interface Window {
  myCustomProperty: string;
}

// This merges with the built-in Window interface from lib.dom.d.ts
// Now window.myCustomProperty is typed
```

This is how libraries extend global types, add methods to built-in objects, and how `.d.ts` files progressively define types.

```ts
// Your app types
interface User {
  id: string;
  name: string;
}

// A plugin adds fields
interface User {
  preferences: { theme: "light" | "dark" };
}

// Both merge — User now has id, name, AND preferences
const user: User = {
  id: "1",
  name: "Alice",
  preferences: { theme: "dark" },
};
```

**Only interfaces merge.** Type aliases cannot. This is one of the key practical differences between `type` and `interface`.

### Namespace Merging

You can also merge namespaces with classes or functions:

```ts
function buildValidator(config: object): boolean {
  return true;
}

namespace buildValidator {
  export function withSchema(schema: object): (config: object) => boolean {
    return (config) => true;
  }
}

// Both work:
buildValidator({});
buildValidator.withSchema({})({});
```

---

## Type Assertions vs Type Narrowing

These look similar but are fundamentally different in safety.

### Type Assertions — "Trust Me, Compiler"

```ts
const input = document.getElementById("username") as HTMLInputElement;
input.value = "Alice";  // No error — you asserted it's an HTMLInputElement
```

The assertion tells TypeScript: "I know better than you — treat this as HTMLInputElement." If you're wrong, you get a runtime error.

```ts
const data = fetchSomething() as User;
console.log(data.name);  // If fetchSomething returned null, this crashes
```

Assertions bypass the type system. They don't check anything — they're a compiler override.

### Type Narrowing — "Prove It, Then Use It"

```ts
const input = document.getElementById("username");
// input is HTMLElement | null

if (input instanceof HTMLInputElement) {
  input.value = "Alice";  // Safe — TS verified it's an HTMLInputElement
}
```

Narrowing uses runtime checks to prove to the compiler what the type is. If the proof fails, the code doesn't execute — no crash.

### Why Narrowing Is Safer

```ts
// DANGEROUS — assertion
function processUser(data: unknown) {
  const user = data as User;        // What if data is null? Or a string? Crash.
  console.log(user.name.toUpperCase());
}

// SAFE — narrowing
function processUser(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as { name: unknown }).name === "string"
  ) {
    console.log((data as { name: string }).name.toUpperCase());  // Verified step by step
  }
}

// CLEANEST — use a type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as User).name === "string"
  );
}

function processUser(data: unknown) {
  if (isUser(data)) {
    console.log(data.name.toUpperCase());  // Safe and clean
  }
}
```

**Rule of thumb**: If you're writing `as`, ask yourself if you can use a type guard or narrowing instead. Assertions are occasionally necessary (DOM, tests, JSON parsing), but they should be the exception, not the default.

```
┌──────────────────────────────────────────────────────────────┐
│                 Assertion vs Narrowing                        │
├──────────────────────────┬───────────────────────────────────┤
│  Type Assertion (as)     │  Type Narrowing (if/typeof/in)    │
├──────────────────────────┼───────────────────────────────────┤
│  Compile-time only       │  Runtime check                    │
│  No runtime safety       │  Runtime safety                   │
│  "I know the type"       │  "I proved the type"              │
│  Can crash if wrong      │  Won't crash — branch not taken   │
│  Use as last resort      │  Use as first choice              │
└──────────────────────────┴───────────────────────────────────┘
```

---

## Key Takeaways

1. **Access modifiers** (`public`, `protected`, `private`) enforce encapsulation at compile time — no more `_` conventions
2. **Abstract classes** are blueprints that can't be instantiated — the compiler ensures subclasses implement all abstract members
3. **`implements`** enforces contracts — the compiler checks that every method in the interface exists on the class
4. **Structural typing** means shape matters, not name — if it has the right properties, it's compatible
5. **Declaration merging** lets interfaces grow incrementally — essential for extending library types
6. **Prefer narrowing over assertions** — assertions bypass the type system, narrowing works with it
