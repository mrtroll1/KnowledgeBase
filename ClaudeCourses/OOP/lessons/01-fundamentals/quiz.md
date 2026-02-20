# Lesson 1: OOP Fundamentals — Quiz

## Q1

You have the following class. A junior developer says "just make `health` public so we can read it easily." Why is that a bad idea, and what's the proper solution?

```typescript
class Player {
  private health: number = 100;

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) this.die();
  }

  private die(): void {
    console.log("Game over");
  }
}
```

---

## Q2

What's wrong with this inheritance hierarchy? What relationship would be more appropriate?

```typescript
class Engine {
  start(): void { console.log("Engine started"); }
  stop(): void { console.log("Engine stopped"); }
}

class Car extends Engine {
  drive(): void {
    this.start();
    console.log("Driving...");
  }
}
```

---

## Q3

Is the following relationship association, aggregation, or composition? Explain why.

```typescript
class Order {
  private items: OrderItem[];

  constructor(products: Product[]) {
    this.items = products.map(p => new OrderItem(p.name, p.price));
  }

  cancel(): void {
    this.items = [];
  }
}

class OrderItem {
  constructor(
    public readonly name: string,
    public readonly price: number
  ) {}
}
```

---

## Q4

A colleague wrote this code. They're using `static` — is this a good use or a bad use? Why?

```typescript
class UserService {
  static database = new PostgresClient();

  static async getUser(id: string): Promise<User> {
    return UserService.database.query(`SELECT * FROM users WHERE id = $1`, [id]);
  }

  static async saveUser(user: User): Promise<void> {
    await UserService.database.query(
      `INSERT INTO users (name, email) VALUES ($1, $2)`,
      [user.name, user.email]
    );
  }
}
```

---

## Q5

You're building a shape drawing library. You need `Circle`, `Rectangle`, and `Triangle`. They all need a `draw()` method and a `getArea()` method, but each calculates area differently. They also share a `color` property and a `setColor()` method.

Should you use an interface or an abstract class? Write the base type and one concrete shape.
