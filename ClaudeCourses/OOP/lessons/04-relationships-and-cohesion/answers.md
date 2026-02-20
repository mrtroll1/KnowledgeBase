# Lesson 4: Relationships, Cohesion & Architecture — Answers

## Q1

There are three distinct clusters of methods that don't interact with each other:

**Group A — Data Access** (all use the `db` field, handle CRUD):
- `getProduct`, `searchProducts`, `saveProduct`
- Becomes: `ProductRepository`

**Group B — Pricing Logic** (pure business rules about prices):
- `calculateDiscount`, `applySeasonalPricing`, `formatPriceForDisplay`
- Becomes: `PricingService`

**Group C — Reporting** (generates and distributes reports):
- `generateProductReport`, `exportProductsToCSV`, `emailReportToManager`
- Becomes: `ProductReportService`

The test: Group A methods use the `db` field. Group B methods only need a `Product` and some numbers. Group C methods need a list of products and a mailer. They share no internal state. Three responsibilities, three classes.

Note: `emailReportToManager` might even be split further (SRP) — reporting and email delivery are different concerns. But splitting Group C into `ProductReportGenerator` and `ReportDistributor` depends on whether the email logic is complex enough to justify its own class.

## Q2

- **`Engine` and `Car`**: **Composition** (filled diamond ◆ on the Car side pointing to Engine). Car owns an Engine. The `- engine: Engine` private field confirms this. When the Car is destroyed, its Engine goes with it.

- **`Vehicle` and `Car`**: **Inheritance** (solid line with hollow arrow ▲). Car extends Vehicle. Car "is-a" Vehicle and inherits the `# speed` protected field and `+ accelerate()` method.

- **`Drivable` and `Car`**: **Interface implementation** (dashed line with hollow arrow ▲). Car implements the Drivable interface. Car is contractually required to provide a `drive()` method. This goes through Vehicle (Vehicle implements Drivable, Car extends Vehicle), or Car implements it directly — both readings are valid from the diagram.

## Q3

Two tight coupling points:

**1. Database coupling:** `new MySQLConnection("prod-server", 3306, "analytics")` — the class knows the database type, server address, port, and database name. Change any of these and you're editing `ReportGenerator`.

**2. Formatter coupling:** `new PDFFormatter()` with hardcoded font and margins — the class knows the exact output format and styling. Want HTML reports? Edit `ReportGenerator`.

Fix with DIP — depend on abstractions:

```typescript
interface DataSource {
  getSalesData(month: string): SalesData[];
}

interface ReportFormatter {
  render(data: SalesData[]): string;
}

class ReportGenerator {
  constructor(
    private dataSource: DataSource,
    private formatter: ReportFormatter
  ) {}

  generateMonthlyReport(): string {
    const data = this.dataSource.getSalesData("current");
    return this.formatter.render(data);
  }
}
```

Now `ReportGenerator` doesn't know about MySQL or PDF. You can inject a `PostgresDataSource` or a `HTMLFormatter` without changing a single line in `ReportGenerator`.

## Q4

**Diagnosis:** Classic "God Class" — a class with low cohesion that has become a responsibility magnet. 47 methods and 12 fields means the class almost certainly has multiple unrelated responsibilities. The frequent bugs happen because every change risks breaking unrelated features within the same class.

**Plan:**

1. **Map the method clusters.** Group the 47 methods by which private fields they access. Methods that share the same fields are likely one cohesive responsibility. You'll probably find 4-6 clusters.

2. **Name the responsibilities.** Each cluster gets a name: maybe `UserRepository` (CRUD), `AuthService` (login, tokens), `UserProfileService` (profile updates), `UserPreferencesService` (settings), etc.

3. **Extract one cluster at a time.** Don't rewrite everything at once. Start with the cluster that changes most often (the biggest bug source). Move those methods into a new class. Have `UserManager` delegate to the new class — this way existing callers don't break.

4. **Update callers gradually.** Once a cluster is extracted, start pointing callers directly at the new class instead of going through `UserManager`.

5. **Repeat** until `UserManager` is either gone or is a thin facade that delegates to focused services.

The goal: each new class has high cohesion (all methods serve one purpose) and the classes are loosely coupled (interacting through interfaces where appropriate). Bugs become contained — a change to authentication can't accidentally break profile updates because they're in different classes.

## Q5

**A) 200-line if/else PaymentProcessor:**

- **OCP (Open/Closed Principle)** — the class must be modified for every new payment method.
- **Strategy Pattern or Factory Method** — define a `PaymentMethod` interface, one implementation per provider. The processor delegates to the appropriate implementation.
- The if/else becomes a factory that selects the right `PaymentMethod`, and the processing logic lives in each implementation.

**B) NotificationManager doing four things:**

- **SRP** — four reasons to change in one class.
- **Split into focused classes:**
  - `NotificationSender` — handles delivery
  - `NotificationStatusTracker` — read/unread state
  - `NotificationDigestService` — compiles and sends digests
  - `NotificationPreferencesService` — user settings
- Optionally, **Pub/Sub** could decouple the sending from the status tracking and digest generation — sending a notification publishes an event, and the other services subscribe.

**C) DatabaseService used directly by 15 classes:**

- **DIP (Dependency Inversion Principle)** — all 15 classes are tightly coupled to a concrete database implementation.
- **Introduce an interface** (`DataStore` or similar) that defines the operations those 15 classes need. Have `MongoDataStore` and `PostgresDataStore` implement it.
- **Inject the interface** instead of the concrete class. Now switching from MongoDB to PostgreSQL means writing a new implementation and changing the dependency injection configuration — the 15 classes don't change at all.
- If the 15 classes all need different queries, consider whether some of them should have their own **Repository** abstraction (Repository Pattern) rather than all sharing one generic data service.
