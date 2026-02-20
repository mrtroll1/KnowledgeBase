# Lesson 7: Composables — Quiz

## Q1
You see this in a codebase. What's the bug?

```js
export function useWindowSize() {
  let width = window.innerWidth
  let height = window.innerHeight

  window.addEventListener('resize', () => {
    width = window.innerWidth
    height = window.innerHeight
  })

  return { width, height }
}
```

---

## Q2
Why does `useFetch` use `toValue(url)` instead of just `url.value`? What happens if someone passes a plain string?

---

## Q3
Your composable adds a `scroll` listener in `onMounted`. Your colleague says "why not just add it immediately, outside `onMounted`?" What's the risk?

---

## Q4
What's the advantage of composables over Vue 2 mixins? Give a concrete example of a problem mixins had that composables solve.

---

## Q5
Write a composable `useLocalStorage(key, defaultValue)` that syncs a ref with localStorage. It should read the initial value from localStorage and write back on changes.
