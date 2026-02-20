# Lesson 1: Type System Basics — Quiz

## Q1

What type does TypeScript infer for each variable? Will any of these cause a compile error?

```ts
let a = "hello";
const b = "hello";
let c = [1, 2, 3];
let d = [1, "two", true];
const e = { name: "Alice", age: 30 };
```

---

## Q2

Will this code compile? If not, what's the error?

```ts
type Shape = "circle" | "square" | "triangle";

function describeShape(shape: Shape): string {
  return `This is a ${shape}`;
}

let myShape = "circle";
describeShape(myShape);
```

---

## Q3

Given these definitions, will `person` compile? Why or why not?

```ts
interface HasName {
  name: string;
}

interface HasEmail {
  email: string;
}

type Contact = HasName & HasEmail;

const person: Contact = {
  name: "Alice",
};
```

---

## Q4

Both of these define a `User` shape. What practical difference exists between them?

```ts
// Version A
type User = {
  id: string;
  name: string;
};

// Version B
interface User {
  id: string;
  name: string;
}
```

---

## Q5

What type does `result` have? Will this function compile?

```ts
function process(input: string | number) {
  const result = input.toUpperCase();
  return result;
}
```
