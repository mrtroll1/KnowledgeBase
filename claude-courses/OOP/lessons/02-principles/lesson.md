# Lesson 2: Design Principles

## The Problem — Why Principles?

You can write working OOP code that is a nightmare to maintain. Classes that do too many things, changes that break unrelated features, abstractions that make simple tasks hard. Design principles exist because teams learned these lessons the hard way — here's the distilled wisdom.

---

## Part 1 — The Big Three: DRY, KISS, YAGNI

### DRY — Don't Repeat Yourself

**The problem:**

```typescript
class OrderService {
  calculateTotal(items: OrderItem[]): number {
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
      if (item.taxable) total += item.price * item.quantity * 0.08;
    }
    return total;
  }

  generateInvoice(items: OrderItem[]): string {
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
      if (item.taxable) total += item.price * item.quantity * 0.08;  // Same logic, duplicated
    }
    return `Invoice total: $${total.toFixed(2)}`;
  }
}
```

Tax rate changes from 8% to 9%? You update `calculateTotal` but forget `generateInvoice`. Now your invoices show the wrong amount. DRY means every piece of knowledge has a single, authoritative source.

**The fix:**

```typescript
class OrderService {
  private static TAX_RATE = 0.08;

  private calculateItemTotal(item: OrderItem): number {
    const subtotal = item.price * item.quantity;
    return item.taxable ? subtotal * (1 + OrderService.TAX_RATE) : subtotal;
  }

  calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
  }

  generateInvoice(items: OrderItem[]): string {
    return `Invoice total: $${this.calculateTotal(items).toFixed(2)}`;
  }
}
```

### KISS — Keep It Simple, Stupid

**The problem:**

```typescript
// Over-engineered for a simple task
interface StringTransformer {
  transform(input: string): string;
}

class UpperCaseTransformer implements StringTransformer {
  transform(input: string): string { return input.toUpperCase(); }
}

class TransformerFactory {
  static create(type: "upper"): StringTransformer {
    switch (type) {
      case "upper": return new UpperCaseTransformer();
      default: throw new Error("Unknown type");
    }
  }
}

// Usage
const result = TransformerFactory.create("upper").transform("hello");
```

Three classes and an interface to uppercase a string. The abstraction adds no value here.

**The fix:**

```typescript
const result = "hello".toUpperCase();
```

KISS doesn't mean "write dumb code." It means don't add complexity that doesn't pay for itself. Add the factory when you actually have multiple transformer types and need runtime selection.

### YAGNI — You Aren't Gonna Need It

**The problem:** Building features "just in case."

```typescript
class UserRepository {
  findById(id: string): User { /* ... */ }
  findByEmail(email: string): User { /* ... */ }
  findByPhone(phone: string): User { /* ... */ }        // Nobody uses this yet
  findBySSN(ssn: string): User { /* ... */ }             // Nobody uses this yet
  findByBiometricHash(hash: string): User { /* ... */ }  // Nobody uses this yet
}
```

Those unused methods need to be maintained, tested, and updated whenever the `User` model changes. If nobody calls them, they're pure cost.

**The fix:** Only build what's needed now. Add `findByPhone` when a feature actually requires it.

### The Tension: DRY vs KISS, and OCP vs YAGNI

These principles can pull in opposite directions:

```
DRY says: "Extract that repeated code into a shared function!"
KISS says: "That shared function adds indirection — is it worth it for 2 occurrences?"

OCP says: "Design this so it can be extended without modification!"
YAGNI says: "You only have one payment provider — don't build a plugin system yet."
```

**The resolution:** Context wins. Two occurrences of similar code? Maybe just leave it (KISS). Three or more? Extract it (DRY). Will you definitely need a second payment provider next quarter? Build the abstraction (OCP). Is it hypothetical? Wait (YAGNI).

---

## Part 2 — SOLID Principles

### S — Single Responsibility Principle (SRP)

**"A class should have only one reason to change."**

**Without SRP:**

