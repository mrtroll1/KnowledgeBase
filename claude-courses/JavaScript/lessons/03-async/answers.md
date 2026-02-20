# Lesson 3: Async JavaScript — Answers

## Q1

```
A
F
C
D
B
E
```

Step by step:
1. `console.log('A')` — synchronous, runs immediately.
2. `setTimeout(() => 'B', 0)` — schedules `'B'` as a **macrotask**.
3. First `Promise.resolve().then(...)` — schedules `'C'` as a **microtask**.
4. Second `Promise.resolve().then(...)` — schedules `'D'` (+ the setTimeout for `'E'`) as a **microtask**.
5. `console.log('F')` — synchronous, runs immediately.

Now the call stack is empty. Event loop drains microtasks:
6. `'C'` prints (first microtask).
7. `'D'` prints (second microtask), and schedules `'E'` as a new macrotask.

Microtask queue is empty. Event loop picks next macrotask:
8. `'B'` prints (first macrotask — it was queued before `'E'`).
9. `'E'` prints (second macrotask).

The key rule: ALL microtasks run between each macrotask. `C` and `D` (microtasks) run before `B` (macrotask), even though `B` was scheduled first.

## Q2

```
4
1
5
2
3
```

1. `console.log('4')` — synchronous.
2. `foo()` is called. Inside `foo`, `console.log('1')` runs synchronously.
3. `await Promise.resolve('2')` — pauses `foo` and returns control. Everything after `await` is essentially placed in a microtask queue.
4. Back in the outer code, `console.log('5')` runs.
5. Call stack is empty. Microtasks run: `foo` resumes, printing `'2'` then `'3'`.

The insight: `await` does NOT block the calling code. `foo()` pauses at the `await`, but execution continues past the `foo()` call. `'5'` prints before `'2'` because `await` yields to the event loop.

## Q3

The three fetches are **sequential** but **independent**. `posts` doesn't depend on the result of `user`, and `followers` doesn't depend on `posts`. Yet each one waits for the previous to complete.

This is unnecessary serialization. If each request takes 300ms, the total is ~900ms.

The fix — run them in parallel with `Promise.all`:

```js
async function loadUserProfile(userId) {
  const [user, posts, followers] = await Promise.all([
    fetch(`/api/users/${userId}`),
    fetch(`/api/users/${userId}/posts`),
    fetch(`/api/users/${userId}/followers`)
  ]);

  return { user, posts, followers };
}
```

Now total time is ~300ms (the slowest single request), not the sum of all three.

Use sequential `await` only when each step depends on the result of the previous one.

## Q4

```
first
```

A Promise can only settle once. After `resolve('first')`, the Promise is fulfilled. The second `resolve('second')` and the `reject('error')` are silently ignored — they don't throw or log anything; they simply have no effect.

`.then(val => console.log(val))` prints `"first"`. The `.catch()` never fires because the Promise was fulfilled, not rejected.

This is a safety feature of Promises: once settled (fulfilled or rejected), the state is immutable. No amount of calling `resolve` or `reject` again will change it.

## Q5

```
B: oops
C
D
```

1. `await Promise.reject('oops')` — the awaited Promise rejects, which throws inside the async function.
2. `catch (e)` catches it. `console.log('B:', e)` prints `"B: oops"`.
3. After the catch block, execution continues normally. `console.log('C')` prints `"C"`.
4. `bar()` returns a resolved Promise (the catch handled the error, so the async function completes normally). `.then(() => console.log('D'))` fires, printing `"D"`.

`'A: result'` never prints because the `await` threw before reaching that line. The catch block handles the error, and execution resumes after the try/catch — `'C'` still prints. The function resolves (not rejects) because the error was caught.
