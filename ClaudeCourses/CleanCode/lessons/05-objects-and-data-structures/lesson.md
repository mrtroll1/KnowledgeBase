# Lesson 5: Objects & Data Structures

## The Problem — The Fundamental Tradeoff

There are two ways to organize code around data: **procedural** (data structures + functions) and **object-oriented** (objects that hide data behind behavior). Neither is universally better. They have an **exact tradeoff**, and understanding it is the key to making good design decisions.

```
  Procedural                              Object-Oriented
  ┌──────────────────────┐                ┌──────────────────────┐
  │  Data is exposed     │                │  Data is hidden      │
  │  Functions operate    │                │  Behavior is exposed │
  │  on it externally    │                │  Methods operate     │
  │                      │                │  on data internally  │
  ├──────────────────────┤                ├──────────────────────┤
  │  Easy to add new     │                │  Easy to add new     │
  │  FUNCTIONS            │                │  TYPES               │
  │                      │                │                      │
  │  Hard to add new     │                │  Hard to add new     │
  │  TYPES               │                │  FUNCTIONS            │
  └──────────────────────┘                └──────────────────────┘
```

This tradeoff is inescapable. Understanding it prevents you from blindly applying OOP to everything or dismissing it entirely.

---

## Procedural vs OOP — A Concrete Example

### Procedural Approach

```ts
// Data structures — just data, no behavior
interface Circle {
  type: "circle";
  radius: number;
}

interface Rectangle {
  type: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  type: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

// Functions operate on the data externally
function area(shape: Shape): number {
  switch (shape.type) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

function perimeter(shape: Shape): number {
  switch (shape.type) {
    case "circle":
      return 2 * Math.PI * shape.radius;
    case "rectangle":
      return 2 * (shape.width + shape.height);
    case "triangle":
      // simplified — assume equilateral for illustration
      return 3 * shape.base;
  }
}
```

**Adding a new function** (e.g., `describe(shape)`) is easy — write one new function. No existing code changes.

**Adding a new type** (e.g., `Pentagon`) is painful — you must update `area()`, `perimeter()`, and every other function that switches on `shape.type`.

### Object-Oriented Approach

```ts
interface Shape {
  area(): number;
  perimeter(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}
```

**Adding a new type** (e.g., `Pentagon`) is easy — add a new class that implements `Shape`. No existing code changes.

**Adding a new function** (e.g., `describe()`) is painful — you must add it to the `Shape` interface and implement it in every class.

### When to Use Which

```
  "Will I be adding more types or more operations?"
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
     More types            More operations
     (new shapes,          (new calculations,
      new payment           new report formats,
      methods, etc.)        new transformations)
          │                    │
          ▼                    ▼
       Use OOP             Use Procedural
  (polymorphism)       (functions + data)
```

---

## Data Abstraction & Encapsulation

Encapsulation isn't just about making fields `private`. It's about **hiding implementation details** and exposing behavior at the right level of abstraction.

### A: Bad — "encapsulation" that encapsulates nothing

```ts
class Vehicle {
  private fuelTankCapacityInGallons: number;
  private gallonsOfFuel: number;

  getFuelTankCapacityInGallons(): number {
    return this.fuelTankCapacityInGallons;
  }

  getGallonsOfFuel(): number {
    return this.gallonsOfFuel;
  }
}

// Caller does the math — the class leaked its implementation
const percentFull = vehicle.getGallonsOfFuel() / vehicle.getFuelTankCapacityInGallons();
```

The fields are `private`, but the getters expose every detail. The caller knows the tank is measured in gallons, knows the field names, and has to do the calculation itself. This is **fake encapsulation** — the data is effectively public.

### B: Clean — abstract the concept

```ts
class Vehicle {
  private fuelTankCapacityInGallons: number;
  private gallonsOfFuel: number;

  getFuelPercentageRemaining(): number {
    return (this.gallonsOfFuel / this.fuelTankCapacityInGallons) * 100;
  }
}

// Caller gets what they need — doesn't know about gallons, tanks, or internals
const fuelLeft = vehicle.getFuelPercentageRemaining();
```

The caller doesn't know or care whether fuel is measured in gallons, liters, or unicorn tears. The class could switch from gallons to liters internally without changing any caller. **That's** real encapsulation.

---

## Class Organization

