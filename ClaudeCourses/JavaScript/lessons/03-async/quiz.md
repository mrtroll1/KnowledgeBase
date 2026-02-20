# Lesson 3: Async JavaScript — Quiz

## Q1

What's the output, in order?

```js
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

Promise.resolve().then(() => {
  console.log('D');
  setTimeout(() => console.log('E'), 0);
});

console.log('F');
```

---

## Q2

What's the output?

```js
async function foo() {
  console.log('1');
  const val = await Promise.resolve('2');
  console.log(val);
  console.log('3');
}

console.log('4');
foo();
console.log('5');
```

---

## Q3

What's wrong with this code? It works, but it has a performance problem.

```js
async function loadUserProfile(userId) {
  const user = await fetch(`/api/users/${userId}`);
  const posts = await fetch(`/api/users/${userId}/posts`);
  const followers = await fetch(`/api/users/${userId}/followers`);

  return { user, posts, followers };
}
```

---

## Q4

What's the output?

```js
const p = new Promise((resolve, reject) => {
  resolve('first');
  resolve('second');
  reject('error');
});

p.then(val => console.log(val))
 .catch(err => console.log(err));
```

---

## Q5

What's the output?

```js
async function bar() {
  try {
    const result = await Promise.reject('oops');
    console.log('A:', result);
  } catch (e) {
    console.log('B:', e);
  }
  console.log('C');
}

bar().then(() => console.log('D'));
```
