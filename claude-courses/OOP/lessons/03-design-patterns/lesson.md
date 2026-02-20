# Lesson 3: Design Patterns

## The Problem — Why Patterns?

Design patterns are not magic formulas. They're **named solutions to recurring problems** that experienced developers have encountered thousands of times. Knowing them means you don't have to reinvent the wheel — and when someone says "use a Factory here," everyone on the team immediately understands the approach.

The danger: over-applying patterns. Every pattern adds indirection. Use them when the problem they solve is real, not hypothetical.

---

## Pattern 1: Publisher-Subscriber (Pub/Sub)

### The problem

You're building an e-commerce system. When an order is placed, you need to:
- Send a confirmation email
- Update inventory
- Notify the shipping department
- Log the event for analytics

```typescript
// Without Pub/Sub — the OrderService knows about everything
class OrderService {
  constructor(
    private emailService: EmailService,
    private inventoryService: InventoryService,
    private shippingService: ShippingService,
    private analyticsService: AnalyticsService
  ) {}

  placeOrder(order: Order): void {
    this.saveOrder(order);
    this.emailService.sendConfirmation(order);       // Tightly coupled
    this.inventoryService.updateStock(order);         // Tightly coupled
    this.shippingService.notifyNewOrder(order);       // Tightly coupled
    this.analyticsService.logOrderPlaced(order);      // Tightly coupled
  }

  private saveOrder(order: Order): void { /* ... */ }
}
```

Every new side-effect means modifying `OrderService`. It knows about email, inventory, shipping, analytics — violating SRP and OCP.

### The solution — Pub/Sub

```typescript
type EventHandler<T> = (data: T) => void;

class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  subscribe<T>(event: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(event) ?? [];
    existing.push(handler);
    this.handlers.set(event, existing);
  }

  publish<T>(event: string, data: T): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.forEach(handler => handler(data));
  }
}

// OrderService only knows about the EventBus
class OrderService {
  constructor(private eventBus: EventBus) {}

  placeOrder(order: Order): void {
    this.saveOrder(order);
    this.eventBus.publish("order.placed", order);  // Fire and forget
  }

  private saveOrder(order: Order): void { /* ... */ }
}

// Each service subscribes independently
eventBus.subscribe("order.placed", (order: Order) => {
  emailService.sendConfirmation(order);
});

eventBus.subscribe("order.placed", (order: Order) => {
  inventoryService.updateStock(order);
});

// Adding a new subscriber = ZERO changes to OrderService
eventBus.subscribe("order.placed", (order: Order) => {
  loyaltyService.awardPoints(order);  // New feature, no existing code modified
});
```

**When to use:** When one action triggers multiple independent reactions and you don't want the trigger to know about all the reactors.

**Watch out for:** Debugging becomes harder — you can't see the full flow by reading one file. Use clear event names and document which events exist.

---

## Pattern 2: Singleton

### The problem

Some resources should only have one instance: a database connection pool, a configuration manager, a logger. What happens without control?

```typescript
// Without Singleton — accidental multiple instances
const config1 = new ConfigManager();  // Reads config.json
const config2 = new ConfigManager();  // Reads config.json AGAIN
config1.set("debug", true);
console.log(config2.get("debug"));    // undefined — different instance!
```

### The solution — Singleton

```typescript
class ConfigManager {
  private static instance: ConfigManager | null = null;
  private settings = new Map<string, any>();

  private constructor() {
    // Private constructor — nobody can call `new ConfigManager()`
    this.loadFromFile();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  get(key: string): any {
    return this.settings.get(key);
  }

  set(key: string, value: any): void {
    this.settings.set(key, value);
  }

  private loadFromFile(): void { /* ... */ }
}

// Usage
const config = ConfigManager.getInstance();  // Always the same instance
```

### Why Singleton is controversial

