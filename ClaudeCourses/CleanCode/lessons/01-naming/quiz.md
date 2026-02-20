# Lesson 1: Naming — Quiz

## Q1

What's wrong with the names in this function? Rewrite it with better names.

```ts
function calc(a: any[], d: number): any[] {
  const r: any[] = [];
  for (const i of a) {
    if (i.d > d) {
      r.push(i);
    }
  }
  return r;
}
```

---

## Q2

This codebase uses three different words for the same operation across its service layer. What's the problem, and how would you fix it?

```ts
class UserService {
  fetchUser(id: string): User { ... }
}

class OrderService {
  retrieveOrder(id: string): Order { ... }
}

class ProductService {
  getProduct(id: string): Product { ... }
}
```

---

## Q3

What naming rule does this class violate, and why does it matter?

```ts
class ProcessOrder {
  amount: number;
  items: LineItem[];
  customer: Customer;

  execute(): Receipt { ... }
}
```

---

## Q4

A colleague asks you to review this code. Identify all the naming problems.

```ts
const theData = await fetchAccounts();
const list2 = theData.filter(a => a.stat === "ACTV");
const genymdhms = Date.now();
const hp = list2.some(a => a.role === "admin");
```

---

## Q5

Why is the second version better than the first? Explain what principle is at work.

```ts
// Version A
function check(u: User): boolean {
  if (u.age >= 18 && u.email && u.acceptedTerms) {
    return true;
  }
  return false;
}

// Version B
function isEligibleForRegistration(user: User): boolean {
  const isAdult = user.age >= 18;
  const hasEmail = Boolean(user.email);
  const hasAcceptedTerms = user.acceptedTerms;

  return isAdult && hasEmail && hasAcceptedTerms;
}
```