A well-organized class follows a predictable structure:

```
  ┌─────────────────────────────────┐
  │  Static constants               │
  │  Private fields                 │
  ├─────────────────────────────────┤
  │  Constructor                    │
  ├─────────────────────────────────┤
  │  Public methods                 │  ← The interface — what callers use
  ├─────────────────────────────────┤
  │  Private methods                │  ← Implementation details
  │  (called by the public methods  │
  │   directly above them)          │
  └─────────────────────────────────┘
```

```ts
class OrderProcessor {
  private static readonly MAX_RETRIES = 3;

  private readonly paymentGateway: PaymentGateway;
  private readonly inventory: InventoryService;
  private readonly notifier: NotificationService;

  constructor(
    paymentGateway: PaymentGateway,
    inventory: InventoryService,
    notifier: NotificationService,
  ) {
    this.paymentGateway = paymentGateway;
    this.inventory = inventory;
    this.notifier = notifier;
  }

  // --- Public API ---

  async processOrder(order: Order): Promise<Receipt> {
    this.validateOrder(order);
    const total = this.calculateTotal(order);
    const receipt = await this.chargeCustomer(order.customer, total);
    await this.fulfillOrder(order);
    this.notifier.sendConfirmation(order.customer, receipt);
    return receipt;
  }

  // --- Private Implementation ---

  private validateOrder(order: Order): void {
    if (!order.items.length) throw new Error("Empty order");
  }

  private calculateTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private async chargeCustomer(customer: Customer, amount: number): Promise<Receipt> {
    return this.paymentGateway.charge(customer.paymentMethod, amount);
  }

  private async fulfillOrder(order: Order): void {
    for (const item of order.items) {
      await this.inventory.reserve(item.productId, item.quantity);
    }
  }
}
```

Public methods first — the reader sees what the class does. Private methods follow in the order they're called.

---

## Classes Should Be Small — The Single Responsibility Principle (SRP)

A class should have **one reason to change**. Not one method — one *responsibility*.

### A: Bad — God class with multiple responsibilities

```ts
class UserManager {
  // Responsibility 1: User CRUD
  createUser(data: UserData): User { ... }
  updateUser(id: string, data: UserData): User { ... }
  deleteUser(id: string): void { ... }

  // Responsibility 2: Authentication
  login(email: string, password: string): Token { ... }
  logout(token: string): void { ... }
  resetPassword(email: string): void { ... }

  // Responsibility 3: Email notifications
  sendWelcomeEmail(user: User): void { ... }
  sendPasswordResetEmail(user: User, token: string): void { ... }

  // Responsibility 4: Reporting
  generateActivityReport(userId: string): Report { ... }
  getLoginHistory(userId: string): LoginEvent[] { ... }
}
```

If the email provider changes, you modify `UserManager`. If the authentication strategy changes, you modify `UserManager`. If the report format changes, you modify `UserManager`. One class with four reasons to change.

### B: Clean — each class has one responsibility

```ts
class UserRepository {
  create(data: UserData): User { ... }
  update(id: string, data: UserData): User { ... }
  delete(id: string): void { ... }
}

class AuthenticationService {
  login(email: string, password: string): Token { ... }
  logout(token: string): void { ... }
  resetPassword(email: string): void { ... }
}

class UserNotifier {
  sendWelcome(user: User): void { ... }
  sendPasswordReset(user: User, token: string): void { ... }
}

class UserReportGenerator {
  generateActivityReport(userId: string): Report { ... }
  getLoginHistory(userId: string): LoginEvent[] { ... }
}
```

Each class has **one reason to change**. The email provider changes? Only `UserNotifier` is affected. Auth strategy changes? Only `AuthenticationService`. The blast radius of any change is contained.

---

## Cohesion

A class is **cohesive** when its methods and fields work together — every method uses most of the fields. Low cohesion means the class is doing unrelated things.

### A: Bad — low cohesion (fields used by unrelated method groups)

```ts
class Employee {
  name: string;
  email: string;
  salary: number;
  department: string;
  taxBracket: string;
  healthPlan: string;

  // These methods use name, email, department
  getContactInfo() { ... }
  transferDepartment(newDept: string) { ... }

  // These methods use salary, taxBracket — completely different fields
  calculatePaycheck() { ... }
  calculateTaxWithholding() { ... }

  // This method uses healthPlan — yet another unrelated field
  getHealthBenefits() { ... }
}
```

