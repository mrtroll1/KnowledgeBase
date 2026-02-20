# Lesson 3: Comments — Quiz

## Q1

Classify each comment below as "good" or "bad" and explain why.

```ts
// A
// Copyright (c) 2024 Acme Corp. MIT License.

// B
// This function gets the user
function getUser(id: string): User { ... }

// C
// WARNING: This mutates the input array. Do not pass shared state.
function sortInPlace(items: number[]): void { ... }

// D
// Added pagination support - 2024-03-15 - jsmith
function listUsers(page: number, limit: number): User[] { ... }

// E
// The API returns amounts in cents; we convert to dollars here
// because the UI layer expects dollar values.
const priceInDollars = apiResponse.amount / 100;
```

---

## Q2

This code has a comment. Remove the comment and rewrite the code so the comment is unnecessary.

```ts
// Check if the user can access premium content:
// they must be a paying subscriber who hasn't been banned
if (user.subscription !== "free" && user.subscription !== null && !user.isBanned) {
  showPremiumContent();
}
```

---

## Q3

What's wrong with this function's documentation? How would you fix it — would you improve the comments, remove them, or change the code?

```ts
/**
 * Processes the data.
 * @param data - the data to process
 * @returns processed data
 */
function processData(data: any[]): any[] {
  const result = [];
  for (const item of data) {
    // Skip inactive items
    if (!item.active) continue;
    // Apply the transformation
    const transformed = {
      ...item,
      name: item.name.toUpperCase(),
      processedAt: new Date(),
    };
    result.push(transformed);
  }
  return result;
}
```

---

## Q4

Your teammate left this block of commented-out code in a pull request, saying "we might need it later." What's your argument for deleting it?

```ts
function calculateShipping(order: Order): number {
  const weight = order.items.reduce((sum, item) => sum + item.weight, 0);

  // const distance = getDistance(order.warehouse, order.destination);
  // const distanceFee = distance > 500 ? weight * 0.5 : weight * 0.3;
  // if (order.isPriority) {
  //   return distanceFee * 1.5;
  // }
  // return distanceFee;

  if (weight < 5) return 5.99;
  if (weight < 20) return 12.99;
  return 24.99;
}
```

---

## Q5

This function has deeply nested code with closing brace comments. What's the real problem, and how would you fix it? (Hint: the answer is not "write better comments.")

```ts
function processTransactions(accounts: Account[]): void {
  for (const account of accounts) {                          // for each account
    if (account.isActive) {                                  // if active
      for (const tx of account.transactions) {               // for each transaction
        if (tx.status === "pending") {                       // if pending
          if (tx.amount > 0) {                               // if positive amount
            ledger.record(account.id, tx);
            tx.status = "processed";
          } // if positive amount
        } // if pending
      } // for each transaction
    } // if active
  } // for each account
}
```
