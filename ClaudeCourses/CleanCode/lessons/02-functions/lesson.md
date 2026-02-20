# Lesson 2: Functions

## The Problem — Why Do Functions Get Out of Control?

Functions grow organically. You add one `if` branch, then another, then a loop, then error handling, and suddenly you have a 200-line method that does six things. Nobody can hold it in their head. Nobody wants to touch it. Bugs hide in the crevices.

```
  A 200-line function
  ┌──────────────────┐
  │ validate input   │
  │ query database   │
  │ transform data   │  ← You need to change the email logic.
  │ send email       │     Where does it start? Where does it end?
  │ update cache     │     What else will break if you touch it?
  │ log results      │
  └──────────────────┘

  Six small functions
  ┌──────────────┐
  │ validate     │──▶ clear boundary
  ├──────────────┤
  │ queryDB      │──▶ clear boundary
  ├──────────────┤
  │ transform    │──▶ clear boundary
  ├──────────────┤
  │ sendEmail    │──▶ change THIS one, nothing else affected
  ├──────────────┤
  │ updateCache  │──▶ clear boundary
  ├──────────────┤
  │ logResults   │──▶ clear boundary
  └──────────────┘
```

**Without small functions**, you get monoliths you're afraid to change. **With small functions**, each piece is understandable, testable, and replaceable.

---

## Functions Should Be Small

Robert Martin's rule: functions should be **small**. Then they should be **smaller than that**. Aim for roughly 5-10 lines. A function that fits on your screen without scrolling is a function you can reason about.

### A: Bad — doing too much

```ts
function processOrder(order: Order): Receipt {
  // Validate
  if (!order.items || order.items.length === 0) {
    throw new Error("Order must have items");
  }
  if (!order.customer) {
    throw new Error("Order must have a customer");
  }
  if (order.customer.isBanned) {
    throw new Error("Customer is banned");
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
  }
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Charge payment
  const paymentResult = paymentGateway.charge(order.customer.paymentMethod, total);
  if (!paymentResult.success) {
    throw new Error(`Payment failed: ${paymentResult.error}`);
  }

  // Update inventory
  for (const item of order.items) {
    const product = inventory.find(item.productId);
    product.quantity -= item.quantity;
    inventory.save(product);
  }

  // Send confirmation
  emailService.send(order.customer.email, "Order confirmed", `Total: $${total}`);

  return new Receipt(order, total, paymentResult.transactionId);
}
```

### B: Clean — each step is its own function

```ts
function processOrder(order: Order): Receipt {
  validateOrder(order);
  const total = calculateTotal(order);
  const transaction = chargePayment(order.customer, total);
  updateInventory(order.items);
  sendConfirmation(order.customer, total);
  return new Receipt(order, total, transaction.id);
}
```

The top-level function reads like a **table of contents**. Each step is a function you can read, test, and modify independently. If the payment logic needs to change, you go to `chargePayment` — you don't hunt through 50 lines of mixed concerns.

---

## Do One Thing

> A function should do one thing. It should do it well. It should do it only.

How do you know if a function does "one thing"? Try to extract another meaningful function from it. If you can, the original was doing more than one thing.

### A: Bad — doing two things disguised as one

```ts
function validateAndSaveUser(user: User): void {
  if (!user.email || !user.email.includes("@")) {
    throw new Error("Invalid email");
  }
  if (!user.name || user.name.length < 2) {
    throw new Error("Name too short");
  }

  user.createdAt = new Date();
  user.status = "active";
  database.save(user);
}
```

The function name has "and" in it — that's a code smell. Validation and persistence are different responsibilities.

### B: Clean — separated

```ts
function validateUser(user: User): void {
  if (!user.email || !user.email.includes("@")) {
    throw new Error("Invalid email");
  }
  if (!user.name || user.name.length < 2) {
    throw new Error("Name too short");
  }
}

function saveUser(user: User): void {
  user.createdAt = new Date();
  user.status = "active";
  database.save(user);
}
```

Now you can validate without saving (useful in previews), save without re-validating (useful in migrations), and test each independently.

---

## One Level of Abstraction — The Stepdown Rule

Functions should read like a newspaper: high-level summary at the top, details further down. Each function should call functions at **one level below** its own abstraction.

### A: Bad — mixed abstraction levels

```ts
function renderDashboard(user: User): string {
  // High-level
  const stats = getUserStats(user);

  // Suddenly low-level HTML string concatenation
  let html = "<div class='dashboard'>";
  html += `<h1>Welcome, ${user.name}</h1>`;
  html += `<p>Posts: ${stats.postCount}</p>`;

  // Back to high-level
  const notifications = getNotifications(user);

  // Low-level again
  for (const n of notifications) {
    html += `<div class='notification ${n.read ? "" : "unread"}'>${n.message}</div>`;
  }
  html += "</div>";
  return html;
}
```

### B: Clean — consistent abstraction, reads top to bottom

```ts
function renderDashboard(user: User): string {
  const stats = getUserStats(user);
  const notifications = getNotifications(user);

  return buildDashboardHtml(user, stats, notifications);
}

function buildDashboardHtml(user: User, stats: Stats, notifications: Notification[]): string {
  return `
    <div class="dashboard">
      ${renderWelcomeHeader(user)}
      ${renderStatsSection(stats)}
      ${renderNotificationList(notifications)}
    </div>
  `;
}

function renderNotificationList(notifications: Notification[]): string {
  return notifications.map(renderNotification).join("");
}

function renderNotification(notification: Notification): string {
  const cssClass = notification.read ? "" : "unread";
  return `<div class="notification ${cssClass}">${notification.message}</div>`;
}
```

