# Lesson 2: Advanced Types — Quiz

## Q1

Will this compile? If not, what's the error and how would you fix it?

```ts
function getLength<T>(item: T): number {
  return item.length;
}
```

---

## Q2

What type does `result` have? Explain why.

```ts
function identity<T>(value: T): T {
  return value;
}

const result = identity("hello");
```

---

## Q3

Given this interface, what type does `Partial<Config>` produce? Will the `update` call compile?

```ts
interface Config {
  host: string;
  port: number;
  debug: boolean;
}

function update(changes: Partial<Config>) { /* ... */ }

update({ port: 8080, verbose: true });
```

---

## Q4

What type does `EventHandler` resolve to?

```ts
type Color = "red" | "blue";
type Size = "small" | "large";
type EventHandler = `${Color}-${Size}`;
```

---

## Q5

Will this compile? What does TypeScript see inside each branch?

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape): number {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
  return shape.side ** 2;
}
```
