# Lesson 3: Comments — Answers

## Q1

- **A — Good.** Legal comment. Required by the license, belongs at the top of the file.
- **B — Bad.** Redundant. The function name `getUser` already says exactly what it does. The comment adds zero information.
- **C — Good.** Warning of consequences. Mutating input is a non-obvious side effect. This saves future developers from passing shared state and getting bitten.
- **D — Bad.** Journal comment. This is what `git blame` and commit messages are for. It will never be updated and will accumulate clutter over time.
- **E — Good.** Explanation of intent. The *what* (dividing by 100) is obvious, but the *why* (API returns cents, UI expects dollars) is a business/integration decision that can't be expressed in code alone.

## Q2

Replace the comment with intention-revealing code:

```ts
const isPaidSubscriber = user.subscription !== "free" && user.subscription !== null;
const isNotBanned = !user.isBanned;

if (isPaidSubscriber && isNotBanned) {
  showPremiumContent();
}
```

Or, even cleaner, push the logic into a method:

```ts
if (user.canAccessPremiumContent()) {
  showPremiumContent();
}
```

The comment is gone because the code now communicates the same information. And unlike a comment, these names will be part of the code that gets maintained.

## Q3

Everything is wrong:

1. **The JSDoc is pure noise.** "Processes the data" is a tautology. `@param data - the data to process` says nothing. These mandated-style comments are worse than no comments because they give the illusion of documentation.

2. **The inline comments are redundant.** "Skip inactive items" restates `if (!item.active) continue`. "Apply the transformation" restates the next three lines.

3. **The real problem is the code itself** — vague names (`processData`, `data`, `result`, `item`, `transformed`) and `any` types.

Fix by renaming and typing properly:

```ts
interface Product {
  name: string;
  active: boolean;
}

interface NormalizedProduct extends Product {
  name: string;
  processedAt: Date;
}

function normalizeActiveProducts(products: Product[]): NormalizedProduct[] {
  return products
    .filter(product => product.active)
    .map(product => ({
      ...product,
      name: product.name.toUpperCase(),
      processedAt: new Date(),
    }));
}
```

No comments needed. The function name says what it does. The types document the shape. The code is short enough to understand at a glance.

## Q4

Three arguments for deletion:

1. **Version control exists.** The old distance-based logic is preserved in git history. You can find it with `git log -p -- shipping.ts` or `git blame`. It's not lost — it's just not cluttering the working code.

2. **Commented-out code never gets deleted later.** It sits there for months or years. Future developers won't remove it because they'll think "someone left it for a reason." It becomes permanent noise.

3. **It actively confuses readers.** When someone reads this function, they now have to process two algorithms — the live one and the dead one — and figure out which is real. That's wasted cognitive load on every single reader.

If the team genuinely might need the old algorithm, document it in the commit message or a design doc — not in the live code.

## Q5

The closing brace comments are a **symptom**, not the disease. The real problem is that the function is too deeply nested and too long. When you need comments to track which brace closes what, the function is screaming to be broken up.

Fix by extracting functions and using early returns (guard clauses):

```ts
function processTransactions(accounts: Account[]): void {
  const activeAccounts = accounts.filter(account => account.isActive);
  for (const account of activeAccounts) {
    processAccountTransactions(account);
  }
}

function processAccountTransactions(account: Account): void {
  const pendingTransactions = account.transactions.filter(tx => tx.status === "pending");
  for (const tx of pendingTransactions) {
    processTransaction(account, tx);
  }
}

function processTransaction(account: Account, tx: Transaction): void {
  if (tx.amount <= 0) return;
  ledger.record(account.id, tx);
  tx.status = "processed";
}
```

Zero nesting. Zero closing-brace comments needed. Each function does one thing at one level of abstraction. This is what the lesson on functions taught — and it eliminates an entire category of bad comments.
