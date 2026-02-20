# Lesson 4: Formatting — Answers

## Q1

Put the main `search` function at the top (the "headline"), then the supporting functions in the order they're called:

```ts
async function search(rawInput: string): Promise<SearchResult[]> {
  const term = sanitizeInput(rawInput);
  const query = buildSearchQuery(term);
  const docs = await db.collection("articles").find(query).toArray();
  return formatResults(docs);
}

function sanitizeInput(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildSearchQuery(term: string): object {
  return { $text: { $search: term } };
}

function formatResults(docs: any[]): SearchResult[] {
  return docs.map(doc => ({ id: doc._id, title: doc.title, score: doc.score }));
}
```

A reader opening this file immediately sees `search` — the module's purpose. The supporting functions follow in the order they're needed, each answering the "how does this step work?" question.

## Q2

Two problems:

1. **Too many blank lines within cohesive groups** — the three fields and the constructor body are each one thought, but blank lines break them apart. This violates vertical density.
2. **Missing blank lines between methods** — `addItem`, `removeItem`, and `getTotal` are crammed together. These are separate concepts and need vertical openness.

Fixed:

```ts
class ShoppingCart {
  private items: CartItem[];
  private discount: number;
  private taxRate: number;

  constructor(taxRate: number) {
    this.items = [];
    this.discount = 0;
    this.taxRate = taxRate;
  }

  addItem(item: CartItem): void {
    this.items.push(item);
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter(i => i.id !== itemId);
  }

  getTotal(): number {
    const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
    const discounted = subtotal * (1 - this.discount);
    return discounted * (1 + this.taxRate);
  }
}
```

Fields are dense (one thought). Constructor is dense (one thought). Blank line between the fields and constructor. Blank line between each method.

## Q3

Declaring all variables at the top — far from where they're used — forces the reader to hold them all in memory while scrolling to their usage. It violates the vertical distance principle: variables should be declared **close to their first use**.

Fixed:

```ts
function generateUserReport(userId: string): Report {
  const user = userRepo.findById(userId);
  const orders = orderRepo.findByUserId(userId);

  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
  const averageOrder = orders.length > 0 ? totalSpent / orders.length : 0;

  const lastOrderDate = orders.length > 0
    ? orders[orders.length - 1].date
    : user.createdAt;

  const membershipTier = totalSpent > 10000 ? "gold"
    : totalSpent > 1000 ? "silver"
    : "bronze";

  return { user, totalSpent, averageOrder, lastOrderDate, membershipTier };
}
```

Each variable is declared and assigned in one step, right where it's used. You can also use `const` now (which the original couldn't because declaration and assignment were separate), making the code safer.

## Q4

This violates **vertical distance for dependent functions**. `processPayment` calls `validateCard` and `chargeCard`, but three unrelated functions (`formatAddress`, `calculateShipping`, `sendNotification`) sit between them. A reader looking at `processPayment` has to scroll past irrelevant code to find the functions it calls.

Fixed — group by dependency and conceptual affinity:

```ts
function processPayment(card: Card, amount: number): Receipt { ... }

function validateCard(card: Card): boolean { ... }

function chargeCard(card: Card, amount: number): ChargeResult { ... }

function calculateShipping(weight: number): number { ... }

function formatAddress(address: Address): string { ... }

function sendNotification(userId: string, message: string): void { ... }
```

The payment-related functions are together. The caller (`processPayment`) is above its callees. Unrelated functions are moved away.

## Q5

The function has three logical phases that would benefit from visual separation:

```ts
async function onboardNewClient(data: ClientData): Promise<Client> {
  // Phase 1: Guard — check for duplicates
  const existingClient = await clientRepo.findByEmail(data.email);
  if (existingClient) {
    throw new ConflictError("Client already exists");
  }

  // Phase 2: Create — validate and persist
  const validatedData = validateClientData(data);
  const client = await clientRepo.create(validatedData);

  // Phase 3: Provision — set up everything the client needs
  const workspace = await workspaceService.provision(client.id);
  await billingService.createSubscription(client.id, data.plan);
  await emailService.sendWelcome(client.email, workspace.url);
  logger.info(`Onboarded client ${client.id}`);

  return client;
}
```

The principles at work:
- **Vertical openness** — blank line after the guard clause separates "validation" from "creation." Blank line after client creation separates "core persistence" from "provisioning side effects."
- **Vertical density** — the provisioning lines (workspace, billing, email, log) are kept together because they're all part of the same thought: "set up everything for this new client."

Note: the exact grouping is somewhat subjective. The key is that you consciously group related lines and separate unrelated ones, rather than having everything run together in an undifferentiated block.
