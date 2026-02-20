# Lesson 4: Formatting

## The Problem — Why Does Formatting Matter?

Formatting isn't about aesthetics — it's about **communication**. Code formatting is a developer's first impression. Before reading a single variable name, your eyes scan the shape of the code: the indentation, the spacing, the grouping. Messy formatting signals messy thinking. Clean formatting lets you absorb structure at a glance.

```
  Badly formatted code                    Well formatted code
  ┌────────────────────────┐              ┌────────────────────────┐
  │ ██████████████████     │              │ ██████                 │
  │ ████████████████████   │              │                        │
  │ ██████████████████████ │              │ ████████               │
  │ ██████████████████     │              │ ██████████             │
  │ ████████████████████   │              │                        │
  │ ████████████████████   │              │ ████                   │
  │ ██████████████████████ │              │ ██████████████         │
  │ ████████████████████   │              │                        │
  │ ██████████████████     │              │ ██████                 │
  │ ██████████████████████ │              │ ████████████           │
  └────────────────────────┘              └────────────────────────┘
       A wall of text                      Visual structure you
       — where does one                    can scan before reading
       concept end?                        a single word
```

**Without intentional formatting**, reading code is like reading a book with no paragraphs. **With good formatting**, the visual structure mirrors the logical structure.

---

## The Newspaper Metaphor

Think of a well-written newspaper article:

1. **The headline** tells you what it's about (the file/class name)
2. **The first paragraph** gives you the high-level summary (public API, top-level functions)
3. **The body** fills in the details as you read down (private helpers, low-level implementation)

You should be able to read a source file **top to bottom** and get the gist from the first few lines, then progressively more detail as you scroll.

### A: Bad — details first, summary buried

```ts
// Helper buried at the top
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function calculateTax(subtotal: number, rate: number): number {
  return Math.round(subtotal * rate);
}

function getShippingCost(weight: number): number {
  if (weight < 5) return 599;
  if (weight < 20) return 1299;
  return 2499;
}

// The main function you actually care about — buried at the bottom
function generateInvoice(order: Order): Invoice {
  const subtotal = calculateSubtotal(order.items);
  const tax = calculateTax(subtotal, order.taxRate);
  const shipping = getShippingCost(order.totalWeight);
  const total = subtotal + tax + shipping;

  return {
    items: order.items,
    subtotal: formatCurrency(subtotal),
    tax: formatCurrency(tax),
    shipping: formatCurrency(shipping),
    total: formatCurrency(total),
  };
}
```

### B: Clean — newspaper order, high-level first

```ts
// The "headline" — what this module is about
function generateInvoice(order: Order): Invoice {
  const subtotal = calculateSubtotal(order.items);
  const tax = calculateTax(subtotal, order.taxRate);
  const shipping = getShippingCost(order.totalWeight);
  const total = subtotal + tax + shipping;

  return {
    items: order.items,
    subtotal: formatCurrency(subtotal),
    tax: formatCurrency(tax),
    shipping: formatCurrency(shipping),
    total: formatCurrency(total),
  };
}

// Details — read these when you need to
function calculateTax(subtotal: number, rate: number): number {
  return Math.round(subtotal * rate);
}

function getShippingCost(weight: number): number {
  if (weight < 5) return 599;
  if (weight < 20) return 1299;
  return 2499;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
```

A reader opening this file immediately sees `generateInvoice` and understands the module's purpose. Details are below, available when needed.

---

## Vertical Openness Between Concepts

Blank lines separate **different thoughts**. Each group of lines represents a complete thought, and blank lines signal: "the next thing is a different idea."

### A: Bad — everything crammed together

```ts
import { UserRepository } from "./repositories";
import { EmailService } from "./services";
import { validateEmail } from "./validators";
interface CreateUserRequest {
  name: string;
  email: string;
}
class UserController {
  private repo: UserRepository;
  private emailService: EmailService;
  constructor(repo: UserRepository, emailService: EmailService) {
    this.repo = repo;
    this.emailService = emailService;
  }
  async createUser(request: CreateUserRequest): Promise<User> {
    validateEmail(request.email);
    const user = await this.repo.create(request);
    await this.emailService.sendWelcome(user);
    return user;
  }
  async getUser(id: string): Promise<User> {
    return this.repo.findById(id);
  }
}
```

### B: Clean — blank lines separate concepts

```ts
import { UserRepository } from "./repositories";
import { EmailService } from "./services";
import { validateEmail } from "./validators";

interface CreateUserRequest {
  name: string;
  email: string;
}

class UserController {
  private repo: UserRepository;
  private emailService: EmailService;

  constructor(repo: UserRepository, emailService: EmailService) {
    this.repo = repo;
    this.emailService = emailService;
  }

  async createUser(request: CreateUserRequest): Promise<User> {
    validateEmail(request.email);
    const user = await this.repo.create(request);
    await this.emailService.sendWelcome(user);
    return user;
  }

  async getUser(id: string): Promise<User> {
    return this.repo.findById(id);
  }
}
```

Same code, dramatically easier to scan. Your eyes can quickly identify: imports, interface, class fields, constructor, methods — each separated by a visual break.

---

## Vertical Density — Related Code Should Be Close

The flip side of openness: lines that are tightly related should be **close together**. Don't insert blank lines between things that belong to the same thought.

### A: Bad — blank lines break up a cohesive thought

```ts
class ReportGenerator {

  private formatter: Formatter;

  private dataSource: DataSource;

  constructor(formatter: Formatter, dataSource: DataSource) {

    this.formatter = formatter;

    this.dataSource = dataSource;

  }

}
```

### B: Clean — related lines are grouped

