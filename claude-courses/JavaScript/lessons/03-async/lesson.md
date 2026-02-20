# Lesson 3: Async JavaScript

## The Problem — JavaScript Is Single-Threaded

JavaScript has one thread. One call stack. It can do exactly one thing at a time. So how does it handle a network request that takes 2 seconds without freezing your entire UI?

**Without async mechanisms**, this would happen:

```js
// Hypothetical synchronous fetch
const data = fetchSync('https://api.example.com/users'); // blocks for 2 seconds
console.log(data);  // only runs after 2 seconds
button.click();     // user can't click ANYTHING for 2 seconds
```

The page freezes. No scrolling, no clicking, nothing — because the single thread is stuck waiting.

**With async mechanisms**, JavaScript delegates the waiting to the browser/runtime and keeps executing:

```js
fetch('https://api.example.com/users')
  .then(data => console.log(data));  // runs LATER, when data arrives

console.log('This runs immediately');  // no blocking
button.click();                        // UI is responsive
```

How does this work? The event loop.

---

## The Event Loop

```
  ┌───────────────────────────────────────────────────────────────────┐
  │                        JAVASCRIPT RUNTIME                         │
  │                                                                   │
  │  ┌─────────────┐     ┌──────────────────────────────────────┐    │
  │  │ CALL STACK  │     │          WEB APIs / NODE APIs         │    │
  │  │             │     │  (setTimeout, fetch, DOM events,      │    │
  │  │  main()     │────►│   file I/O — runs OUTSIDE JS thread)  │    │
  │  │  foo()      │     │                                      │    │
  │  │  bar()      │     └──────────┬──────────┬────────────────┘    │
  │  └─────────────┘                │          │                     │
  │        ▲                        │          │                     │
  │        │                        ▼          ▼                     │
  │        │              ┌──────────────┐  ┌───────────────────┐    │
  │        │              │ MICROTASK Q  │  │   MACROTASK Q     │    │
  │        │              │              │  │                   │    │
  │        │              │ - Promise    │  │ - setTimeout      │    │
  │        │              │   .then()    │  │ - setInterval     │    │
  │        │              │ - queueMicro │  │ - I/O callbacks   │    │
  │        │              │   task()     │  │ - UI rendering    │    │
  │        │              └──────┬───────┘  └───────┬───────────┘    │
  │        │                     │                  │                │
  │        │                     ▼                  ▼                │
  │        │              ┌──────────────────────────────────────┐    │
  │        └──────────────│           EVENT LOOP                 │    │
  │                       │                                      │    │
  │                       │  1. Run everything on call stack     │    │
  │                       │  2. Drain ALL microtasks             │    │
  │                       │  3. Run ONE macrotask                │    │
  │                       │  4. Drain ALL microtasks again       │    │
  │                       │  5. Render (if needed)               │    │
  │                       │  6. Go to step 3                     │    │
  │                       └──────────────────────────────────────┘    │
  └───────────────────────────────────────────────────────────────────┘
```

The critical detail: **microtasks always drain before the next macrotask**. This means Promises (microtasks) get priority over setTimeout (macrotask).

```js
console.log('1 - synchronous');

setTimeout(() => console.log('2 - macrotask'), 0);

Promise.resolve().then(() => console.log('3 - microtask'));

console.log('4 - synchronous');

// Output:
// 1 - synchronous
// 4 - synchronous
// 3 - microtask      ← Promise runs before setTimeout, even though both are "async"
// 2 - macrotask
```

**Without understanding the event loop**, you'd think `setTimeout(fn, 0)` runs immediately. It doesn't — it runs after all synchronous code AND all microtasks have finished.

---

## Callbacks — The Original Async Pattern

```js
function fetchUser(id, callback) {
  setTimeout(() => {
    callback({ id, name: 'Alice' });
  }, 1000);
}

fetchUser(1, function(user) {
  console.log(user.name); // "Alice" after 1 second
});
```

Simple enough. But what happens when you need sequential async operations?

### Callback Hell

```js
fetchUser(1, function(user) {
  fetchPosts(user.id, function(posts) {
    fetchComments(posts[0].id, function(comments) {
      fetchReplies(comments[0].id, function(replies) {
        console.log(replies);
        // ...welcome to the pyramid of doom
      });
    });
  });
});
```

Problems with callbacks:
- **Pyramid of doom** — deeply nested, hard to read
- **Error handling** — each level needs its own error handling
- **Inversion of control** — you hand your continuation to someone else's function and hope they call it correctly

---

## Promises — A Better Way

A Promise is an object representing a value that may not exist yet. It has three states:

```
  ┌───────────┐       resolve(value)       ┌─────────────┐
  │  PENDING  │ ────────────────────────►  │  FULFILLED   │
  │           │                            │  (value)     │
  │  waiting  │                            └─────────────┘
  │  for      │
  │  result   │       reject(reason)       ┌─────────────┐
  │           │ ────────────────────────►  │  REJECTED    │
  └───────────┘                            │  (reason)    │
                                           └─────────────┘

  Once settled (fulfilled or rejected), a Promise NEVER changes state.
```

