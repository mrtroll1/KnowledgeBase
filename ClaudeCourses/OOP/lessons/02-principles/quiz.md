# Lesson 2: Design Principles — Quiz

## Q1

Which SOLID principle is violated here? What would you change?

```typescript
class Report {
  constructor(private data: SalesData[]) {}

  calculate(): number {
    return this.data.reduce((sum, d) => sum + d.amount, 0);
  }

  formatAsHTML(): string {
    return `<h1>Sales Report</h1><p>Total: $${this.calculate()}</p>`;
  }

  formatAsPDF(): Buffer {
    // PDF generation logic
    return pdfLib.create(`Sales Report\nTotal: $${this.calculate()}`);
  }

  sendByEmail(to: string): void {
    mailer.send(to, "Sales Report", this.formatAsHTML());
  }
}
```

---

## Q2

A colleague says: "I'm following OCP — I built a plugin system for our notification service so we can add Slack, Teams, Discord, and carrier pigeon in the future." The app currently only sends emails and there are no plans for other channels.

Which principle is your colleague violating by being too strict about OCP? What would you advise?

---

## Q3

Refactor this code to follow the Dependency Inversion Principle:

```typescript
class WeatherApp {
  private api = new OpenWeatherMapAPI();

  getTemperature(city: string): number {
    const data = this.api.fetchWeather(city);
    return data.main.temp;
  }
}
```

---

## Q4

Which SOLID principle does this violate? How would you fix it?

```typescript
interface Printer {
  print(doc: Document): void;
  scan(doc: Document): void;
  fax(doc: Document): void;
  staple(doc: Document): void;
}

class SimplePrinter implements Printer {
  print(doc: Document): void { /* works */ }
  scan(doc: Document): void { throw new Error("Not supported"); }
  fax(doc: Document): void { throw new Error("Not supported"); }
  staple(doc: Document): void { throw new Error("Not supported"); }
}
```

---

## Q5

Consider this code. Is it a DRY violation? Explain your reasoning.

```typescript
class OrderValidator {
  validate(order: Order): boolean {
    return order.items.length > 0
      && order.items.every(i => i.price > 0)
      && order.total > 0;
  }
}

class RefundValidator {
  validate(refund: Refund): boolean {
    return refund.items.length > 0
      && refund.items.every(i => i.price > 0)
      && refund.total > 0;
  }
}
```
