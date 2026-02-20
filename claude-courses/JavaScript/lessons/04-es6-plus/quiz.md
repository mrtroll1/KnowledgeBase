# Lesson 4: Modern JavaScript (ES6+) — Quiz

## Q1

What's the output?

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var:', i), 0);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let:', j), 0);
}
```

---

## Q2

What's the output?

```js
const a = { x: 1, y: 2, z: 3 };
const { x, ...rest } = a;
const b = { ...rest, z: 99 };

console.log(b);
console.log(a.z);
```

---

## Q3

What's the output?

```js
let x = 1;
{
  console.log(x);
  let x = 2;
}
```

---

## Q4

What's the output?

```js
const config = {
  debug: false,
  count: 0,
  name: '',
  timeout: null
};

const debug = config.debug || true;
const count = config.count || 10;
const name = config.name || 'anonymous';
const timeout = config.timeout ?? 5000;

console.log(debug, count, name, timeout);
```

---

## Q5

What's the output?

```js
const data = {
  users: [
    { name: 'Alice', address: { city: 'NYC' } },
    { name: 'Bob' }
  ]
};

console.log(data.users[0]?.address?.city);
console.log(data.users[1]?.address?.city);
console.log(data.users[2]?.address?.city);
console.log(data?.users?.[0]?.name);
```
