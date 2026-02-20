# Lesson 3: Design Patterns — Quiz

## Q1

You're building a logging system. The requirements are:
- Only one logger instance should exist across the entire application
- Different modules should be able to log without knowing about each other
- The log destination (file, console, remote server) should be swappable

Your colleague proposes this design:

```typescript
class Logger {
  private static instance: Logger;
  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) Logger.instance = new Logger();
    return Logger.instance;
  }

  log(message: string): void {
    console.log(message);  // Hardcoded to console
  }
}
```

This covers the first two requirements but not the third. How would you redesign this to also support swappable destinations? Which patterns are you combining?

---

## Q2

Which design pattern best fits this scenario, and why?

You're building a CI/CD pipeline. Every pipeline run follows the same structure:
1. Pull code from repository
2. Run linting
3. Run tests
4. Build artifacts
5. Deploy

Steps 1 and 5 vary by environment (GitHub vs GitLab, AWS vs Azure), but steps 2-4 are always the same.

---

## Q3

What is wrong with this Pub/Sub implementation? Identify the architectural problem.

```typescript
class OrderService {
  constructor(private eventBus: EventBus) {}

  placeOrder(order: Order): void {
    this.saveOrder(order);
    this.eventBus.publish("order.placed", order);
  }

  private saveOrder(order: Order): void { /* ... */ }
}

// Subscriber
eventBus.subscribe("order.placed", (order: Order) => {
  const total = order.items.reduce((sum, i) => sum + i.price, 0);
  if (total > 100) {
    order.discount = 0.1;  // Mutating the order object!
    orderService.updateOrder(order);
  }
});
```

---

## Q4

Refactor the following code using the Factory Method pattern:

```typescript
class NotificationSender {
  send(type: "email" | "sms" | "push", to: string, message: string): void {
    if (type === "email") {
      const transport = nodemailer.createTransport({ /* ... */ });
      transport.sendMail({ to, subject: "Notification", text: message });
    } else if (type === "sms") {
      twilioClient.messages.create({ to, body: message });
    } else if (type === "push") {
      firebaseAdmin.messaging().send({ token: to, notification: { body: message } });
    }
  }
}
```

---

## Q5

In the MVC pattern, you find this code in a Controller:

```typescript
class ProductController {
  handlePurchase(productId: string, quantity: number): void {
    const product = this.model.getProduct(productId);
    if (product.stock < quantity) {
      this.view.showError("Not enough stock");
      return;
    }
    if (quantity > 10) {
      const discount = quantity > 50 ? 0.2 : 0.1;
      product.price = product.price * (1 - discount);
    }
    product.stock -= quantity;
    this.model.saveProduct(product);
    this.view.showConfirmation(`Purchased ${quantity} x ${product.name}`);
  }
}
```

What's wrong with this from an MVC perspective? How would you fix it?