### Creating and Using Promises

```js
// Creating a Promise
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, name: 'Alice' });
      } else {
        reject(new Error('Invalid ID'));
      }
    }, 1000);
  });
}

// Using a Promise
fetchUser(1)
  .then(user => console.log(user.name))   // "Alice"
  .catch(err => console.error(err.message));
```

### Chaining — Flat, Not Nested

Each `.then()` returns a new Promise, so you can chain:

```js
// BEFORE (callback hell)
fetchUser(1, function(user) {
  fetchPosts(user.id, function(posts) {
    fetchComments(posts[0].id, function(comments) {
      console.log(comments);
    });
  });
});

// AFTER (Promise chain — flat and readable)
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(err => console.error(err)); // one catch handles ALL errors in the chain
```

**Without Promises**, error handling required checking errors at every level. With Promises, a single `.catch()` at the end catches any error thrown anywhere in the chain.

---

## Promise Combinators

### `Promise.all` — All must succeed

```js
const results = await Promise.all([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
]);
// If ANY one rejects, the whole thing rejects immediately
// Use when: you need ALL results and can't proceed without any of them
```

### `Promise.race` — First to settle wins

```js
const result = await Promise.race([
  fetch('/api/data'),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
]);
// Use when: implementing timeouts, or you just need the fastest response
```

### `Promise.allSettled` — Wait for all, never short-circuits

```js
const results = await Promise.allSettled([
  fetch('/api/users'),     // might fail
  fetch('/api/posts'),     // might fail
  fetch('/api/comments')   // might fail
]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('Success:', result.value);
  } else {
    console.log('Failed:', result.reason);
  }
});
// Use when: you want results from everything that succeeded, even if some failed
```

| Combinator | Short-circuits on | Use case |
|------------|------------------|----------|
| `Promise.all` | First rejection | Need ALL results |
| `Promise.race` | First settlement (either) | Timeout patterns, fastest response |
| `Promise.allSettled` | Never | Partial success is acceptable |

---

## async/await — Syntactic Sugar Over Promises

`async/await` doesn't replace Promises — it makes them look like synchronous code.

```js
// With .then() chains
function loadDashboard() {
  return fetchUser(1)
    .then(user => fetchPosts(user.id))
    .then(posts => fetchComments(posts[0].id))
    .then(comments => {
      console.log(comments);
      return comments;
    });
}

// With async/await — same thing, easier to read
async function loadDashboard() {
  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  console.log(comments);
  return comments;
}
```

**Without understanding that `await` is sugar**, you might think it blocks the thread. It doesn't. `await` pauses the `async` function and returns control to the event loop. Other code continues running. When the Promise resolves, the function resumes.

### Error Handling with async/await

```js
// try/catch replaces .catch()
async function loadDashboard() {
  try {
    const user = await fetchUser(1);
    const posts = await fetchPosts(user.id);
    return posts;
  } catch (err) {
    console.error('Something failed:', err.message);
  }
}
```

### Common Mistake: Sequential When You Mean Parallel

```js
// SLOW — sequential, each waits for the previous
async function loadPage() {
  const users = await fetch('/api/users');       // wait...
  const posts = await fetch('/api/posts');        // then wait...
  const comments = await fetch('/api/comments');  // then wait...
  return { users, posts, comments };
}
// Total time: user + posts + comments (e.g., 3 seconds)

// FAST — parallel, all start immediately
async function loadPage() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users'),
    fetch('/api/posts'),
    fetch('/api/comments')
  ]);
  return { users, posts, comments };
}
// Total time: max(users, posts, comments) (e.g., 1 second)
```

---

## A/B Summary

| Old way (A) | Modern way (B) |
|-------------|---------------|
| Nested callbacks (pyramid of doom) | Promise chains (flat) |
| Error handling at every level | Single `.catch()` at the end |
| `.then()` chains (still verbose) | `async/await` (reads like sync code) |
| Sequential `await` (slow) | `Promise.all` for parallel work |
| `setTimeout(fn, 0)` to "defer" | `queueMicrotask(fn)` for true next-tick |

---

## Key Takeaways

1. **JavaScript is single-threaded** — the event loop is how it handles async without blocking
2. **Microtasks (Promises) always run before macrotasks (setTimeout)** — this ordering matters
3. **Promises represent eventual values** — three states: pending, fulfilled, rejected. Once settled, immutable.
4. **Promise chains flatten callback hell** — and a single `.catch()` handles errors from the entire chain
5. **async/await is syntactic sugar over Promises** — it doesn't block the thread; it pauses the function and yields to the event loop
6. **Use `Promise.all` for parallel operations** — sequential `await` is a common performance mistake