Reading top-down: dashboard renders user stats and notifications. How? By building HTML from sections. How is the notification list rendered? By mapping each notification. Each level answers the next question.

---

## Function Arguments — Fewer Is Better

The ideal number of arguments is **zero** (niladic). Then **one** (monadic). Then **two** (dyadic). **Three** (triadic) should be avoided. More than three requires very special justification.

Why? More arguments = harder to understand, harder to test, harder to remember the order.

### A: Bad — too many arguments

```ts
function createUser(
  firstName: string,
  lastName: string,
  email: string,
  age: number,
  role: string,
  department: string
): User {
  // ...
}

// Caller — what's the 4th argument again?
createUser("Alice", "Smith", "alice@co.com", 30, "admin", "engineering");
```

### B: Clean — use an object

```ts
interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  role: string;
  department: string;
}

function createUser(request: CreateUserRequest): User {
  // ...
}

// Caller — self-documenting
createUser({
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@co.com",
  age: 30,
  role: "admin",
  department: "engineering",
});
```

### Flag Arguments Are Bad

A boolean argument is a loud declaration that the function does two things.

```ts
// BAD — what does `true` mean here?
renderPage(page, true);

// What's actually happening inside:
function renderPage(page: Page, forPrint: boolean): string {
  if (forPrint) {
    // ... completely different rendering logic
  } else {
    // ... screen rendering logic
  }
}

// GOOD — two functions, each does one thing
renderPageForScreen(page);
renderPageForPrint(page);
```

---

## No Side Effects

A side effect is when a function does something **hidden** beyond what its name promises. Side effects are lies — they make your function do more than "one thing" in secret.

### A: Bad — hidden side effect

```ts
function checkPassword(username: string, password: string): boolean {
  const user = UserGateway.findByName(username);
  if (user) {
    const hashedPassword = hash(password);
    if (hashedPassword === user.passwordHash) {
      Session.initialize();  // ← SIDE EFFECT! Who expects this here?
      return true;
    }
  }
  return false;
}
```

The function is called `checkPassword`, but it secretly initializes a session. A caller who just wants to verify a password will unknowingly reset the session for the existing user.

### B: Clean — do what the name says, nothing more

```ts
function checkPassword(username: string, password: string): boolean {
  const user = UserGateway.findByName(username);
  if (!user) return false;
  return hash(password) === user.passwordHash;
}

function loginUser(username: string, password: string): boolean {
  if (checkPassword(username, password)) {
    Session.initialize();
    return true;
  }
  return false;
}
```

Now `checkPassword` only checks the password. Session initialization is in `loginUser`, where you'd expect it.

---

## Command-Query Separation

A function should either **do something** (command) or **answer something** (query) — not both.

```ts
// BAD — does it set the attribute, or check if it exists?
// Hard to tell from the call site
if (set("username", "alice")) { ... }

// Under the hood:
function set(attribute: string, value: string): boolean {
  // Sets the attribute and returns true if it existed before
  // WHAT?
}

// GOOD — separate the command and the query
if (attributeExists("username")) {
  setAttribute("username", "alice");
}
```

When a function both changes state AND returns a value, readers can't tell at the call site whether they're asking a question or giving an order.

---

## DRY — Don't Repeat Yourself

Duplication is the root of all evil in software. Every piece of knowledge should have a single, unambiguous representation.

### A: Bad — same validation logic in three places

```ts
function createUser(email: string) {
  if (!email || !email.includes("@") || email.length > 255) {
    throw new Error("Invalid email");
  }
  // ...
}

function updateEmail(userId: string, email: string) {
  if (!email || !email.includes("@") || email.length > 255) {
    throw new Error("Invalid email");
  }
  // ...
}

function sendInvite(email: string) {
  if (!email || !email.includes("@") || email.length > 255) {
    throw new Error("Invalid email");
  }
  // ...
}
```

When email validation rules change (and they will), you need to find and update three places — and you'll forget one.

### B: Clean — single source of truth

```ts
function validateEmail(email: string): void {
  if (!email || !email.includes("@") || email.length > 255) {
    throw new Error("Invalid email");
  }
}

function createUser(email: string) {
  validateEmail(email);
  // ...
}

function updateEmail(userId: string, email: string) {
  validateEmail(email);
  // ...
}

function sendInvite(email: string) {
  validateEmail(email);
  // ...
}
```

One function, one place to update, zero risk of inconsistency.

---

## Key Takeaways

1. **Small functions** — 5-10 lines. If you're scrolling, it's too long.
2. **Do one thing** — if the name has "and" in it, split it.
3. **One level of abstraction** — don't mix high-level orchestration with low-level details.
4. **The stepdown rule** — code reads top to bottom, each function calls functions one level down.
5. **Fewer arguments** — 0 is best, use objects for 3+, never use flag booleans.
6. **No side effects** — a function should do what its name says and nothing more.
7. **Command-Query Separation** — either change state or return information, not both.
8. **DRY** — extract duplicated logic into a single function.
