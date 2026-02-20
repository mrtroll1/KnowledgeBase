# Lesson 5: Objects & Data Structures — Quiz

## Q1

You're building a system that processes different payment methods (credit card, PayPal, bank transfer). You expect to add new payment methods frequently, but the operations on them (charge, refund, validate) are stable. Should you use a procedural or OOP approach? Why?

---

## Q2

What's wrong with this class's encapsulation? It has private fields and getters — isn't that enough?

```ts
class BankAccount {
  private balance: number;
  private transactions: Transaction[];

  getBalance(): number {
    return this.balance;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  setBalance(amount: number): void {
    this.balance = amount;
  }
}
```

---

## Q3

This class has low cohesion. Identify the separate responsibilities and show how you'd split it.

```ts
class Product {
  name: string;
  price: number;
  weight: number;
  description: string;
  imageUrl: string;

  calculateShipping(destination: Address): number {
    // Uses weight, destination
  }

  renderCard(): string {
    // Uses name, price, imageUrl
  }

  renderDetailPage(): string {
    // Uses name, price, description, imageUrl
  }

  applyDiscount(percentage: number): void {
    // Uses price
    this.price = this.price * (1 - percentage / 100);
  }

  generateSeoMetadata(): object {
    // Uses name, description
  }
}
```

---

## Q4

This code violates the Dependency Inversion Principle. Identify the problem and fix it.

```ts
class NotificationService {
  private slackClient = new SlackClient("https://hooks.slack.com/xxx");
  private twilioClient = new TwilioClient("account_sid", "auth_token");

  async notifyTeam(message: string): Promise<void> {
    await this.slackClient.postMessage("#alerts", message);
  }

  async notifyCustomer(phone: string, message: string): Promise<void> {
    await this.twilioClient.sendSms(phone, message);
  }
}
```

---

## Q5

Your colleague argues: "We should always use OOP because it's more flexible." Using the procedural vs OOP tradeoff, give a concrete example where a procedural approach is clearly better and explain why.
