# Lesson 2: Functions — Quiz

## Q1

This function works correctly. What clean code principles does it violate? How would you restructure it?

```ts
function handleRegistration(name: string, email: string, password: string, sendWelcome: boolean): boolean {
  if (!name || name.length < 2) return false;
  if (!email || !email.includes("@")) return false;
  if (!password || password.length < 8) return false;

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

  if (sendWelcome) {
    emailService.send(email, "Welcome!", `Hi ${name}, thanks for signing up.`);
  }

  logger.info(`New user registered: ${email}`);
  return true;
}
```

---

## Q2

What's wrong with this function's arguments? Rewrite the call site so it's self-documenting.

```ts
function schedule(task: string, delay: number, retries: number, verbose: boolean): void { ... }

// Call site:
schedule("sendReport", 3000, 5, true);
```

---

## Q3

Identify the side effect in this function. Why is it dangerous?

```ts
function isValidSession(token: string): boolean {
  const session = sessionStore.get(token);
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    sessionStore.delete(token);
    return false;
  }
  session.lastAccessedAt = Date.now();
  sessionStore.save(session);
  return true;
}
```

---

## Q4

This function mixes multiple levels of abstraction. Identify them and rewrite it using the stepdown rule.

```ts
function generateReport(userId: string): string {
  const user = db.query("SELECT * FROM users WHERE id = ?", [userId]);
  const orders = db.query("SELECT * FROM orders WHERE user_id = ?", [userId]);

  let totalSpent = 0;
  for (const order of orders) {
    totalSpent += order.amount;
  }
  const averageOrder = orders.length > 0 ? totalSpent / orders.length : 0;

  let csv = "Name,Email,Total Orders,Total Spent,Average Order\n";
  csv += `${user.name},${user.email},${orders.length},${totalSpent.toFixed(2)},${averageOrder.toFixed(2)}\n`;

  return csv;
}
```

---

## Q5

Does this function violate Command-Query Separation? Explain why or why not.

```ts
function withdrawFunds(account: Account, amount: number): number {
  if (account.balance < amount) {
    throw new Error("Insufficient funds");
  }
  account.balance -= amount;
  accountRepo.save(account);
  return account.balance;
}
```
