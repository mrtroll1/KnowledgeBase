# Lesson 7: Composables — Answers

## Q1
Two bugs: (1) `width` and `height` are plain `let` variables, not `ref()` — changing them doesn't trigger reactive updates. (2) No cleanup — the resize listener is never removed, causing a memory leak. Fix:
```js
export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)
  useEventListener(window, 'resize', () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  })
  return { width, height }
}
```

## Q2
`toValue()` handles three input types: refs (unwraps `.value`), getter functions (calls them), and plain values (returns as-is). If someone passes a plain string `'/api/users'`, `url.value` would crash (undefined). `toValue(url)` gracefully returns the string. This makes the composable flexible — callers don't need to wrap everything in refs.

## Q3
During SSR (Server-Side Rendering), there's no `window` or `document`. Adding DOM listeners outside `onMounted` would crash on the server. `onMounted` only runs in the browser. Even without SSR, `onMounted` guarantees the component is in the DOM, and the paired `onUnmounted` ensures cleanup.

## Q4
**Name collision example:** Two mixins both define `data() { return { loading: true } }`. Vue silently merges them — one overwrites the other. In the template, `{{ loading }}` could be from either mixin. With composables: `const { loading: usersLoading } = useUsers()` and `const { loading: postsLoading } = usePosts()` — explicitly named, no collision possible.

## Q5
```js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const data = ref(stored !== null ? JSON.parse(stored) : defaultValue)

  watch(data, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  return data
}
```
Usage: `const theme = useLocalStorage('theme', 'light')`. Changing `theme.value` automatically persists to localStorage.
