# Lesson 2: Design Principles — Answers

## Q1

**SRP (Single Responsibility Principle)** is violated. The `Report` class has four reasons to change:

1. Business logic changes (how totals are calculated)
2. HTML format changes
3. PDF format changes
4. Email delivery changes

Fix: split into focused classes:

```typescript
class SalesCalculator {
  calculate(data: SalesData[]): number {
    return data.reduce((sum, d) => sum + d.amount, 0);
  }
}

class HTMLReportFormatter {
  format(total: number): string {
    return `<h1>Sales Report</h1><p>Total: $${total}</p>`;
  }
}

class ReportMailer {
  send(to: string, content: string): void {
    mailer.send(to, "Sales Report", content);
  }
}
```

Each class now has exactly one reason to change.

## Q2

**YAGNI (You Aren't Gonna Need It).** Building a plugin system for hypothetical future notification channels is speculative engineering. The plugin architecture adds complexity (interfaces, registries, configuration) that provides zero value today.

Advice: just hardcode the email notification. When the second channel is actually needed, refactor to an abstraction then. You'll also have a real second use case to inform the design, rather than guessing what the plugin API should look like.

The nuance: if the product roadmap explicitly calls for Slack integration next sprint, then OCP makes sense. But "maybe someday" is not a reason to build abstractions.

## Q3

Define an abstraction that the high-level module (WeatherApp) depends on, and have the low-level module (OpenWeatherMapAPI) implement it:

```typescript
interface WeatherProvider {
  getTemperature(city: string): number;
}

class OpenWeatherMapProvider implements WeatherProvider {
  private api = new OpenWeatherMapAPI();

  getTemperature(city: string): number {
    const data = this.api.fetchWeather(city);
    return data.main.temp;
  }
}

class WeatherApp {
  constructor(private provider: WeatherProvider) {}

  getTemperature(city: string): number {
    return this.provider.getTemperature(city);
  }
}
```

Now `WeatherApp` depends on the `WeatherProvider` abstraction, not on `OpenWeatherMapAPI` directly. You can swap to a different weather API, or inject a mock for testing, without touching `WeatherApp`.

## Q4

**ISP (Interface Segregation Principle).** `SimplePrinter` is forced to implement `scan()`, `fax()`, and `staple()` that it doesn't support. Any code receiving a `Printer` might call these methods and get a runtime error.

Fix: split into focused interfaces:

```typescript
interface Printable {
  print(doc: Document): void;
}

interface Scannable {
  scan(doc: Document): void;
}

interface Faxable {
  fax(doc: Document): void;
}

class SimplePrinter implements Printable {
  print(doc: Document): void { /* works */ }
}

class MultiFunctionPrinter implements Printable, Scannable, Faxable {
  print(doc: Document): void { /* works */ }
  scan(doc: Document): void { /* works */ }
  fax(doc: Document): void { /* works */ }
}
```

Code that only needs printing asks for `Printable`. No throwing "not supported" errors.

## Q5

**No, this is not a DRY violation** — or at least, it's not one you should fix. The code looks similar, but `OrderValidator` and `RefundValidator` validate different domain concepts (`Order` vs `Refund`) that change for different reasons.

Today the rules look identical. Tomorrow, orders might require a minimum total of $10 while refunds need a reason string and manager approval. If you extract a shared `BaseValidator<T>`, you'd have to undo it when the rules diverge — and the shared abstraction would make that harder.

DRY is about duplicated **knowledge**, not duplicated **code**. These two validators encode different business rules that happen to look the same right now. Merging them would couple unrelated domain rules, violating SRP.

The rule of thumb: if two pieces of code look the same but change for different reasons, they're not truly duplicates.
