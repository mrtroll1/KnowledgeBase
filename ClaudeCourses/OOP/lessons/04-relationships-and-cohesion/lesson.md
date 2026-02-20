# Lesson 4: Relationships, Cohesion & Architecture

## The Problem — When Classes Grow Wrong

You've learned principles and patterns. But how do you know when your architecture is going off the rails? How do you spot a class that does too much, or two classes that are dangerously intertwined? This lesson gives you the diagnostic tools.

---

## Cohesion — Does This Class Belong Together?

Cohesion measures how strongly the members of a class relate to each other. High cohesion means everything in the class works toward the same purpose. Low cohesion means the class is a grab bag of unrelated responsibilities.

### Low Cohesion — The "God Class"

```typescript
// Low cohesion — what IS this class?
class UserManager {
  // User CRUD
  createUser(name: string, email: string): User { /* ... */ }
  deleteUser(id: string): void { /* ... */ }

  // Authentication
  login(email: string, password: string): Token { /* ... */ }
  resetPassword(email: string): void { /* ... */ }

  // Email
  sendWelcomeEmail(user: User): void { /* ... */ }
  sendPasswordResetEmail(email: string): void { /* ... */ }

  // Reporting
  generateUserReport(): Report { /* ... */ }
  exportUsersToCSV(): string { /* ... */ }

  // Payment
  chargeUser(userId: string, amount: number): void { /* ... */ }
  refundUser(userId: string, amount: number): void { /* ... */ }
}
```

This class has **five unrelated responsibilities**. The methods cluster into groups that don't interact with each other — `sendWelcomeEmail` has nothing to do with `chargeUser`. That's the smell of low cohesion.

**A quick test:** If you can split the class's methods into groups where each group uses a different subset of the class's fields, the class has low cohesion.

### High Cohesion — Focused Classes

```typescript
class UserRepository {
  createUser(name: string, email: string): User { /* ... */ }
  deleteUser(id: string): void { /* ... */ }
  findById(id: string): User { /* ... */ }
}

class AuthService {
  constructor(private userRepo: UserRepository) {}
  login(email: string, password: string): Token { /* ... */ }
  resetPassword(email: string): void { /* ... */ }
}

class UserEmailService {
  sendWelcomeEmail(user: User): void { /* ... */ }
  sendPasswordResetEmail(email: string): void { /* ... */ }
}

class UserReportGenerator {
  generateReport(users: User[]): Report { /* ... */ }
  exportToCSV(users: User[]): string { /* ... */ }
}

class PaymentService {
  chargeUser(userId: string, amount: number): void { /* ... */ }
  refundUser(userId: string, amount: number): void { /* ... */ }
}
```

Each class has one clear purpose. All methods within each class operate on the same data and serve the same concern. That's high cohesion.

---

## Coupling — How Entangled Are Your Classes?

Coupling measures how much one class depends on the internals of another. Tight coupling means a change in one class forces changes in another. Loose coupling means classes interact through stable interfaces.

### Tight Coupling

```typescript
// Tight coupling — OrderProcessor knows the INTERNALS of InventoryDatabase
class OrderProcessor {
  processOrder(order: Order): void {
    // Knows the database is MySQL
    const db = new MySQLConnection("localhost", 3306, "inventory_db");

    // Knows the table structure
    const rows = db.query(
      `SELECT quantity FROM products WHERE id = '${order.productId}'`
    );

    // Knows the column name
    if (rows[0].quantity < order.quantity) {
      throw new Error("Out of stock");
    }

    // Knows the update syntax
    db.query(
      `UPDATE products SET quantity = quantity - ${order.quantity}
       WHERE id = '${order.productId}'`
    );
  }
}
```

`OrderProcessor` is tightly coupled to MySQL, the table schema, column names, and SQL syntax. Change the database to PostgreSQL? Rewrite `OrderProcessor`. Rename a column? Rewrite `OrderProcessor`.

### Loose Coupling

```typescript
// Loose coupling — OrderProcessor only knows the interface
interface InventoryService {
  checkStock(productId: string): number;
  reduceStock(productId: string, quantity: number): void;
}

class OrderProcessor {
  constructor(private inventory: InventoryService) {}

  processOrder(order: Order): void {
    const available = this.inventory.checkStock(order.productId);
    if (available < order.quantity) {
      throw new Error("Out of stock");
    }
    this.inventory.reduceStock(order.productId, order.quantity);
  }
}
```

`OrderProcessor` knows nothing about MySQL, tables, or SQL. It talks to an interface. The database could be PostgreSQL, an in-memory cache, or a third-party API — `OrderProcessor` doesn't care.

### The Coupling/Cohesion Sweet Spot

