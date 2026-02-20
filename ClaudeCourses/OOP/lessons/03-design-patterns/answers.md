# Lesson 3: Design Patterns — Answers

## Q1

Combine **Singleton** with **Dependency Inversion** (and optionally **Strategy pattern** for the destination):

```typescript
interface LogDestination {
  write(message: string): void;
}

class ConsoleDestination implements LogDestination {
  write(message: string): void { console.log(message); }
}

class FileDestination implements LogDestination {
  write(message: string): void { fs.appendFileSync("app.log", message + "\n"); }
}

class Logger {
  private static instance: Logger;

  private constructor(private destination: LogDestination) {}

  static initialize(destination: LogDestination): void {
    Logger.instance = new Logger(destination);
  }

  static getInstance(): Logger {
    if (!Logger.instance) throw new Error("Logger not initialized");
    return Logger.instance;
  }

  log(message: string): void {
    this.destination.write(message);
  }
}

// At app startup
Logger.initialize(new FileDestination());

// Anywhere in the app
Logger.getInstance().log("Something happened");
```

The patterns combined: **Singleton** (one instance), **DIP** (depend on `LogDestination` abstraction, not a concrete class), and **Strategy** (the destination is a swappable behavior). This keeps the single-instance guarantee while allowing the log destination to be configured at startup.

## Q2

**Template Method.** The pipeline has a fixed algorithm skeleton (steps 1-5 in order), with some steps that are the same across all implementations (lint, test, build) and some that vary by environment (pull, deploy).

```typescript
abstract class CIPipeline {
  run(): void {
    this.pullCode();      // Varies — abstract
    this.lint();          // Fixed
    this.runTests();      // Fixed
    this.buildArtifacts(); // Fixed
    this.deploy();        // Varies — abstract
  }

  protected abstract pullCode(): void;
  protected abstract deploy(): void;

  private lint(): void { /* same for all */ }
  private runTests(): void { /* same for all */ }
  private buildArtifacts(): void { /* same for all */ }
}

class GitHubAWSPipeline extends CIPipeline {
  protected pullCode(): void { /* GitHub-specific */ }
  protected deploy(): void { /* AWS-specific */ }
}
```

The key reason it's Template Method and not Strategy: the **order of steps is enforced** by the base class. Subclasses can't skip linting or reorder deployment before testing.

## Q3

The subscriber is **mutating the event data** (`order.discount = 0.1`). This is dangerous in Pub/Sub because:

1. **Multiple subscribers share the same object reference.** If subscriber A mutates the order before subscriber B runs, subscriber B sees the modified version — it doesn't know the order was changed.
2. **Side-effect ordering becomes important.** Pub/Sub is supposed to give you independent, order-agnostic subscribers. Mutation creates hidden dependencies between them.
3. **The publisher's data is corrupted.** `OrderService` published the original order, but a subscriber silently changed it. If `OrderService` reads the order later, it sees the discount it never applied.

The fix: subscribers should either work with their own copies of the data, or publish new events rather than mutating:

```typescript
eventBus.subscribe("order.placed", (order: Order) => {
  const total = order.items.reduce((sum, i) => sum + i.price, 0);
  if (total > 100) {
    // Don't mutate — publish a NEW event
    eventBus.publish("discount.applied", { orderId: order.id, discount: 0.1 });
  }
});
```

## Q4

```typescript
interface NotificationChannel {
  send(to: string, message: string): void;
}

class EmailNotification implements NotificationChannel {
  send(to: string, message: string): void {
    const transport = nodemailer.createTransport({ /* ... */ });
    transport.sendMail({ to, subject: "Notification", text: message });
  }
}

class SmsNotification implements NotificationChannel {
  send(to: string, message: string): void {
    twilioClient.messages.create({ to, body: message });
  }
}

class PushNotification implements NotificationChannel {
  send(to: string, message: string): void {
    firebaseAdmin.messaging().send({ token: to, notification: { body: message } });
  }
}

// Factory
class NotificationFactory {
  static create(type: "email" | "sms" | "push"): NotificationChannel {
    switch (type) {
      case "email": return new EmailNotification();
      case "sms":   return new SmsNotification();
      case "push":  return new PushNotification();
    }
  }
}

// Usage
const channel = NotificationFactory.create("email");
channel.send("user@example.com", "Hello!");
```

The `switch` still exists, but it's isolated in the factory — the rest of the codebase works with the `NotificationChannel` interface. Adding a new channel means adding one class and one `case`, without touching any existing sending logic.

## Q5

The controller is **fat** — it contains business logic that belongs in the model:
- Stock validation (`product.stock < quantity`)
- Discount calculation (`quantity > 10`, `quantity > 50`)
- Stock mutation (`product.stock -= quantity`)

In MVC, the controller should be a thin router. The model should own all business rules:

```typescript
// FAT MODEL — business logic lives here
class ProductModel {
  purchase(productId: string, quantity: number): PurchaseResult {
    const product = this.getProduct(productId);

    if (product.stock < quantity) {
      return { success: false, error: "Not enough stock" };
    }

    const finalPrice = this.applyBulkDiscount(product.price, quantity);
    product.stock -= quantity;
    this.saveProduct(product);

    return {
      success: true,
      message: `Purchased ${quantity} x ${product.name} at $${finalPrice} each`
    };
  }

  private applyBulkDiscount(price: number, quantity: number): number {
    if (quantity > 50) return price * 0.8;
    if (quantity > 10) return price * 0.9;
    return price;
  }
}

// THIN CONTROLLER — just routes between view and model
class ProductController {
  handlePurchase(productId: string, quantity: number): void {
    const result = this.model.purchase(productId, quantity);
    if (result.success) {
      this.view.showConfirmation(result.message);
    } else {
      this.view.showError(result.error);
    }
  }
}
```

Now the discount logic and stock validation can be unit-tested by calling `model.purchase()` directly — no view or controller needed. The controller's only job is to relay the user action to the model and the result to the view.
