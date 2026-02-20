# Lesson 1: OOP Fundamentals

## The Problem — Why Object-Oriented?

Imagine you're building an e-commerce system. You have users, products, orders, payments. In a purely procedural approach, you'd end up with:

```typescript
// Procedural nightmare — data and logic are separate
const userName = "Alice";
const userEmail = "alice@example.com";
const userBalance = 100;

function chargeUser(name: string, email: string, balance: number, amount: number): number {
  if (balance < amount) throw new Error("Insufficient funds");
  return balance - amount;
}

function sendReceipt(email: string, amount: number): void {
  console.log(`Sending receipt to ${email} for $${amount}`);
}
```

Every function needs to be passed all the data it operates on. Add a new field (say `userCurrency`) and you're updating **every function signature**. Data and behavior are disconnected — nothing stops you from passing the wrong email to `sendReceipt`.

**With OOP**, data and the operations on that data live together:

```typescript
class User {
  constructor(
    private name: string,
    private email: string,
    private balance: number
  ) {}

  charge(amount: number): void {
    if (this.balance < amount) throw new Error("Insufficient funds");
    this.balance -= amount;
    this.sendReceipt(amount);
  }

  private sendReceipt(amount: number): void {
    console.log(`Sending receipt to ${this.email} for $${amount}`);
  }
}
```

The `User` **owns** its data and protects it. You can't accidentally charge the wrong user or send a receipt to the wrong email. That's the core promise of OOP: **bundling data with the behavior that operates on it**.

---

## Static Fields and Methods — Belonging to the Class, Not the Instance

### The problem

You're building a system where every user gets a unique ID. Where does the counter live?

```typescript
// Without static — where does nextId live?
let globalNextId = 0; // Floating global variable — anyone can modify it

class User {
  id: number;
  constructor(public name: string) {
    this.id = globalNextId++;
  }
}
```

That `globalNextId` is a loose variable. Any code anywhere can reset it, skip numbers, or create duplicates.

### The fix — static members

```typescript
class User {
  private static nextId = 0;  // Belongs to the CLASS, not any instance

  readonly id: number;

  constructor(public name: string) {
    this.id = User.nextId++;   // Accessed via the class name
  }

  static getTotalUsers(): number {
    return User.nextId;
  }
}

const alice = new User("Alice"); // alice.id = 0
const bob = new User("Bob");     // bob.id = 1
console.log(User.getTotalUsers()); // 2
```

**Static** means "belongs to the class itself, not to any instance." There's exactly one `nextId` shared across all `User` instances. You call static methods on the class (`User.getTotalUsers()`), not on instances (`alice.getTotalUsers()` would be wrong).

**When to use static:**
- Factory methods: `User.fromJSON(data)`
- Utility functions that don't need instance state: `MathUtils.clamp(value, min, max)`
- Shared counters, caches, configuration

**When NOT to use static:**
- If the method needs `this` — it should be an instance method
- If you're using static to avoid passing dependencies — that's a code smell (it hides coupling)

---

## Encapsulation & Access Modifiers

### The problem

```typescript
class BankAccount {
  balance: number = 0;  // Public by default in TypeScript

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Invalid amount");
    this.balance += amount;
  }
}

const account = new BankAccount();
account.deposit(100);     // Goes through validation ✓
account.balance = -9999;  // Bypasses ALL validation ✗
```

If `balance` is public, any code can directly set it to anything. Your carefully written `deposit()` method with validation? Useless — anyone can just reach in and change the field directly.

### The fix — access modifiers

```
┌─────────────────────────────────────────────────────┐
│                   Access Modifiers                    │
├──────────┬────────────┬──────────────┬──────────────┤
│          │ Same class │ Subclass     │ Outside      │
├──────────┼────────────┼──────────────┼──────────────┤
│ public   │     ✓      │      ✓       │      ✓       │
│ protected│     ✓      │      ✓       │      ✗       │
│ private  │     ✓      │      ✗       │      ✗       │
└──────────┴────────────┴──────────────┴──────────────┘
```

```typescript
class BankAccount {
  private balance: number = 0;  // Only this class can touch it

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Invalid amount");
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;  // Read-only access to the outside world
  }
}

const account = new BankAccount();
account.deposit(100);
// account.balance = -9999;  // TS Error: Property 'balance' is private
console.log(account.getBalance()); // 100
```

**Without encapsulation**, every piece of code that touches your class becomes a potential source of bugs — any of them could put the object into an invalid state.

**With encapsulation**, there's exactly one place where `balance` changes: inside `BankAccount` methods. If there's a bug with the balance, you know exactly where to look.

---