Three groups of methods, each using different fields. The class is three responsibilities pretending to be one.

### B: Clean — split into cohesive classes

```ts
class Employee {
  name: string;
  email: string;
  department: string;

  getContactInfo() { ... }
  transferDepartment(newDept: string) { ... }
}

class Payroll {
  salary: number;
  taxBracket: string;

  calculatePaycheck() { ... }
  calculateTaxWithholding() { ... }
}

class Benefits {
  healthPlan: string;

  getHealthBenefits() { ... }
}
```

Now each class is cohesive — every method uses the fields in its class.

**The signal:** when you notice a class splitting into groups of methods that use different subsets of fields, it's time to extract those groups into separate classes.

---

## Organizing for Change — OCP and DIP

### Open-Closed Principle (OCP)

Classes should be **open for extension, closed for modification**. You should be able to add new behavior without changing existing code.

### A: Bad — must modify existing code to add a new format

```ts
class ReportGenerator {
  generate(data: SalesData, format: string): string {
    if (format === "html") {
      return `<h1>Sales Report</h1><p>Total: ${data.total}</p>`;
    } else if (format === "csv") {
      return `Total\n${data.total}`;
    } else if (format === "pdf") {
      // ... PDF generation
    }
    // Adding JSON format? Must modify THIS class.
  }
}
```

### B: Clean — extend without modifying

```ts
interface ReportFormatter {
  format(data: SalesData): string;
}

class HtmlReportFormatter implements ReportFormatter {
  format(data: SalesData): string {
    return `<h1>Sales Report</h1><p>Total: ${data.total}</p>`;
  }
}

class CsvReportFormatter implements ReportFormatter {
  format(data: SalesData): string {
    return `Total\n${data.total}`;
  }
}

// Adding JSON? Create a new class. No existing code changes.
class JsonReportFormatter implements ReportFormatter {
  format(data: SalesData): string {
    return JSON.stringify({ total: data.total });
  }
}

class ReportGenerator {
  constructor(private formatter: ReportFormatter) {}

  generate(data: SalesData): string {
    return this.formatter.format(data);
  }
}
```

### Dependency Inversion Principle (DIP)

High-level modules should not depend on low-level modules. Both should depend on **abstractions** (interfaces).

### A: Bad — high-level depends on low-level

```ts
class OrderService {
  private db = new PostgresDatabase();   // ← tightly coupled to Postgres
  private mailer = new SendGridMailer(); // ← tightly coupled to SendGrid

  createOrder(data: OrderData): Order {
    const order = this.db.insert("orders", data);
    this.mailer.send(data.customerEmail, "Order confirmed");
    return order;
  }
}
```

Can't test without a real Postgres database. Can't switch email providers without modifying `OrderService`.

### B: Clean — depend on abstractions

```ts
interface Database {
  insert(table: string, data: any): any;
}

interface Mailer {
  send(to: string, subject: string): void;
}

class OrderService {
  constructor(
    private db: Database,        // ← depends on abstraction
    private mailer: Mailer,      // ← depends on abstraction
  ) {}

  createOrder(data: OrderData): Order {
    const order = this.db.insert("orders", data);
    this.mailer.send(data.customerEmail, "Order confirmed");
    return order;
  }
}

// In production:
new OrderService(new PostgresDatabase(), new SendGridMailer());

// In tests:
new OrderService(new InMemoryDatabase(), new MockMailer());
```

`OrderService` no longer knows or cares what database or mailer it uses. Dependencies point toward abstractions, not implementations.

---

## Key Takeaways

1. **The fundamental tradeoff** — procedural is easy to add functions, OOP is easy to add types. Choose based on what will change.
2. **Real encapsulation** — hide implementation, expose behavior. Getters for every field is not encapsulation.
3. **Class organization** — constants, fields, constructor, public methods, private methods. Top to bottom.
4. **SRP** — a class should have one reason to change. If it has "and" in its description, split it.
5. **Cohesion** — methods should use the class's fields. If groups of methods use different field subsets, extract classes.
6. **OCP** — add new behavior by creating new classes, not modifying existing ones.
7. **DIP** — depend on abstractions (interfaces), not concrete implementations. This enables testing and flexibility.
