# Lesson 4: Formatting — Quiz

## Q1

This file puts the main function at the bottom. Reorder it so it follows the newspaper metaphor.

```ts
function sanitizeInput(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildSearchQuery(term: string): object {
  return { $text: { $search: term } };
}

function formatResults(docs: any[]): SearchResult[] {
  return docs.map(doc => ({ id: doc._id, title: doc.title, score: doc.score }));
}

async function search(rawInput: string): Promise<SearchResult[]> {
  const term = sanitizeInput(rawInput);
  const query = buildSearchQuery(term);
  const docs = await db.collection("articles").find(query).toArray();
  return formatResults(docs);
}
```

---

## Q2

What's wrong with the vertical formatting in this class? Fix it.

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

---

## Q3

This function declares all variables at the top, C-style. Why is this a problem and how would you fix it?

```ts
function generateUserReport(userId: string): Report {
  let user: User;
  let orders: Order[];
  let totalSpent: number;
  let averageOrder: number;
  let lastOrderDate: Date;
  let membershipTier: string;

  user = userRepo.findById(userId);
  orders = orderRepo.findByUserId(userId);

  totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
  averageOrder = orders.length > 0 ? totalSpent / orders.length : 0;

  lastOrderDate = orders.length > 0 ? orders[orders.length - 1].date : user.createdAt;

  membershipTier = totalSpent > 10000 ? "gold" : totalSpent > 1000 ? "silver" : "bronze";

  return { user, totalSpent, averageOrder, lastOrderDate, membershipTier };
}
```

---

## Q4

In this file, `processPayment` calls `validateCard` and `chargeCard`, but they're placed far apart with unrelated functions between them. What formatting principle does this violate?

```ts
function processPayment(card: Card, amount: number): Receipt { ... }

function formatAddress(address: Address): string { ... }

function calculateShipping(weight: number): number { ... }

function sendNotification(userId: string, message: string): void { ... }

function validateCard(card: Card): boolean { ... }

function chargeCard(card: Card, amount: number): ChargeResult { ... }
```

---

## Q5

Look at this block of code. Where would you add blank lines to improve readability, and where would you remove them? Explain the principle behind each change.

```ts
async function onboardNewClient(data: ClientData): Promise<Client> {
  const existingClient = await clientRepo.findByEmail(data.email);
  if (existingClient) {
    throw new ConflictError("Client already exists");
  }
  const validatedData = validateClientData(data);
  const client = await clientRepo.create(validatedData);
  const workspace = await workspaceService.provision(client.id);
  await billingService.createSubscription(client.id, data.plan);
  await emailService.sendWelcome(client.email, workspace.url);
  logger.info(`Onboarded client ${client.id}`);
  return client;
}
```