## Getters and Setters — Why Not Just Public Fields?

You might think: "Just make it public and save the boilerplate." Here's why that's a trap:

```typescript
// Version 1 — public field, seems fine
class Temperature {
  public celsius: number = 0;
}

const t = new Temperature();
t.celsius = -500;  // Absolute zero is -273.15. This is physically impossible.
```

Now you need validation. If `celsius` is a public field, you **cannot** add validation without changing every piece of code that accesses it. But with a getter/setter:

```typescript
class Temperature {
  private _celsius: number = 0;

  get celsius(): number {
    return this._celsius;
  }

  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Below absolute zero");
    }
    this._celsius = value;
  }

  get fahrenheit(): number {
    return this._celsius * 9/5 + 32;  // Computed property — no stored field needed
  }
}

const t = new Temperature();
t.celsius = 25;          // Calls the setter — validation runs
console.log(t.celsius);  // Calls the getter — returns 25
console.log(t.fahrenheit); // 77 — computed on the fly
// t.celsius = -500;     // Error: Below absolute zero
```

**The key insight:** Getters and setters let you change the internal implementation without changing the external interface. The calling code still writes `t.celsius = 25` — it doesn't know or care that validation was added. Public fields lock you into a specific implementation forever.

---

## Inheritance — The "Is-A" Relationship

### The problem

You're building a notification system. You have email notifications, SMS notifications, and push notifications. They all share some behavior (tracking sent status, formatting timestamps) but differ in how they actually send.

```typescript
// Without inheritance — massive duplication
class EmailNotification {
  private sentAt: Date | null = null;

  send(to: string, message: string): void {
    console.log(`Email to ${to}: ${message}`);
    this.sentAt = new Date();
  }

  formatTimestamp(): string {
    return this.sentAt?.toISOString() ?? "Not sent";
  }
}

class SmsNotification {
  private sentAt: Date | null = null;  // Duplicated

  send(to: string, message: string): void {
    console.log(`SMS to ${to}: ${message}`);
    this.sentAt = new Date();           // Duplicated
  }

  formatTimestamp(): string {           // Duplicated
    return this.sentAt?.toISOString() ?? "Not sent";
  }
}
```

Every new notification type means copying all the shared code. Fix a bug in `formatTimestamp`? You fix it in N places.

### The fix — inheritance

```typescript
class Notification {
  protected sentAt: Date | null = null;

  send(to: string, message: string): void {
    this.deliverMessage(to, message);
    this.sentAt = new Date();
  }

  protected deliverMessage(to: string, message: string): void {
    throw new Error("Subclass must implement deliverMessage");
  }

  formatTimestamp(): string {
    return this.sentAt?.toISOString() ?? "Not sent";
  }
}

class EmailNotification extends Notification {
  protected deliverMessage(to: string, message: string): void {
    console.log(`Email to ${to}: ${message}`);
  }
}

class SmsNotification extends Notification {
  protected deliverMessage(to: string, message: string): void {
    console.log(`SMS to ${to}: ${message}`);
  }
}
```

`EmailNotification` **is a** `Notification`. It inherits the shared behavior and only defines what's different. The "is-a" test is crucial: "Is an EmailNotification a Notification?" Yes. "Is a Dog a Animal?" Yes. "Is a Car a Engine?" No — that's a "has-a" relationship (composition, covered below).

---

## Abstract Classes — Templates for Subclasses

The `Notification` class above has a problem: someone could do `new Notification()` directly and get a broken object (the `deliverMessage` throws). Abstract classes fix this:

```typescript
abstract class Notification {
  protected sentAt: Date | null = null;

  send(to: string, message: string): void {
    this.deliverMessage(to, message);  // Calls the subclass implementation
    this.sentAt = new Date();
  }

  abstract deliverMessage(to: string, message: string): void;  // No body — subclass MUST implement

  formatTimestamp(): string {
    return this.sentAt?.toISOString() ?? "Not sent";
  }
}

// const n = new Notification();  // TS Error: Cannot create an instance of an abstract class

class PushNotification extends Notification {
  deliverMessage(to: string, message: string): void {
    console.log(`Push to ${to}: ${message}`);
  }
}
```

**Without abstract classes**, you rely on runtime errors or comments ("don't instantiate this directly!") to prevent misuse. Abstract classes make the compiler enforce it.

**When to use abstract classes:**
- You have shared behavior (method implementations) but also methods that must vary per subclass
- You want to guarantee nobody creates an instance of the base class

**Abstract class vs Interface:**
- Interface = pure contract, no implementation ("what you must do")
- Abstract class = partial implementation + contract ("here's some shared code, and here's what you must fill in")

---

