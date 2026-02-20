# Lesson 3: Computed Properties & Watchers

## The Problem — Derived State and Side Effects

You have an author with articles. You want to show "has published good books" or "has not published good books". Where does this logic live?

**Without computed/watchers**, you'd either:
- Put complex logic in the template (messy, duplicated)
- Call a method every render (no caching, re-runs even when data hasn't changed)
- Manually track changes and update derived values (error-prone)

Vue gives you two tools: **computed** for derived state, **watch** for side effects.

---

## Computed Properties — Cached Derived State

A computed property recalculates **only when its dependencies change**:

```vue
<script setup>
import { ref, computed } from 'vue'

const author = ref({
  name: 'Alice',
  articles: ['Vue Basics', 'Reactivity Deep Dive']
})

// ✅ Computed — cached, only recalculates when articles change
const hasPublished = computed(() => {
  return author.value.articles.length > 0
})

// ❌ Method — runs every single render, even if articles didn't change
function hasPublishedMethod() {
  return author.value.articles.length > 0
}
</script>

<template>
  <!-- Both show the same result, but computed is cached -->
  <p>Computed: {{ hasPublished }}</p>
  <p>Method: {{ hasPublishedMethod() }}</p>
</template>
```

### Why Caching Matters

```
Template re-renders (e.g., unrelated state changes)
    │
    ├─ computed: "Did articles change? No → return cached value" ✅ fast
    │
    └─ method: "Run the function again" ❌ wasteful
```

For a simple `.length` check it doesn't matter. For filtering 10,000 items — it matters a lot.

### Writable Computed

By default, computed properties are read-only. But you can add a setter:

```js
const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (newValue) => {
    const [first, last] = newValue.split(' ')
    firstName.value = first
    lastName.value = last
  }
})

fullName.value = 'Jane Smith' // Updates both firstName and lastName
```

### Accessing Previous Value

```js
const count = ref(0)
const label = computed((previous) => {
  // previous is the last computed value
  return `Current: ${count.value}, Previous: ${previous}`
})
```

---

## Watchers — Reacting to Changes with Side Effects

Computed is for **deriving values**. Watch is for **doing things** when values change:

```vue
<script setup>
import { ref, watch } from 'vue'

const question = ref('')
const answer = ref('Ask a question...')

watch(question, async (newVal, oldVal) => {
  if (newVal.includes('?')) {
    answer.value = 'Thinking...'
    const res = await fetch('https://yesno.wtf/api')
    answer.value = (await res.json()).answer
  }
})
</script>
```

### Watch vs Computed — When to Use Which

| Use Case | Tool | Why |
|----------|------|-----|
| Derive a value from other values | `computed` | Cached, synchronous, declarative |
| Make an API call when data changes | `watch` | Side effect, async |
| Update the DOM manually | `watch` | Side effect |
| Log analytics on change | `watch` | Side effect |
| Filter/sort a list | `computed` | Derived data |

**Rule of thumb:** If the answer is "I need a new value" → `computed`. If it's "I need to do something" → `watch`.

### `watchEffect` — Auto-tracking Watch

`watchEffect` automatically tracks all reactive dependencies used inside it:

```js
// watch — you specify WHAT to watch
watch(url, () => {
  fetch(url.value)
})

// watchEffect — it figures out dependencies automatically
watchEffect(() => {
  fetch(url.value)  // url is automatically tracked
})
```

`watchEffect` runs immediately on setup. `watch` is lazy by default (only runs on change).

### Watch Options

```js
// Run immediately (not just on change)
watch(source, callback, { immediate: true })

// Watch nested objects deeply
watch(source, callback, { deep: true })

// Only fire once
watch(source, callback, { once: true })
```

---

## Key Takeaways

1. **Computed = derived state with caching** — recalculates only when dependencies change
2. **Watch = side effects on change** — API calls, logging, manual DOM updates
3. **Don't use watch to set another ref** — that's what computed is for
4. **`watchEffect` auto-tracks** dependencies — less boilerplate than `watch`
5. **Methods re-run every render** — prefer computed for expensive derivations

> **Playground:** `src/components/ComputedProperties.vue` shows computed caching, `src/components/Watchers.vue` shows async API calls in watchers.
