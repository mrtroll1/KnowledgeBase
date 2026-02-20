# Lesson 1: OOP Fundamentals — Answers

## Q1

Making `health` public means any code could do `player.health = 9999` or `player.health = -50`, bypassing all the validation in `takeDamage()`. The `Math.max(0, ...)` guard and the `die()` trigger would be useless — anyone can set health to whatever they want.

The proper solution is to add a getter:

```typescript
get health(): number {
  return this._health;
}
```

This gives read-only access without exposing the ability to write. The outside world can check health, but only `takeDamage()` can change it. Alternatively, keep the field `private` and expose a `getHealth()` method — same effect.

## Q2

A Car **is not** an Engine. A Car **has** an Engine. This fails the "is-a" test — you wouldn't say "a car is a kind of engine." The correct relationship is composition:

```typescript
class Car {
  private engine: Engine;

  constructor() {
    this.engine = new Engine();  // Car owns the Engine
  }

  drive(): void {
    this.engine.start();
    console.log("Driving...");
  }
}
```

The inheritance version also leaks `start()` and `stop()` as public methods on `Car`, which doesn't make semantic sense ("car.start()" maybe, but that's the car starting, not the engine directly).

## Q3

This is **composition**. The two signals:

1. `Order` **creates** the `OrderItem` objects itself inside its constructor (`new OrderItem(...)`). The items don't exist before the order.
2. When the order is cancelled, the items are destroyed (`this.items = []`). Their lifecycle is bound to the order.

If the items were passed in from outside (dependency injection), and could exist independently or belong to multiple orders, that would be aggregation. But here, the order exclusively owns its line items.

## Q4

This is a **bad use** of static. The problems:

1. **Hidden dependency**: Every piece of code that calls `UserService.getUser()` silently depends on a real database connection. You can't see this from the call site.
2. **Untestable**: You can't substitute a mock database — `static database` is hardwired at class load time.
3. **No lifecycle control**: The `PostgresClient` is created when the class loads. You can't close it, reset it, or configure it differently for tests vs production.

The fix: make it a regular class with an injected dependency:

```typescript
class UserService {
  constructor(private database: DatabaseClient) {}

  async getUser(id: string): Promise<User> {
    return this.database.query(`SELECT * FROM users WHERE id = $1`, [id]);
  }
}
```

Now you can pass a real DB in production and a mock in tests.

## Q5

**Abstract class** — because you have shared implementation (`color` property, `setColor()` method), not just a contract. An interface can only define the shape, not provide code.

```typescript
abstract class Shape {
  protected color: string = "black";

  setColor(color: string): void {
    this.color = color;
  }

  abstract draw(): void;
  abstract getArea(): number;
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  draw(): void {
    console.log(`Drawing ${this.color} circle with radius ${this.radius}`);
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
}
```

If there were no shared implementation (no `color`, no `setColor()`), then an interface would be the right call — it's lighter weight and a class can implement multiple interfaces but only extend one abstract class.