## Association, Aggregation, and Composition — The "Has-A" Relationships

Not every relationship is "is-a." Most are "has-a," and the strength of that "has-a" varies:

```
Weak ◄────────────────────────────────────────► Strong

Association          Aggregation          Composition
"uses" / "knows"    "has" (shared)       "owns" (exclusive)

Teacher → Student   Department → Teacher  House → Room
Can exist alone     Can exist alone       Room can't exist
                                          without the House
```

### Association — "uses" or "knows about"

The weakest link. Objects reference each other but have independent lifecycles.

```typescript
class Doctor {
  constructor(public name: string) {}

  diagnose(patient: Patient): string {
    return `Dr. ${this.name} diagnoses ${patient.name}`;
  }
}

class Patient {
  constructor(public name: string) {}
}

// Doctor and Patient exist independently
// Doctor doesn't "own" or "contain" Patient
const doc = new Doctor("Smith");
const pat = new Patient("Alice");
doc.diagnose(pat);  // Temporary interaction
```

### Aggregation — "has" (but shared ownership)

The parent contains children, but the children can exist independently and can be shared.

```typescript
class Department {
  private teachers: Teacher[] = [];

  addTeacher(teacher: Teacher): void {
    this.teachers.push(teacher);
  }
}

class Teacher {
  constructor(public name: string) {}
}

const prof = new Teacher("Dr. Jones");
const math = new Department();
const physics = new Department();

// Same teacher can belong to multiple departments
math.addTeacher(prof);
physics.addTeacher(prof);

// If the math department is dissolved, Dr. Jones still exists
```

### Composition — "owns" (exclusive, lifecycle-bound)

The strongest "has-a." The child cannot exist without the parent. When the parent is destroyed, so are the children.

```typescript
class House {
  private rooms: Room[];  // House OWNS these rooms

  constructor(roomNames: string[]) {
    // Rooms are created BY the house — they don't exist independently
    this.rooms = roomNames.map(name => new Room(name));
  }

  demolish(): void {
    // When the house goes, the rooms go with it
    this.rooms = [];
  }
}

class Room {
  constructor(public name: string) {}
}

// You don't create rooms separately and add them — the house creates them
const house = new House(["Kitchen", "Bedroom", "Bathroom"]);
```

**The key difference:** In aggregation, the parent receives already-existing objects (dependency injection). In composition, the parent creates and owns the objects internally.

---

## Inheritance vs Composition — The Big Tradeoff

This is one of the most important decisions in OOP. The classic advice is **"favor composition over inheritance"** — here's why:

### Inheritance creates tight coupling

```typescript
// Inheritance — fragile base class problem
class Bird {
  fly(): void {
    console.log("Flying!");
  }
}

class Penguin extends Bird {
  // Penguins can't fly... but they inherit fly()
  // Now every function that gets a Bird and calls fly()
  // might break with a Penguin
}
```

### Composition gives you flexibility

```typescript
// Composition — mix and match behaviors
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

class FlightBehavior implements Flyable {
  fly(): void { console.log("Flying!"); }
}

class SwimBehavior implements Swimmable {
  swim(): void { console.log("Swimming!"); }
}

class Duck {
  constructor(
    private flyer: Flyable = new FlightBehavior(),
    private swimmer: Swimmable = new SwimBehavior()
  ) {}

  fly(): void { this.flyer.fly(); }
  swim(): void { this.swimmer.swim(); }
}

class Penguin {
  constructor(
    private swimmer: Swimmable = new SwimBehavior()
  ) {}

  swim(): void { this.swimmer.swim(); }
  // No fly method — Penguins don't fly. No broken inheritance.
}
```

**When to use inheritance:**
- True "is-a" relationships that won't change
- You need to share implementation (not just interface)
- The hierarchy is shallow (2-3 levels max)

**When to use composition:**
- "Has-a" or "can-do" relationships
- You need to combine behaviors flexibly
- You want to swap behaviors at runtime
- You're in doubt — composition is almost always the safer choice

---

## Key Takeaways

1. **Encapsulation protects invariants** — private fields + public methods = controlled access
2. **Static belongs to the class** — use it for shared state and factory methods, not to avoid dependency injection
3. **Getters/setters future-proof your API** — you can add validation, computation, or logging without changing callers
4. **Inheritance = "is-a", Composition = "has-a"** — test the relationship before choosing
5. **Abstract classes = enforced contracts with shared code** — use them when a base class should never be instantiated directly
6. **Favor composition over inheritance** — it's more flexible, less coupled, and easier to test
7. **Association < Aggregation < Composition** — understand the strength of "has-a" relationships to model your domain correctly
