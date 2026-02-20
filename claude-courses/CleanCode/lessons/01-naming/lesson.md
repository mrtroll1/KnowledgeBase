# Lesson 1: Naming

## The Problem — Why Do Names Matter?

You spend far more time **reading** code than writing it. The ratio is roughly 10:1. Every time you name a variable, function, or class poorly, you're taxing every future reader — including yourself in two weeks.

Bad names force readers to **reverse-engineer intent**. Good names make intent obvious.

```
Bad name encountered
       │
       ▼
  "What does this mean?"
       │
       ▼
  Read surrounding code
       │
       ▼
  Build mental model
       │
       ▼
  FINALLY understand
  (wasted 5 minutes)
```

**Without good names**, every line of code becomes a puzzle. **With good names**, code reads like well-written prose.

---

## Intention-Revealing Names

The name of a variable, function, or class should tell you **why it exists**, **what it does**, and **how it's used**.

### A: Bad — What does this even do?

```ts
function getThem(theList: number[][]): number[][] {
  const list1: number[][] = [];
  for (const x of theList) {
    if (x[0] === 4) {
      list1.push(x);
    }
  }
  return list1;
}
```

You can read every line and still have no idea what this code is about. What is `theList`? What does index `0` mean? What's special about `4`?

### B: Clean — Now it makes sense

```ts
const FLAGGED = 4;
const STATUS_INDEX = 0;

function getFlaggedCells(gameBoard: number[][]): number[][] {
  const flaggedCells: number[][] = [];
  for (const cell of gameBoard) {
    if (cell[STATUS_INDEX] === FLAGGED) {
      flaggedCells.push(cell);
    }
  }
  return flaggedCells;
}
```

Same logic — but now you know it's a minesweeper board, you're looking for flagged cells, and the first element is a status. The code **tells you** instead of making you guess.

---

## Avoid Disinformation and Mental Mapping

### Don't lie with your names

```ts
// BAD — it's not a list, it's a Map
const accountList = new Map<string, Account>();

// GOOD — say what it is
const accountsByEmail = new Map<string, Account>();
```

Calling a Map a "list" is disinformation. A reader will assume array behavior and be confused.

### Don't make the reader translate

```ts
// BAD — the reader must remember what r, a, and q mean
const r = fetchUsers();
const a = r.filter(u => u.active);
const q = a.length;

// GOOD — no mental mapping needed
const allUsers = fetchUsers();
const activeUsers = allUsers.filter(user => user.active);
const activeUserCount = activeUsers.length;
```

Single-letter variables force a mental mapping: "OK, `r` is the response, `a` is the active ones..." That's cognitive load you're imposing on every reader. The only acceptable single-letter variable is a loop counter like `i` in a short loop — and even then, a descriptive name is often better.

---

## Use Pronounceable, Searchable Names

### Pronounceable — you need to be able to talk about code

```ts
// BAD — try saying this in a code review
const genymdhms = new Date(); // "generation year month day hour minute second"

// GOOD — you can actually discuss this
const generationTimestamp = new Date();
```

If you can't pronounce it, you can't discuss it without sounding ridiculous. "Hey, can you check the gen-yim-dee-aitch-em-ess variable?"

### Searchable — you need to be able to find things

```ts
// BAD — try searching for the number 5 in a codebase
if (tasks.length > 5) { ... }

// GOOD — searchable and self-documenting
const MAX_TASKS_PER_USER = 5;
if (tasks.length > MAX_TASKS_PER_USER) { ... }
```

The length of a name should correspond to the size of its scope. A single-letter name might be fine in a 3-line lambda. A constant used across the entire application needs a name you can `Ctrl+F` for.

---

## Class Names = Nouns, Method Names = Verbs

This is a simple rule that prevents a lot of confusion:

```ts
// GOOD — classes are nouns (they represent things)
class UserAccount { }
class PaymentProcessor { }
class EmailTemplate { }

// BAD — classes that sound like actions
class ProcessPayment { }    // Is this a class or a function?
class ManageUsers { }       // Verb phrases belong on methods
```