```typescript
class Employee {
  constructor(
    private name: string,
    private salary: number
  ) {}

  // Reason to change #1: business logic
  calculatePay(): number {
    return this.salary * (this.isFullTime() ? 1 : 0.5);
  }

  // Reason to change #2: persistence
  saveToDatabase(): void {
    db.query(`INSERT INTO employees (name, salary) VALUES ($1, $2)`,
      [this.name, this.salary]);
  }

  // Reason to change #3: reporting
  generateReport(): string {
    return `Employee Report\nName: ${this.name}\nSalary: $${this.salary}`;
  }

  private isFullTime(): boolean { return this.salary > 50000; }
}
```

A change to the report format, the database schema, OR the pay calculation all require modifying this one class. A database migration could break the pay calculation if you make a mistake.

**With SRP:**

```typescript
class Employee {
  constructor(
    public readonly name: string,
    public readonly salary: number
  ) {}

  calculatePay(): number {
    return this.salary * (this.isFullTime() ? 1 : 0.5);
  }

  private isFullTime(): boolean { return this.salary > 50000; }
}

class EmployeeRepository {
  save(employee: Employee): void {
    db.query(`INSERT INTO employees (name, salary) VALUES ($1, $2)`,
      [employee.name, employee.salary]);
  }
}

class EmployeeReportGenerator {
  generate(employee: Employee): string {
    return `Employee Report\nName: ${employee.name}\nSalary: $${employee.salary}`;
  }
}
```

Now changes to persistence don't touch business logic. Each class has exactly one reason to change.

---

### O — Open/Closed Principle (OCP)

**"Open for extension, closed for modification."**

**Without OCP:**

```typescript
class PaymentProcessor {
  processPayment(method: string, amount: number): void {
    if (method === "credit_card") {
      console.log(`Charging $${amount} to credit card`);
      // credit card specific logic
    } else if (method === "paypal") {
      console.log(`Sending $${amount} via PayPal`);
      // paypal specific logic
    } else if (method === "crypto") {
      console.log(`Transferring $${amount} in crypto`);
      // crypto specific logic
    }
    // Every new payment method = modify this class
    // Every modification risks breaking existing methods
  }
}
```

Adding Apple Pay means editing `PaymentProcessor`. You're modifying tested, working code — and every `if/else` branch is a risk.

**With OCP:**

```typescript
interface PaymentMethod {
  process(amount: number): void;
}

class CreditCardPayment implements PaymentMethod {
  process(amount: number): void {
    console.log(`Charging $${amount} to credit card`);
  }
}

class PayPalPayment implements PaymentMethod {
  process(amount: number): void {
    console.log(`Sending $${amount} via PayPal`);
  }
}

class PaymentProcessor {
  processPayment(method: PaymentMethod, amount: number): void {
    method.process(amount);  // Works with ANY PaymentMethod — now and future
  }
}

// Adding Apple Pay = NEW class, ZERO changes to existing code
class ApplePayPayment implements PaymentMethod {
  process(amount: number): void {
    console.log(`Paying $${amount} with Apple Pay`);
  }
}
```

The `PaymentProcessor` is **closed** for modification (you never touch it) but **open** for extension (new payment methods just implement the interface).

---

### L — Liskov Substitution Principle (LSP)

**"Subtypes must be substitutable for their base types without breaking correctness."**

**Without LSP:**

```typescript
class Rectangle {
  constructor(protected width: number, protected height: number) {}

  setWidth(w: number): void { this.width = w; }
  setHeight(h: number): void { this.height = h; }
  getArea(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w: number): void {
    this.width = w;
    this.height = w;  // Surprise! Setting width also changes height
  }

  setHeight(h: number): void {
    this.width = h;
    this.height = h;  // Same surprise
  }
}

// Code that works with Rectangle:
function resizeAndCheck(rect: Rectangle): void {
  rect.setWidth(5);
  rect.setHeight(10);
  console.log(rect.getArea());  // Expects 50
}

resizeAndCheck(new Rectangle(1, 1));  // 50 ✓
resizeAndCheck(new Square(1));        // 100 ✗ — LSP violated!
```

A `Square` "is-a" `Rectangle` in geometry, but NOT in code — because `Square` changes the behavior that callers of `Rectangle` depend on. Substituting a `Square` for a `Rectangle` breaks things.

**With LSP:**

