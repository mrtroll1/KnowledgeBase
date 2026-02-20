# Lesson 7: Composables

## The Problem — Reusable Stateful Logic

You need mouse tracking in 3 different components. Without composables:

```vue
<!-- Component A — copy paste this to B and C -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const x = ref(0)
const y = ref(0)
function update(e) { x.value = e.pageX; y.value = e.pageY }
onMounted(() => window.addEventListener('mousemove', update))
onUnmounted(() => window.removeEventListener('mousemove', update))
</script>
```

**Without composables**, you'd copy-paste this into every component. Change the logic once? Update it in 3 places. Miss one? Bug.

**With a composable**, extract it once, import everywhere:

```js
// composables/mouse.js
import { ref } from 'vue'
import { useEventListener } from './event.js'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)
  useEventListener(window, 'mousemove', (e) => {
    x.value = e.pageX
    y.value = e.pageY
  })
  return { x, y }
}
```

```vue
<script setup>
import { useMouse } from '../composables/mouse.js'
const { x, y } = useMouse()
</script>
<template>Mouse: {{ x }}, {{ y }}</template>
```

---

## What Is a Composable?

A composable is a function that:
1. **Starts with `use`** (convention: `useMouse`, `useFetch`, `useAuth`)
2. **Uses Vue Composition API** inside (ref, computed, watch, lifecycle hooks)
3. **Returns reactive state** that components consume
4. **Encapsulates and reuses** stateful logic

Think of composables as **React hooks' Vue equivalent** — but without the strict ordering rules.

---

## Building a Composable — Step by Step

### 1. Event Listener Composable (foundational)

```js
// composables/event.js
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, callback) {
  onMounted(() => target.addEventListener(event, callback))
  onUnmounted(() => target.removeEventListener(event, callback))
}
```

**Without this**, every component that adds event listeners needs its own `onMounted`/`onUnmounted` cleanup pair. Forget the cleanup? Memory leak.

### 2. Fetch Composable (async data)

```js
// composables/fetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  const fetchData = () => {
    data.value = null
    error.value = null
    fetch(toValue(url))                   // toValue() unwraps refs and calls getters
      .then(res => res.json())
      .then(json => data.value = json)
      .catch(err => error.value = err)
  }

  watchEffect(() => {
    fetchData()                           // Re-fetches when url changes
  })

  return { data, error }
}
```

```vue
<script setup>
import { ref } from 'vue'
import { useFetch } from '../composables/fetch.js'

const url = ref('/api/users')
const { data, error } = useFetch(url)

// Change the URL → automatically re-fetches
url.value = '/api/posts'
</script>
```

### 3. Composables Composing Composables

The `useMouse` composable reuses `useEventListener` — composables can build on each other:

```
useMouse()
  └── useEventListener(window, 'mousemove', ...)
        └── onMounted / onUnmounted
```

This is the power of composition — small, focused pieces that combine into complex behavior.

---

## `toValue()` — Handling Refs, Getters, and Plain Values

When a composable accepts input that might be a ref, a getter function, or a plain value:

```js
import { toValue } from 'vue'

// toValue() handles all three:
toValue(ref('hello'))      // 'hello' (unwraps ref)
toValue(() => 'hello')     // 'hello' (calls getter)
toValue('hello')           // 'hello' (returns as-is)
```

Use `toValue()` in composables to accept flexible input types.

---

## Composable vs Mixin — Why Composables Win

Vue 2 used mixins for logic reuse. They had serious problems:

| Problem | Mixin | Composable |
|---------|-------|-----------|
| Name collisions | ❌ Silent override | ✅ Explicit destructuring |
| Unclear data source | ❌ "Where does `this.x` come from?" | ✅ `const { x } = useMouse()` |
| Implicit dependencies | ❌ Mixins depend on each other | ✅ Explicit imports |
| TypeScript support | ❌ Poor | ✅ Full inference |

---

## Custom Directives (Bonus)

For direct DOM access, Vue supports custom directives:

```js
// In main.js or component
const vFocus = {
  mounted: (el) => el.focus()
}

const vHighlight = {
  mounted: (el) => el.classList.add('is-highlight')
}
```

```vue
<input v-focus />
<p v-highlight>Highlighted text</p>
```

Directives are for low-level DOM manipulation. For most cases, composables are the better abstraction.

---

## Key Takeaways

1. **Composables extract reusable stateful logic** — name them `useXxx`
2. **They return reactive state** — components stay clean
3. **Composables compose** — `useMouse` can use `useEventListener`
4. **`toValue()`** makes composables flexible (accept refs, getters, or values)
5. **Composables replace mixins** — explicit, type-safe, no name collisions

> **Playground:** `src/components/Composables.vue` uses `useMouse` and `useFetch`. Check `src/composables/` for the implementations.