```ts
// GOOD — methods are verbs (they represent actions)
userAccount.activate();
paymentProcessor.processRefund(order);
emailTemplate.renderHtml();

// BAD — methods that sound like nouns
userAccount.status();        // Gets status? Sets status? Checks status?
paymentProcessor.refund();   // Better: processRefund(), issueRefund()
```

Accessors and mutators follow conventions:

```ts
// Getters, setters, predicates
user.getName();             // get + noun
user.setName("Alice");      // set + noun
user.isActive();            // is + adjective (returns boolean)
user.hasPermission("admin"); // has + noun (returns boolean)
```

---

## One Word Per Concept

Pick **one** word for one abstract concept and stick with it.

```ts
// BAD — three words for the same concept across different classes
class UserRepository {
  fetch(id: string) { }      // "fetch" here
}

class OrderRepository {
  retrieve(id: string) { }   // "retrieve" here
}

class ProductRepository {
  get(id: string) { }        // "get" here
}

// GOOD — consistent vocabulary
class UserRepository {
  get(id: string) { }
}

class OrderRepository {
  get(id: string) { }
}

class ProductRepository {
  get(id: string) { }
}
```

If `fetch`, `retrieve`, and `get` all mean the same thing, pick one. A reader seeing `fetch` on one class and `get` on another will wonder if they do different things.

---

## Use Solution Domain and Problem Domain Names

You're writing code for **programmers** to read. Don't be afraid to use technical terms they already know:

```ts
// GOOD — solution domain names (patterns, CS terms)
class AccountVisitor { }          // Visitor pattern — devs know this
const userQueue: Queue<User> = new LinkedList();  // Queue is a known data structure
function mergeSort(items: number[]): number[] { } // Algorithm name

// GOOD — problem domain names (business terms)
class MortgageApplication { }     // Domain term the business uses
function calculateAmortization() { }  // Domain-specific concept
const escrowBalance = 0;          // Term from the real-estate domain
```

Use CS/pattern names when the concept is technical. Use business terms when the concept is from the problem domain. The goal is: a reader should be able to ask either a developer or a domain expert what a name means and get an answer.

---

## Add Meaningful Context

Names don't exist in isolation — they live in classes, functions, and namespaces. Use context to your advantage.

### A: Bad — ambiguous without context

```ts
function printAddress(
  firstName: string,
  lastName: string,
  street: string,
  city: string,
  state: string,
  zipCode: string
) {
  // What is "state"? Application state? US state? State machine state?
}
```

### B: Clean — context makes meaning clear

```ts
class MailingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;    // Now clearly a geographic state
  zipCode: string;

  print(): string {
    return `${this.firstName} ${this.lastName}\n${this.street}\n${this.city}, ${this.state} ${this.zipCode}`;
  }
}
```

Inside `MailingAddress`, `state` unambiguously means a geographic state. The class provides context that the standalone function couldn't.

But don't add **gratuitous** context:

```ts
// BAD — redundant prefix on everything
class MailingAddress {
  mailingAddressFirstName: string;   // We KNOW it's a mailing address
  mailingAddressLastName: string;    // — we're inside the class
  mailingAddressStreet: string;
}

// GOOD — the class name IS the context
class MailingAddress {
  firstName: string;
  lastName: string;
  street: string;
}
```

---

## Key Takeaways

1. **Names should reveal intent** — if a name requires a comment, the name is wrong
2. **Avoid disinformation** — don't call a Map a "list" or a Set an "array"
3. **Avoid mental mapping** — the reader shouldn't need a decoder ring
4. **Make names pronounceable and searchable** — you need to talk about code and find things in it
5. **Classes = nouns, methods = verbs** — simple rule, prevents confusion
6. **One word per concept** — `get`, `fetch`, `retrieve` — pick ONE across the codebase
7. **Use context wisely** — let classes and namespaces do the work, don't over-prefix