```
WITHOUT careful use                    WITH careful use
───────────────────                    ─────────────────
Global state — any code can           Limited to truly global resources
  mutate shared config                  (config, logging, connection pools)

Hidden dependencies —                 Can be replaced with DI for testability:
  ConfigManager.getInstance()           constructor(config: ConfigManager)
  appears deep in code, invisible
  from the outside

Untestable — can't substitute         Use getInstance() at the composition root,
  a mock without hacking               inject the instance everywhere else
```

**When to use:** Truly global resources where multiple instances would cause problems (connection pools, hardware access). Even then, consider dependency injection as an alternative.

**When to avoid:** When you're using it as a convenient way to avoid passing dependencies — that's a code smell, not a pattern.

---

## Pattern 3: Factory Method

### The problem

You're building a document editor that supports multiple file formats. The creation logic is different for each format, and you don't want the calling code to know about those details.

```typescript
// Without Factory — calling code must know about every format
function openDocument(path: string): Document {
  const ext = path.split(".").pop();
  if (ext === "pdf") {
    const parser = new PDFParser();
    const raw = parser.parse(path);
    return new PDFDocument(raw);         // Caller knows about PDF internals
  } else if (ext === "docx") {
    const unzipper = new DocxUnzipper();
    const xml = unzipper.extract(path);
    return new DocxDocument(xml);        // Caller knows about DOCX internals
  }
  throw new Error("Unsupported format");
}
```

Every new format means modifying this function. The caller is tangled in creation details.

### The solution — Factory Method

```typescript
// The product interface
interface Document {
  getContent(): string;
  save(path: string): void;
}

// The creator (abstract — defines the factory method)
abstract class DocumentFactory {
  // The factory method — subclasses decide what to create
  abstract createDocument(path: string): Document;

  // Shared logic that uses the factory method
  open(path: string): Document {
    const doc = this.createDocument(path);
    console.log(`Opened: ${path}`);
    return doc;
  }
}

// Concrete creators
class PDFDocumentFactory extends DocumentFactory {
  createDocument(path: string): Document {
    const parser = new PDFParser();
    const raw = parser.parse(path);
    return new PDFDocument(raw);
  }
}

class DocxDocumentFactory extends DocumentFactory {
  createDocument(path: string): Document {
    const unzipper = new DocxUnzipper();
    const xml = unzipper.extract(path);
    return new DocxDocument(xml);
  }
}

// Usage — caller doesn't know creation details
const factory: DocumentFactory = new PDFDocumentFactory();
const doc = factory.open("report.pdf");
```

**When to use:**
- Object creation involves complex setup that shouldn't burden the caller
- You want to defer the decision of which class to instantiate to subclasses
- You need to return different types based on configuration or context

---

## Pattern 4: Abstract Factory

### The problem

You're building a UI toolkit that needs to support multiple themes. Each theme has its own buttons, inputs, and modals — and they must be consistent (you can't mix a dark-theme button with a light-theme modal).

```typescript
// Without Abstract Factory — manual consistency enforcement
function createUI(theme: "dark" | "light") {
  const button = theme === "dark" ? new DarkButton() : new LightButton();
  const input = theme === "dark" ? new DarkInput() : new LightInput();
  const modal = theme === "dark" ? new DarkModal() : new LightModal();
  // Easy to accidentally mix: new DarkButton() with new LightModal()
}
```

### The solution — Abstract Factory

```typescript
// Abstract products
interface Button {
  render(): string;
}

interface Input {
  render(): string;
}

interface Modal {
  render(): string;
}

// Abstract factory — creates a FAMILY of related objects
interface UIFactory {
  createButton(): Button;
  createInput(): Input;
  createModal(): Modal;
}

// Concrete factory — Dark theme
class DarkThemeFactory implements UIFactory {
  createButton(): Button { return new DarkButton(); }
  createInput(): Input { return new DarkInput(); }
  createModal(): Modal { return new DarkModal(); }
}

// Concrete factory — Light theme
class LightThemeFactory implements UIFactory {
  createButton(): Button { return new LightButton(); }
  createInput(): Input { return new LightInput(); }
  createModal(): Modal { return new LightModal(); }
}

// Client code — works with ANY theme, guaranteed consistency
class LoginForm {
  constructor(private factory: UIFactory) {}

  render(): string {
    const button = this.factory.createButton();
    const input = this.factory.createInput();
    return `${input.render()} ${button.render()}`;
  }
}

// Usage
const form = new LoginForm(new DarkThemeFactory());
// Impossible to accidentally mix dark and light components
```

