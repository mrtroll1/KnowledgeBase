# Lesson 5: Objects & Data Structures — Answers

## Q1

**OOP.** The key question is: "What changes more often — types or operations?"

You said new payment methods are added frequently (new types), but the operations (charge, refund, validate) are stable. This is exactly where OOP shines:

```ts
interface PaymentMethod {
  charge(amount: number): Promise<Receipt>;
  refund(transactionId: string): Promise<void>;
  validate(): boolean;
}

class CreditCard implements PaymentMethod { ... }
class PayPal implements PaymentMethod { ... }
class BankTransfer implements PaymentMethod { ... }
// New: just add a class. No existing code changes.
class CryptoWallet implements PaymentMethod { ... }
```

With a procedural approach, every new payment method would require modifying every function that switches on type — `charge()`, `refund()`, `validate()` — a maintenance nightmare.

## Q2

This is **fake encapsulation**. The fields are private, but the class exposes:

1. **Raw getters that leak internals** — `getBalance()` returns the exact internal number. `getTransactions()` returns the actual array (callers can mutate it directly).
2. **`setBalance()` bypasses all business rules** — anyone can set the balance to any value, including negative. There's no validation, no audit trail, no transaction record.

The class is just a struct with extra syntax. Real encapsulation would look like:

```ts
class BankAccount {
  private balance: number = 0;
  private transactions: Transaction[] = [];

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Deposit must be positive");
    this.balance += amount;
    this.transactions.push({ type: "deposit", amount, date: new Date() });
  }

  withdraw(amount: number): void {
    if (amount > this.balance) throw new Error("Insufficient funds");
    this.balance -= amount;
    this.transactions.push({ type: "withdrawal", amount, date: new Date() });
  }

  getStatement(): ReadonlyArray<Transaction> {
    return [...this.transactions]; // Return a copy, not the actual array
  }

  getCurrentBalance(): number {
    return this.balance;
  }
}
```

Now the class controls **how** its state changes. You can't set an arbitrary balance. Every change goes through a business-rule-enforced method and leaves a transaction trail. The transactions array can't be mutated externally.

## Q3

The `Product` class has at least three responsibilities:

1. **Core product data + pricing** — name, price, applyDiscount
2. **Shipping calculation** — weight, calculateShipping
3. **Rendering / presentation** — renderCard, renderDetailPage, generateSeoMetadata

Split:

```ts
// Data structure — just the product data
class Product {
  name: string;
  price: number;
  weight: number;
  description: string;
  imageUrl: string;

  applyDiscount(percentage: number): void {
    this.price = this.price * (1 - percentage / 100);
  }
}

// Shipping — uses weight
class ShippingCalculator {
  calculateCost(product: Product, destination: Address): number {
    // Uses product.weight and destination
  }
}

// Rendering — uses display fields
class ProductRenderer {
  renderCard(product: Product): string {
    // Uses name, price, imageUrl
  }

  renderDetailPage(product: Product): string {
    // Uses name, price, description, imageUrl
  }
}

// SEO — uses content fields
class SeoMetadataGenerator {
  generate(product: Product): object {
    // Uses name, description
  }
}
```

Now shipping logic changes don't risk breaking rendering. A new rendering format doesn't touch shipping. Each class is cohesive — its methods work with a focused set of data.

## Q4

`NotificationService` directly instantiates `SlackClient` and `TwilioClient` — concrete implementations. It's tightly coupled to Slack and Twilio. You can't test without real API credentials, can't switch to Discord or a different SMS provider without modifying this class.

Fixed with DIP:

```ts
interface TeamMessenger {
  sendMessage(channel: string, message: string): Promise<void>;
}

interface SmsProvider {
  sendSms(phone: string, message: string): Promise<void>;
}

class NotificationService {
  constructor(
    private teamMessenger: TeamMessenger,
    private smsProvider: SmsProvider,
  ) {}

  async notifyTeam(message: string): Promise<void> {
    await this.teamMessenger.sendMessage("#alerts", message);
  }

  async notifyCustomer(phone: string, message: string): Promise<void> {
    await this.smsProvider.sendSms(phone, message);
  }
}

// Production
new NotificationService(
  new SlackMessenger("https://hooks.slack.com/xxx"),
  new TwilioSmsProvider("account_sid", "auth_token"),
);

// Test
new NotificationService(
  new MockMessenger(),
  new MockSmsProvider(),
);
```

`NotificationService` now depends on abstractions (`TeamMessenger`, `SmsProvider`). Swap Slack for Discord? Create `DiscordMessenger implements TeamMessenger` — `NotificationService` doesn't change.

## Q5

Consider a data analytics pipeline where you have a fixed set of data types (e.g., `SalesRecord`, `InventoryRecord`, `CustomerRecord`) but you're constantly adding new operations (new reports, new aggregations, new export formats).

```ts
// The data types are stable — these don't change
interface SalesRecord {
  date: Date;
  amount: number;
  productId: string;
}

interface InventoryRecord {
  productId: string;
  quantity: number;
  warehouse: string;
}

// Procedural: just add a new function for each new operation
function totalSalesByMonth(records: SalesRecord[]): Map<string, number> { ... }
function averageOrderValue(records: SalesRecord[]): number { ... }
function lowStockAlert(records: InventoryRecord[]): InventoryRecord[] { ... }

// New report? Just add a new function. Zero changes to existing code.
function salesByRegion(records: SalesRecord[]): Map<string, number> { ... }
```

With OOP, adding a new operation (like `salesByRegion`) would mean adding a method to the `Record` interface and implementing it in every class. For a system where you add new operations weekly but the data types are stable, that's constant churn on existing classes for no benefit.

The rule: **if your types are stable but operations grow, procedural wins. If your operations are stable but types grow, OOP wins.** Applying OOP everywhere ignores this tradeoff.