```ts
class ReportGenerator {
  private formatter: Formatter;
  private dataSource: DataSource;

  constructor(formatter: Formatter, dataSource: DataSource) {
    this.formatter = formatter;
    this.dataSource = dataSource;
  }
}
```

The two fields are one thought: "this class's dependencies." The constructor is another thought: "how they're initialized." Blank lines separate **between** these thoughts, not within them.

---

## Vertical Distance

Related concepts should be **vertically close** to each other. If you're reading function A and it calls function B, you shouldn't have to scroll 500 lines to find B.

### Variable Declarations — Close to Their Usage

```ts
// BAD — variable declared far from where it's used
function processOrders(orders: Order[]): Summary {
  let totalRevenue = 0;     // ← declared here
  let orderCount = 0;        // ← declared here

  // ... 30 lines of validation and filtering ...

  for (const order of validOrders) {
    totalRevenue += order.amount;    // ← used 30 lines later
    orderCount++;                     // ← used 30 lines later
  }
  return { totalRevenue, orderCount };
}

// GOOD — declare close to first use
function processOrders(orders: Order[]): Summary {
  // ... validation and filtering ...

  let totalRevenue = 0;     // ← declared right before use
  let orderCount = 0;
  for (const order of validOrders) {
    totalRevenue += order.amount;
    orderCount++;
  }
  return { totalRevenue, orderCount };
}
```

### Dependent Functions — Caller Above Callee

If function A calls function B, place A **above** B. The reader encounters the call before the definition, which matches how we read: top-down, question then answer.

```ts
// GOOD — caller above callee (newspaper order)
function buildReport(data: SalesData): Report {
  const summary = summarizeSales(data);       // ← I see this call
  const chart = generateChart(summary);        // ← then this call
  return { summary, chart };
}

function summarizeSales(data: SalesData): Summary {   // ← definition follows
  // ...
}

function generateChart(summary: Summary): Chart {      // ← definition follows
  // ...
}
```

```ts
// BAD — callee above caller (reader sees definitions before knowing they matter)
function summarizeSales(data: SalesData): Summary {
  // ...
}

function generateChart(summary: Summary): Chart {
  // ...
}

function buildReport(data: SalesData): Report {     // ← buried at the bottom
  const summary = summarizeSales(data);
  const chart = generateChart(summary);
  return { summary, chart };
}
```

### Conceptual Affinity — Related Functions Grouped Together

Functions that share a concept belong near each other, even if one doesn't directly call the other.

```ts
// GOOD — all validation functions grouped together
function validateEmail(email: string): boolean { ... }
function validatePassword(password: string): boolean { ... }
function validateUsername(username: string): boolean { ... }

// GOOD — all formatting functions grouped together
function formatCurrency(amount: number): string { ... }
function formatDate(date: Date): string { ... }
function formatPercentage(value: number): string { ... }
```

Don't scatter `validateEmail` in one corner of the file and `validatePassword` 200 lines away next to an unrelated database function.

---

## Vertical Ordering

Putting it all together, a well-ordered file flows like this:

```
  ┌───────────────────────────────┐
  │  Imports                      │   ← Dependencies
  ├───────────────────────────────┤
  │  Constants / Config           │   ← Module-level settings
  ├───────────────────────────────┤
  │  Types / Interfaces           │   ← Shape of data
  ├───────────────────────────────┤
  │  Main / Public functions      │   ← The "headline" — what this module does
  ├───────────────────────────────┤
  │  Supporting functions         │   ← Called by the public functions
  ├───────────────────────────────┤
  │  Low-level helpers            │   ← Small utilities
  └───────────────────────────────┘
       High-level → Low-level
       (top)          (bottom)
```

### Full Example

```ts
import { db } from "./database";
import { sendEmail } from "./email";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

interface LoginResult {
  success: boolean;
  token?: string;
  error?: string;
}

// === Public API ===

function login(email: string, password: string): LoginResult {
  const user = findUserByEmail(email);
  if (!user) return { success: false, error: "User not found" };

  if (isLockedOut(user)) return { success: false, error: "Account locked" };

  if (!isPasswordValid(user, password)) {
    recordFailedAttempt(user);
    return { success: false, error: "Invalid password" };
  }

  resetFailedAttempts(user);
  const token = generateToken(user);
  return { success: true, token };
}

// === Supporting Functions ===

function findUserByEmail(email: string): User | null {
  return db.users.findOne({ email });
}

function isLockedOut(user: User): boolean {
  if (user.failedAttempts < MAX_LOGIN_ATTEMPTS) return false;
  const elapsed = Date.now() - user.lastFailedAt.getTime();
  return elapsed < LOCKOUT_DURATION_MS;
}

function isPasswordValid(user: User, password: string): boolean {
  return bcrypt.compareSync(password, user.passwordHash);
}

// === Low-level Helpers ===

function recordFailedAttempt(user: User): void {
  user.failedAttempts++;
  user.lastFailedAt = new Date();
  db.users.save(user);
}

function resetFailedAttempts(user: User): void {
  user.failedAttempts = 0;
  db.users.save(user);
}

function generateToken(user: User): string {
  return jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
}
```

Reading top to bottom: you first see what the module does (`login`), then how each step works, then the low-level details. Every function is near the functions that call it.

---

## Key Takeaways

1. **The newspaper metaphor** — high-level summary at the top, details below. A reader should grasp the module's purpose from the first few lines.
2. **Vertical openness** — blank lines between different concepts (imports, classes, methods).
3. **Vertical density** — no blank lines within a single cohesive thought (related fields, related statements).
4. **Vertical distance** — declare variables close to use, put callers above callees, group related functions.
5. **Vertical ordering** — public API first, supporting functions next, helpers last. High-level flows down to low-level.