```typescript
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  getArea(): number { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  getArea(): number { return this.side ** 2; }
}

// Both implement Shape. Code that uses Shape works correctly with either.
```

**LSP test:** If you have to override a parent method in a way that changes its expected behavior or throws "not supported" — you're probably violating LSP.

---

### I — Interface Segregation Principle (ISP)

**"No client should be forced to depend on methods it doesn't use."**

**Without ISP:**

```typescript
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
}

class Robot implements Worker {
  work(): void { console.log("Working..."); }
  eat(): void { throw new Error("Robots don't eat"); }      // Forced to implement
  sleep(): void { throw new Error("Robots don't sleep"); }   // Forced to implement
  attendMeeting(): void { throw new Error("Robots don't attend meetings"); }
}
```

The `Robot` class is forced to implement methods it can't use. Every caller that gets a `Worker` might accidentally call `eat()` on a Robot and get a runtime crash.

**With ISP:**

```typescript
interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
}

interface Restable {
  sleep(): void;
}

interface MeetingAttendee {
  attendMeeting(): void;
}

class HumanWorker implements Workable, Feedable, Restable, MeetingAttendee {
  work(): void { console.log("Working..."); }
  eat(): void { console.log("Eating lunch..."); }
  sleep(): void { console.log("Sleeping..."); }
  attendMeeting(): void { console.log("In meeting..."); }
}

class Robot implements Workable {
  work(): void { console.log("Working..."); }
  // Only implements what makes sense — no dummy methods
}
```

Now code that only needs something to work asks for `Workable`, not `Worker`. It can't accidentally try to feed a robot.

---

### D — Dependency Inversion Principle (DIP)

**"High-level modules should not depend on low-level modules. Both should depend on abstractions."**

**Without DIP:**

```typescript
class MySQLDatabase {
  query(sql: string): any[] {
    // MySQL-specific implementation
    return [];
  }
}

class UserService {
  private db = new MySQLDatabase();  // Hardcoded dependency on MySQL

  getUser(id: string): User {
    return this.db.query(`SELECT * FROM users WHERE id = '${id}'`)[0];
  }
}
```

`UserService` (high-level business logic) directly depends on `MySQLDatabase` (low-level infrastructure). Want to switch to PostgreSQL? Rewrite `UserService`. Want to test without a real database? You can't.

**With DIP:**

```typescript
// The abstraction — owned by the high-level module
interface Database {
  query(sql: string): any[];
}

// Low-level module implements the abstraction
class MySQLDatabase implements Database {
  query(sql: string): any[] {
    // MySQL-specific
    return [];
  }
}

class PostgresDatabase implements Database {
  query(sql: string): any[] {
    // Postgres-specific
    return [];
  }
}

// High-level module depends on the abstraction
class UserService {
  constructor(private db: Database) {}  // Injected — doesn't know or care which DB

  getUser(id: string): User {
    return this.db.query(`SELECT * FROM users WHERE id = '${id}'`)[0];
  }
}

// Wire it up
const service = new UserService(new PostgresDatabase());

// Test it with a mock
const testService = new UserService({
  query: () => [{ id: "1", name: "Test User" }]  // Fake implementation
});
```

The dependency arrow is **inverted**: instead of `UserService → MySQLDatabase`, it's `UserService → Database ← MySQLDatabase`. The high-level module defines what it needs (the interface), and the low-level module conforms to it.

---

## Key Takeaways

1. **DRY** eliminates duplicated knowledge, but don't over-deduplicate similar-looking code that changes for different reasons
2. **KISS** reminds you that the simplest solution that works is usually the best one
3. **YAGNI** saves you from maintaining code nobody uses — build it when you need it
4. **SRP** — one class, one reason to change. Split along axes of change
5. **OCP** — add new behavior by adding new code, not by modifying existing code
6. **LSP** — if you can't substitute a subtype without breaking callers, the inheritance is wrong
7. **ISP** — small, focused interfaces beat large, bloated ones
8. **DIP** — depend on abstractions (interfaces), not implementations (concrete classes)
9. **Principles conflict** — DRY vs KISS, OCP vs YAGNI. Use judgment, not dogma
