# Lesson 1: Naming — Answers

## Q1

Every name is a single letter or abbreviation that forces mental mapping. `a` is some array, `d` is some date/number, `r` is the result, `i` is an item, `i.d` is... a date? An id? Impossible to know.

```ts
function getOverdueInvoices(invoices: Invoice[], cutoffDate: number): Invoice[] {
  const overdueInvoices: Invoice[] = [];
  for (const invoice of invoices) {
    if (invoice.dueDate > cutoffDate) {
      overdueInvoices.push(invoice);
    }
  }
  return overdueInvoices;
}
```

Now the function name tells you what it does. The parameter names tell you what they are. The loop variable tells you what you're iterating over. Zero mental mapping required.

## Q2

Three different words — `fetch`, `retrieve`, `get` — for the same concept (loading a single entity by ID). This violates the "one word per concept" rule. A reader will wonder: does `fetch` imply a network call while `get` reads from cache? Is `retrieve` something else entirely?

Fix: pick one word and use it everywhere.

```ts
class UserService {
  getUser(id: string): User { ... }
}
class OrderService {
  getOrder(id: string): Order { ... }
}
class ProductService {
  getProduct(id: string): Product { ... }
}
```

Consistency across the codebase means a developer learning one class already knows the vocabulary of the others.

## Q3

Class names should be **nouns**, not verb phrases. `ProcessOrder` sounds like a function call, not a thing. It confuses the reader about whether they're looking at a class or an action.

Better: name it `Order`, `SalesOrder`, or `OrderTransaction` — a noun that represents the thing. The *action* of processing belongs on a method: `order.process()` or on a separate service: `orderProcessor.process(order)`.

## Q4

Four problems in four lines:

1. **`theData`** — noise word. `the` adds nothing. Call it `accounts` (what it actually is).
2. **`list2`** — numbered name with no meaning. Call it `activeAccounts` (what it represents).
3. **`a.stat === "ACTV"`** — abbreviated, unsearchable. Use `account.status === "ACTIVE"` (or better, an enum).
4. **`genymdhms`** — unpronounceable, incomprehensible. Call it `generationTimestamp` or `fetchedAt`.
5. **`hp`** — cryptic. Call it `hasAdminAccount` or `includesAdmin` (reveals what the boolean means).

```ts
const accounts = await fetchAccounts();
const activeAccounts = accounts.filter(account => account.status === AccountStatus.Active);
const fetchedAt = Date.now();
const includesAdmin = activeAccounts.some(account => account.role === "admin");
```

## Q5

Version B is better because of two principles working together:

1. **Intention-revealing function name**: `isEligibleForRegistration` tells you exactly what the function determines. `check` tells you nothing — check what? Version B's name means you often don't even need to read the body.

2. **Intention-revealing intermediate variables**: `isAdult`, `hasEmail`, `hasAcceptedTerms` explain each condition in plain language. In Version A, `u.age >= 18 && u.email && u.acceptedTerms` forces you to mentally decode each sub-expression. The intermediate variables act as documentation that can't go stale.

The parameter name also improves from `u` (mental mapping) to `user` (self-documenting).