**Factory Method vs Abstract Factory:**
- **Factory Method** = one product, one factory method per creator subclass
- **Abstract Factory** = family of related products, consistency guaranteed

**When to use:** When you have families of objects that must be used together and you want to ensure they're never mixed.

---

## Pattern 5: Template Method

### The problem

You're building data importers for CSV, JSON, and XML files. They all follow the same high-level algorithm: open file, parse data, validate, save to database. But the parsing step is different for each format.

```typescript
// Without Template Method — duplicated algorithm structure
class CSVImporter {
  import(path: string): void {
    const raw = this.readFile(path);            // Same
    const data = this.parseCSV(raw);            // Different
    const valid = this.validate(data);          // Same
    this.saveToDB(valid);                       // Same
    this.logCompletion(path);                   // Same
  }
  // ...
}

class JSONImporter {
  import(path: string): void {
    const raw = this.readFile(path);            // Same (duplicated)
    const data = JSON.parse(raw);               // Different
    const valid = this.validate(data);          // Same (duplicated)
    this.saveToDB(valid);                       // Same (duplicated)
    this.logCompletion(path);                   // Same (duplicated)
  }
  // ...
}
```

The algorithm skeleton is identical — only the parsing step varies. But the whole flow is duplicated in every importer.

### The solution — Template Method

```typescript
abstract class DataImporter {
  // The template method — defines the algorithm skeleton
  // Subclasses can't change the order of steps
  import(path: string): void {
    const raw = this.readFile(path);
    const data = this.parse(raw);       // Abstract — subclass fills this in
    const valid = this.validate(data);
    this.saveToDB(valid);
    this.logCompletion(path);
  }

  private readFile(path: string): string {
    return fs.readFileSync(path, "utf-8");
  }

  // The "hook" — subclasses MUST implement this
  protected abstract parse(raw: string): Record<string, any>[];

  private validate(data: Record<string, any>[]): Record<string, any>[] {
    return data.filter(row => row.id != null);
  }

  private saveToDB(data: Record<string, any>[]): void {
    db.bulkInsert(data);
  }

  private logCompletion(path: string): void {
    console.log(`Imported ${path} successfully`);
  }
}

class CSVImporter extends DataImporter {
  protected parse(raw: string): Record<string, any>[] {
    return raw.split("\n").map(line => {
      const [id, name, value] = line.split(",");
      return { id, name, value };
    });
  }
}

class JSONImporter extends DataImporter {
  protected parse(raw: string): Record<string, any>[] {
    return JSON.parse(raw);
  }
}
```

**When to use:**
- Multiple classes share the same algorithm but differ in specific steps
- You want to prevent subclasses from changing the overall algorithm structure
- The variant steps are clearly identifiable

**Template Method vs Strategy:** Template Method uses inheritance (abstract class with a hook). Strategy uses composition (pass a parsing function/object). If you only have one step that varies, Strategy might be simpler.

---

## Pattern 6: MVC (Model-View-Controller)

### The problem

You're building a todo app. Without any architectural pattern, everything ends up tangled:

```typescript
// The "big ball of mud" — everything in one place
class TodoApp {
  private todos: string[] = [];

  handleAddClick(): void {
    const input = document.getElementById("todo-input") as HTMLInputElement;
    const text = input.value.trim();
    if (text === "") return;
    if (this.todos.includes(text)) {
      alert("Duplicate!");
      return;
    }
    this.todos.push(text);                              // Data manipulation
    const li = document.createElement("li");            // DOM manipulation
    li.textContent = text;                              // DOM manipulation
    document.getElementById("list")!.appendChild(li);   // DOM manipulation
    input.value = "";                                   // DOM manipulation
    localStorage.setItem("todos", JSON.stringify(this.todos));  // Persistence
  }
}
```

