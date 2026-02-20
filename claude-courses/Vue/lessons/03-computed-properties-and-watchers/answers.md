# Lesson 3: Computed Properties & Watchers — Answers

## Q1
This is a classic "watch doing computed's job." `fullName` is derived state — it's just a combination of two other values. Replace with a computed:
```js
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
```
The watcher approach is more code, adds an extra ref, runs asynchronously (next tick vs synchronous), and is harder to reason about. Computed is cached, synchronous, and declarative.

## Q2
Option B (computed) is better. The `.filter()` in Option A runs on every single re-render, even if `items` hasn't changed. The computed in Option B is cached — it only re-filters when `items` actually changes. With 10,000 items, this is a meaningful performance difference.

## Q3
`watch` requires you to explicitly specify what to watch and is lazy (doesn't run on setup). `watchEffect` auto-tracks all reactive dependencies used inside it and runs immediately. Use `watch` when you need old/new values, want to be explicit about dependencies, or want lazy execution. Use `watchEffect` when you have multiple dependencies and just want "run this whenever any dependency changes."

## Q4
No, it won't fire by default. `watch` on a ref is **shallow** — it only detects when `.value` itself is reassigned, not deep mutations. To detect `address.city` changing, add `{ deep: true }`:
```js
watch(user, callback, { deep: true })
```
Or watch the specific property:
```js
watch(() => user.value.address.city, (newCity) => { ... })
```

## Q5
Use `watch` with a debounce. Watchers are the right tool because fetching is a side effect, not derived state:
```js
const query = ref('')
let timeout

watch(query, (newQuery) => {
  clearTimeout(timeout)
  timeout = setTimeout(async () => {
    results.value = await searchAPI(newQuery)
  }, 500)
})
```
You could also use `watchEffect` with `onCleanup` for cleaner abort handling.
