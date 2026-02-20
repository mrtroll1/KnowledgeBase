# Lesson 3: Classes & Patterns — Quiz

## Q1

Will this compile? If not, what's the error?

```ts
class BankAccount {
  private balance: number;

  constructor(initial: number) {
    this.balance = initial;
  }

  getBalance(): number {
    return this.balance;
  }
}

class SavingsAccount extends BankAccount {
  addInterest(rate: number): void {
    this.balance *= (1 + rate);
  }
}
```

---

## Q2

Will this compile? Why or why not?

```ts
interface Logger {
  log(message: string): void;
  level: "info" | "warn" | "error";
}

class ConsoleLogger implements Logger {
  level = "info";

  log(message: string): void {
    console.log(`[${this.level}] ${message}`);
  }
}
```

---

## Q3

Given structural typing, will this compile?

```ts
interface Printable {
  print(): string;
}

class Invoice {
  constructor(public amount: number) {}

  print(): string {
    return `Invoice: $${this.amount}`;
  }
}

function printDocument(doc: Printable) {
  console.log(doc.print());
}

const invoice = new Invoice(99.99);
printDocument(invoice);
```

---

## Q4

What's wrong with this code? How would you make it safer?

```ts
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  const user = data as { name: string; email: string };
  return user.name.toUpperCase();
}
```

---

## Q5

Two `Config` interface declarations exist in the same file. What type does `config` have? Will this compile?

```ts
interface Config {
  host: string;
  port: number;
}

interface Config {
  debug: boolean;
}

const config: Config = {
  host: "localhost",
  port: 3000,
};
```