Business logic (duplicate check), DOM manipulation, and persistence are all mixed. Testing the duplicate check requires a browser DOM. Changing from `localStorage` to an API means editing the same method that handles UI.

### The solution — MVC

```
┌──────────────┐     User action      ┌────────────────┐
│              │ ──────────────────►   │                │
│    VIEW      │                      │   CONTROLLER   │
│  (dumb UI)   │  ◄──────────────────  │ (thin router)  │
│              │     Update display    │                │
└──────────────┘                      └───────┬────────┘
                                              │
                                              │ Calls methods
                                              ▼
                                      ┌────────────────┐
                                      │                │
                                      │     MODEL      │
                                      │  (fat — all    │
                                      │   business     │
                                      │   logic here)  │
                                      └────────────────┘
```

**Fat Model, Thin Controller, Dumb View:**

```typescript
// MODEL — all business logic and data
class TodoModel {
  private todos: string[] = [];

  add(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed === "" || this.todos.includes(trimmed)) {
      return false;  // Business rule: no empty or duplicate todos
    }
    this.todos.push(trimmed);
    return true;
  }

  remove(index: number): void {
    this.todos.splice(index, 1);
  }

  getAll(): readonly string[] {
    return [...this.todos];  // Return a copy — protect internal state
  }
}

// VIEW — only knows how to render, nothing about business logic
class TodoView {
  renderList(todos: readonly string[]): void {
    const list = document.getElementById("list")!;
    list.innerHTML = "";
    todos.forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
  }

  getInputValue(): string {
    return (document.getElementById("todo-input") as HTMLInputElement).value;
  }

  clearInput(): void {
    (document.getElementById("todo-input") as HTMLInputElement).value = "";
  }

  showError(message: string): void {
    alert(message);
  }
}

// CONTROLLER — thin glue between View and Model
class TodoController {
  constructor(
    private model: TodoModel,
    private view: TodoView
  ) {}

  handleAdd(): void {
    const text = this.view.getInputValue();
    const success = this.model.add(text);
    if (success) {
      this.view.clearInput();
      this.view.renderList(this.model.getAll());
    } else {
      this.view.showError("Invalid or duplicate todo");
    }
  }
}
```

**Why "fat model"?** The model contains all business rules (validation, deduplication, data transformations). If you need to test the duplicate check, you test `TodoModel` — no DOM needed.

**Why "thin controller"?** The controller should just translate user actions into model calls and update the view. If your controller has `if` statements about business logic, move that logic into the model.

**Why "dumb view"?** The view should only know how to display data, not what data means. It gets told "render this list" and renders it. No decisions.

**When to use:** Any application with a user interface where you want business logic to be testable independently of the UI.

---

## Quick Reference — Pattern Selection

| Problem | Pattern |
|---------|---------|
| One action triggers many independent reactions | **Pub/Sub** |
| Need exactly one instance of a resource | **Singleton** (with caution) |
| Complex object creation that varies by type | **Factory Method** |
| Families of related objects that must be consistent | **Abstract Factory** |
| Same algorithm, different specific steps | **Template Method** |
| Separating UI from business logic | **MVC** |

---

## Key Takeaways

1. **Patterns are solutions to problems** — identify the problem first, then reach for the pattern
2. **Pub/Sub decouples** the trigger from the reactions — great for extensibility, harder to debug
3. **Singleton ensures one instance** but introduces global state — prefer DI when possible
4. **Factory Method delegates creation** to subclasses — use when "what to create" varies
5. **Abstract Factory creates families** — use when consistency across related objects matters
6. **Template Method locks the algorithm** — vary the steps, not the structure
7. **MVC separates concerns** — fat model (logic), thin controller (routing), dumb view (display)
8. **Don't pattern-match everything** — if the code is simple and clear without a pattern, leave it alone
