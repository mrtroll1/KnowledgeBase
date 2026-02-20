# Lesson 4: Relationships, Cohesion & Architecture — Quiz

## Q1

Look at this class. Identify the cohesion problem and propose how to split it. Be specific about which methods go where.

```typescript
class ProductService {
  constructor(private db: Database) {}

  // Group A
  getProduct(id: string): Product { /* ... */ }
  searchProducts(query: string): Product[] { /* ... */ }
  saveProduct(product: Product): void { /* ... */ }

  // Group B
  calculateDiscount(product: Product, quantity: number): number { /* ... */ }
  applySeasonalPricing(product: Product): number { /* ... */ }
  formatPriceForDisplay(price: number, currency: string): string { /* ... */ }

  // Group C
  generateProductReport(products: Product[]): Report { /* ... */ }
  exportProductsToCSV(products: Product[]): string { /* ... */ }
  emailReportToManager(report: Report): void { /* ... */ }
}
```

---

## Q2

Read this UML diagram and answer: What is the relationship between `Engine` and `Car`? Between `Vehicle` and `Car`? Between `Drivable` and `Car`?

```
┌──────────────┐
│ «interface»  │
│  Drivable    │
├──────────────┤
│ + drive()    │
└──────▲───────┘
       ┆
       ┆
┌──────┴───────┐       ┌──────────────┐
│   Vehicle    │       │    Engine     │
├──────────────┤       ├──────────────┤
│ # speed: int │       │ - hp: number │
├──────────────┤       │ + start()    │
│ + accelerate()│      └──────────────┘
└──────▲───────┘              ▲
       │                      │
       │               ◆──────┘
┌──────┴───────────────┴──┐
│          Car             │
├──────────────────────────┤
│ - engine: Engine         │
│ + drive(): void          │
└──────────────────────────┘
```

---

## Q3

This code has a coupling problem. Where is the tight coupling, and how would you fix it?

```typescript
class ReportGenerator {
  generateMonthlyReport(): string {
    const db = new MySQLConnection("prod-server", 3306, "analytics");
    const data = db.query("SELECT * FROM sales WHERE month = CURRENT_MONTH");

    const formatter = new PDFFormatter();
    formatter.setFont("Arial", 12);
    formatter.setMargins(20, 20, 20, 20);

    return formatter.render(data);
  }
}
```

---

## Q4

You join a team and find that every sprint, at least 3 bugs are introduced when modifying the `UserManager` class. The class has 47 methods and 12 private fields. The team says "it's the most important class in the system."

Using the concepts from this lesson, diagnose the problem and outline a plan to fix it (you don't need to write code — describe the approach).

---

## Q5

For each scenario, identify which combination of principles and patterns you would apply, and why:

**A)** A `PaymentProcessor` class has a 200-line `processPayment()` method with if/else branches for credit card, PayPal, bank transfer, crypto, and Apple Pay.

**B)** A `NotificationManager` handles sending notifications AND tracks read/unread status AND generates notification digest emails AND manages user notification preferences.

**C)** Your `DatabaseService` is used directly by 15 different classes. You need to switch from MongoDB to PostgreSQL.