```
                   HIGH COHESION
                        ▲
                        │
            GOAL ───►   │   ◄── Each class is focused
          (top-right)   │       AND loosely connected
                        │
  LOOSE ◄───────────────┼───────────────► TIGHT
  COUPLING              │              COUPLING
                        │
                        │   ◄── Avoid: unfocused classes
                        │       that are tangled together
                        │
                        ▼
                   LOW COHESION
```

**The goal is always top-left: high cohesion (focused classes) with loose coupling (minimal dependencies).**

---

## How to Identify Low Cohesion and Split Classes

### Smell #1: The class has methods that don't use each other

```typescript
class ReportService {
  // Group A — these methods call each other
  generateSalesReport(): Report { /* uses calculateTotals() */ }
  calculateTotals(): number { /* uses fetchSalesData() */ }
  fetchSalesData(): SalesData[] { /* ... */ }

  // Group B — these methods call each other, but NEVER call Group A
  generateInventoryReport(): Report { /* uses getStockLevels() */ }
  getStockLevels(): StockLevel[] { /* ... */ }
  flagLowStock(levels: StockLevel[]): StockLevel[] { /* ... */ }
}
```

Two independent clusters. Split into `SalesReportService` and `InventoryReportService`.

### Smell #2: The class name is vague

If the class is called `Manager`, `Handler`, `Processor`, or `Utils` — it's probably a dumping ground. Good class names are specific: `OrderValidator`, `PriceCalculator`, `EmailSender`.

### Smell #3: The constructor takes too many dependencies

```typescript
class OrderService {
  constructor(
    private db: Database,
    private emailer: EmailService,
    private paymentGateway: PaymentGateway,
    private inventoryService: InventoryService,
    private shippingService: ShippingService,
    private analyticsService: AnalyticsService,
    private notificationService: NotificationService,
    private taxCalculator: TaxCalculator
  ) {}
}
```

Eight dependencies is a strong signal this class does too much. Each dependency is a reason the class might change. Split by responsibility.

### Smell #4: You keep modifying the same class for unrelated features

If every feature request touches `UserManager` regardless of what the feature is — the class is a responsibility magnet. Track which classes change most often and why.

---

## UML Basics — Reading Class Diagrams

You don't need to master UML, but you need to read class diagrams — they show up in design docs, architecture discussions, and pattern explanations.

### Class Box

```
┌────────────────────────────┐
│        ClassName           │  ← Name (bold or top section)
├────────────────────────────┤
│ - privateField: Type       │  ← Attributes (fields)
│ # protectedField: Type     │     - = private
│ + publicField: Type        │     # = protected
├────────────────────────────┤     + = public
│ + publicMethod(): RetType  │  ← Operations (methods)
│ - privateMethod(): void    │
│ # protectedMethod(): Type  │
└────────────────────────────┘
```

### Relationships

```
INHERITANCE (is-a)                    INTERFACE IMPLEMENTATION
    Animal                                «interface»
      ▲                                   Flyable
      │ (solid line,                        ▲
      │  hollow arrow)                      ┆ (dashed line,
      │                                     ┆  hollow arrow)
     Dog                                   Bird


COMPOSITION (owns, lifecycle-bound)   AGGREGATION (has, shared)
   House ◆──────── Room               Department ◇──────── Teacher
         (filled                                 (hollow
          diamond)                                diamond)


ASSOCIATION (uses/knows)              DEPENDENCY (temporary use)
   Doctor ──────── Patient            Controller - - - - ► Request
         (plain                                 (dashed line,
          line)                                  open arrow)
```

### Reading a Real Diagram

```
┌──────────────┐         ┌──────────────────┐
│  «interface» │         │  «abstract»      │
│  Payable     │         │  PaymentMethod   │
├──────────────┤         ├──────────────────┤
│ + pay(): void│         │ # amount: number │
└──────▲───────┘         │ + validate(): bool│
       ┆                 └────────▲─────────┘
       ┆                          │
       ┆                          │
┌──────┴──────────────────────────┴──┐
│          CreditCard                 │
├─────────────────────────────────────┤
│ - cardNumber: string               │
│ - expiry: Date                     │
├─────────────────────────────────────┤
│ + pay(): void                      │
│ + validate(): boolean              │
└─────────────────────────────────────┘
```

Reading this: `CreditCard` implements `Payable` (dashed arrow) and extends `PaymentMethod` (solid arrow). It inherits `amount` and must implement both `pay()` and `validate()`.

---

## Putting It All Together — A Decision Framework

When you're looking at code and deciding what to do, here's the thinking process:

### Step 1: Diagnose the problem

| Symptom | Likely Issue | Tool |
|---------|-------------|------|
| Class does many unrelated things | Low cohesion | Split the class (SRP) |
| Changing one class breaks another | Tight coupling | Introduce an interface (DIP) |
| Giant if/else on type | Missing polymorphism | Apply OCP (Strategy/Factory) |
| Duplicated logic across classes | Violated DRY | Extract shared behavior |
| Subclass throws "not supported" | Bad inheritance | Fix the hierarchy (LSP) |
| One action needs many reactions | Missing event system | Apply Pub/Sub |
| Algorithm is same but steps vary | Duplicated structure | Apply Template Method |

