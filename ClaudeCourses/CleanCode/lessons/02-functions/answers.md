# Lesson 2: Functions — Answers

## Q1

Multiple violations:

1. **Does more than one thing**: validates, hashes, persists to DB, sends email, logs — five responsibilities in one function.
2. **Flag argument** (`sendWelcome: boolean`): a boolean parameter means the function has two behaviors — split it.
3. **Too many arguments**: 4 arguments when an object would be clearer.
4. **Mixed abstraction levels**: raw SQL next to high-level service calls.

Restructured:

```ts
interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
}

function registerUser(request: RegistrationRequest): User {
  validateRegistration(request);
  const user = createUser(request);
  logger.info(`New user registered: ${request.email}`);
  return user;
}

function registerAndWelcomeUser(request: RegistrationRequest): User {
  const user = registerUser(request);
  sendWelcomeEmail(user);
  return user;
}
```

Each function does one thing. No flag argument — two separate functions instead. Object argument is self-documenting.

## Q2

Four positional arguments — the caller has to remember the order, and `3000, 5, true` is meaningless without reading the function signature.

```ts
interface ScheduleOptions {
  task: string;
  delayMs: number;
  maxRetries: number;
  verbose: boolean;
}

schedule({
  task: "sendReport",
  delayMs: 3000,
  maxRetries: 5,
  verbose: true,
});
```

Now the call site documents itself. You also get the bonus of the property name `delayMs` clarifying the unit (milliseconds vs seconds was ambiguous before).

## Q3

The function is called `isValidSession` — a question (query). But it has two hidden side effects:

1. **Deletes expired sessions** (`sessionStore.delete(token)`) — a command hiding inside a query.
2. **Updates the last-accessed timestamp** (`session.lastAccessedAt = Date.now()` + `save`) — another command.

This is dangerous because a caller who just wants to check "is this session valid?" will unknowingly modify state. For example, a monitoring system checking session validity would silently extend sessions by updating `lastAccessedAt`.

Fix: `isValidSession` should only answer the question. Deletion and timestamp updates belong in separate functions like `refreshSession` and `cleanExpiredSessions`.

## Q4

Three levels mixed together: data access (SQL), business logic (calculations), and presentation (CSV formatting).

```ts
function generateReport(userId: string): string {
  const user = getUser(userId);
  const orders = getUserOrders(userId);
  const stats = calculateOrderStats(orders);
  return formatReportAsCsv(user, stats);
}

function calculateOrderStats(orders: Order[]): OrderStats {
  const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
  const averageOrder = orders.length > 0 ? totalSpent / orders.length : 0;
  return { totalOrders: orders.length, totalSpent, averageOrder };
}

function formatReportAsCsv(user: User, stats: OrderStats): string {
  const header = "Name,Email,Total Orders,Total Spent,Average Order";
  const row = `${user.name},${user.email},${stats.totalOrders},${stats.totalSpent.toFixed(2)},${stats.averageOrder.toFixed(2)}`;
  return `${header}\n${row}\n`;
}
```

Now `generateReport` reads like a table of contents. Each function operates at one abstraction level. You can change the CSV format without touching the calculation, or swap the data source without touching the presentation.

## Q5

Yes, it violates CQS. It's a **command** (it modifies state by deducting money and saving) that also acts as a **query** (it returns the new balance).

This makes the call site ambiguous: is the caller withdrawing funds, or checking the balance? Both.

Strictly applying CQS:

```ts
function withdrawFunds(account: Account, amount: number): void {
  if (account.balance < amount) throw new Error("Insufficient funds");
  account.balance -= amount;
  accountRepo.save(account);
}

function getBalance(account: Account): number {
  return account.balance;
}
```

That said, this is one of the cases where pragmatism can win. Returning the new balance after a withdrawal is a common and convenient pattern, especially when you want to avoid a second database call. The key is being aware of the tradeoff — you're sacrificing clarity for convenience.
