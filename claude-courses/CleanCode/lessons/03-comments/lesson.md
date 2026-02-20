# Lesson 3: Comments

## The Problem — Why Are Most Comments Bad?

Comments exist because we **fail to express ourselves in code**. Every comment represents a failure to make the code self-explanatory. That's a strong statement, but consider: code gets changed, comments usually don't. Over time, comments rot — they drift from what the code actually does, becoming misleading artifacts.

```
  Code changes over time:
  ┌─────────────────────────────┐
  │ // Calculate the discount   │  ← Written on Day 1
  │ function applyTax(price) {  │  ← Renamed on Day 47, comment not updated
  │   return price * 1.08;      │  ← Changed on Day 112, comment still says "discount"
  │ }                           │
  └─────────────────────────────┘
            │
            ▼
  The comment now LIES to you.
```

**Without discipline**, comments become a minefield of outdated information. **With clean code**, most comments become unnecessary — the code itself communicates intent.

---

## Don't Compensate for Bad Code With Comments

When you write code that's confusing, the instinct is to add a comment. The better instinct is to **rewrite the code**.

### A: Bad — comment papering over unclear code

```ts
// Check to see if the employee is eligible for full benefits
if ((employee.flags & HOURLY_FLAG) && (employee.age > 65)) {
  // ...
}
```

### B: Clean — the code explains itself

```ts
if (employee.isEligibleForFullBenefits()) {
  // ...
}
```

The comment is gone because it's no longer needed. The method name **is** the comment. And unlike a comment, the method name will be updated when the logic changes (because it's actual code that gets compiled/executed).

---

## Good Comments

Some comments are genuinely valuable. Here are the legitimate kinds:

### Legal Comments

```ts
// Copyright (c) 2024 Acme Corp. All rights reserved.
// Licensed under the MIT License.
```

Required by your organization or license. Put them at the top and move on.

### Informative Comments

```ts
// Format: YYYY-MM-DD'T'HH:mm:ss.SSSZ
const ISO_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
```

Regex is inherently hard to read. A comment explaining the expected format is genuinely helpful here.

### Explanation of Intent

```ts
// We sort by creation date descending because the business requirement
// is to show the most recent transaction first, even though the API
// returns them in ascending order.
sortByCreatedAtDescending(transactions);
```

The **what** is clear from the code. The comment explains the **why** — a business decision that can't be expressed in code.

### Warning of Consequences

```ts
// WARNING: This test takes 30 minutes to run.
// It hits the real payment sandbox and is rate-limited.
test("full payment integration cycle", async () => {
  // ...
});
```

Saving the next developer from a nasty surprise. Valuable.

### TODO Comments

```ts
// TODO: Replace with proper caching once Redis is set up (ticket #1234)
function getExchangeRates(): ExchangeRate[] {
  return fetchFromApi("/exchange-rates");
}
```

Acceptable as a marker for future work, especially when linked to a ticket. But don't let TODOs accumulate into a graveyard of good intentions.

### Amplification

```ts
// This trim() is critical — the upstream API sometimes returns
// account IDs with trailing whitespace, which causes lookup failures.
const accountId = rawAccountId.trim();
```

Highlights something that might otherwise look insignificant. Without this comment, a future developer might think "why is this trim here?" and remove it.

---

## Bad Comments

These are far more common. Each one represents noise that makes your codebase harder to read.

### Mumbling

```ts
// Set the default
this.defaultValue = config.defaultValue || "N/A";
```

Yes, I can see you're setting the default. The comment says nothing the code doesn't already say.

### Redundant Comments

```ts
/**
 * Returns the day of the month.
 * @returns {number} The day of the month.
 */
function getDayOfMonth(): number {
  return this.dayOfMonth;
}
```

The comment takes longer to read than the code itself. It adds zero information. It's pure noise.

### Misleading Comments

```ts
// Returns true if the user is active
function getUser(id: string): User | null {
  return userRepository.findById(id);
}
```

The comment says it returns a boolean about active status. The code returns a User or null. Someone copied this comment from elsewhere or the function changed and the comment didn't. Now it actively deceives.

### Mandated Comments

```ts
/**
 * @param userId - The user ID
 * @param email - The email
 * @param name - The name
 * @returns The user
 */
function createUser(userId: string, email: string, name: string): User {
  // ...
}
```

"Every function must have a JSDoc comment" — a well-intentioned rule that produces mountains of noise. These comments say `@param email - The email`, which is the documentation equivalent of `x = x`. If the code already has clear names, mandated comments just add clutter.

### Journal Comments

```ts
/**
 * Changes:
 * 2024-01-15 - Added email validation (Alice)
 * 2024-02-03 - Fixed null check on address (Bob)
 * 2024-03-22 - Refactored to use new API (Alice)
 */
```

This is what version control is for. `git log` and `git blame` do this perfectly, and they can't go stale.

### Closing Brace Comments

```ts
function processOrders(orders: Order[]): void {
  for (const order of orders) {
    if (order.status === "pending") {
      for (const item of order.items) {
        if (item.inStock) {
          // ... 20 lines of processing
        } // if item in stock
      } // for each item
    } // if pending
  } // for each order
} // processOrders
```

If your nesting is so deep that you need comments to track which brace closes what, the function is too long. Extract methods instead of adding brace labels.

### Commented-Out Code

```ts
function calculateTotal(items: LineItem[]): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
    // total += item.price * item.quantity * (1 - item.discount);
    // if (item.taxable) {
    //   total += item.price * item.quantity * TAX_RATE;
    // }
  }
  return total;
}
```

Nobody deletes commented-out code because "someone put it there for a reason." It sits there for years, accumulating, making readers wonder if it's important. Delete it. It's in git if you ever need it back.

---

## Express Yourself in Code

The ultimate principle: before writing a comment, try harder to express the same idea in code.

### A: Bad — comment needed because code is cryptic

```ts
// Check if the account is past due and has no payment plan
if (account.status === 3 && !account.planId && daysSince(account.lastPayment) > 90) {
  // ...
}
```

### B: Clean — the code IS the documentation

```ts
const isPastDue = daysSince(account.lastPayment) > 90;
const hasNoPaymentPlan = !account.planId;
const isDelinquent = account.status === AccountStatus.Delinquent;

if (isDelinquent && hasNoPaymentPlan && isPastDue) {
  // ...
}
```

Or even better, push it into a method:

```ts
if (account.requiresCollectionAction()) {
  // ...
}
```

No comment needed. The code tells the story.

---

## Key Takeaways

1. **Comments don't compensate for bad code** — if you need a comment, first try to rewrite the code
2. **Good comments are rare and valuable** — legal, informative (regex), intent (why), warnings, TODOs, amplification
3. **Bad comments are common and harmful** — mumbling, redundant, misleading, mandated, journal, closing braces, commented-out code
4. **Comments rot** — code changes, comments don't. Stale comments are worse than no comments.
5. **Express yourself in code** — extract methods, use intention-revealing names, create explanatory variables
6. **Delete commented-out code** — it's in version control if you need it