### Step 2: Choose the right tool

```
"I need to split this class"
    └─► Identify method clusters → each cluster becomes a class

"I need to decouple these classes"
    └─► Define an interface for their interaction → depend on the interface

"I need to add new types without modifying existing code"
    └─► Define a common interface → use Factory or Strategy

"I need one action to trigger many reactions"
    └─► Pub/Sub with an event bus

"I need to ensure consistency across a family of objects"
    └─► Abstract Factory

"I need the same algorithm with different steps"
    └─► Template Method
```

### Step 3: Validate with these questions

1. **Can I explain what this class does in one sentence?** If not, it might need splitting.
2. **If I change this class, what else breaks?** If the answer is "lots of things," coupling is too tight.
3. **Can I test this class in isolation?** If it requires a database, network, or UI to test, dependencies need inverting.
4. **Does the class name accurately describe everything it does?** If not, it's either poorly named or does too much.

---

## A Real Refactoring Walkthrough

Let's put it all together. Here's a messy class:

```typescript
class OrderManager {
  private db = new PostgresClient();

  async placeOrder(userId: string, items: CartItem[]): Promise<void> {
    // Validate
    if (items.length === 0) throw new Error("Empty cart");
    for (const item of items) {
      const stock = await this.db.query(`SELECT stock FROM products WHERE id = $1`, [item.productId]);
      if (stock.rows[0].stock < item.quantity) throw new Error(`${item.productId} out of stock`);
    }

    // Calculate
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }
    if (total > 500) total *= 0.9; // bulk discount

    // Save
    await this.db.query(`INSERT INTO orders (user_id, total) VALUES ($1, $2)`, [userId, total]);

    // Notify
    const user = await this.db.query(`SELECT email FROM users WHERE id = $1`, [userId]);
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      body: JSON.stringify({ to: user.rows[0].email, subject: "Order Confirmed", text: `Total: $${total}` })
    });
  }
}
```

**Diagnose:**
- Low cohesion: validation, calculation, persistence, and notification in one class
- Tight coupling: hardcoded PostgresClient and SendGrid
- Untestable: can't test business logic without a real DB and email API

**Refactored:**

```typescript
// Abstractions
interface OrderRepository {
  checkStock(productId: string): Promise<number>;
  save(userId: string, total: number): Promise<void>;
}

interface NotificationService {
  sendOrderConfirmation(email: string, total: number): Promise<void>;
}

interface UserRepository {
  getEmail(userId: string): Promise<string>;
}

// Business logic — pure, testable
class OrderCalculator {
  calculateTotal(items: CartItem[]): number {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return subtotal > 500 ? subtotal * 0.9 : subtotal;
  }
}

class OrderValidator {
  async validate(items: CartItem[], orderRepo: OrderRepository): Promise<void> {
    if (items.length === 0) throw new Error("Empty cart");
    for (const item of items) {
      const stock = await orderRepo.checkStock(item.productId);
      if (stock < item.quantity) throw new Error(`${item.productId} out of stock`);
    }
  }
}

// Orchestrator — thin, delegates everything
class OrderService {
  constructor(
    private validator: OrderValidator,
    private calculator: OrderCalculator,
    private orderRepo: OrderRepository,
    private userRepo: UserRepository,
    private notifier: NotificationService
  ) {}

  async placeOrder(userId: string, items: CartItem[]): Promise<void> {
    await this.validator.validate(items, this.orderRepo);
    const total = this.calculator.calculateTotal(items);
    await this.orderRepo.save(userId, total);
    const email = await this.userRepo.getEmail(userId);
    await this.notifier.sendOrderConfirmation(email, total);
  }
}
```

**What changed:**
- **High cohesion**: each class has one job
- **Loose coupling**: everything depends on interfaces
- **Testable**: `OrderCalculator` can be tested with plain objects, no DB needed
- **Extensible**: swap notification provider by implementing the interface

---

## Key Takeaways

1. **High cohesion** = every method in the class serves the same purpose. If methods cluster into unrelated groups, split the class.
2. **Loose coupling** = classes interact through interfaces, not internals. Change one class without breaking others.
3. **Spot low cohesion** by looking for: method clusters, vague class names, too many constructor dependencies, frequent unrelated changes.
4. **UML basics**: solid arrow = inheritance, dashed arrow = implements interface, filled diamond = composition, hollow diamond = aggregation.
5. **Diagnose before prescribing**: identify the symptom (low cohesion, tight coupling, missing polymorphism) before reaching for a pattern.
6. **The goal is always** high cohesion + loose coupling. Every principle and pattern from this course serves that goal.
