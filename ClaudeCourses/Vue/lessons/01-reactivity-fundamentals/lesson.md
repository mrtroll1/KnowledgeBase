# Lesson 1: Reactivity Fundamentals

## The Problem — Why Do We Need Reactivity?

Imagine you have a counter variable and a DOM element showing its value:

```js
let count = 0
document.getElementById('counter').textContent = count

// Later...
count = 1
// The DOM still shows 0! You have to manually update it:
document.getElementById('counter').textContent = count
```

**Without reactivity**, you'd have to:
- Manually track every variable that affects the UI
- Manually update every DOM element when data changes
- Remember which elements depend on which variables
- Build your own change detection system

**With Vue's reactivity**, you declare the relationship once and Vue handles the rest:

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <p>{{ count }}</p>  <!-- Automatically updates when count changes -->
</template>
```

---

## `ref()` — The Foundation

`ref()` wraps a value in a reactive container. In `<script>`, access via `.value`. In `<template>`, Vue auto-unwraps it.

```js
import { ref } from 'vue'

const count = ref(0)

console.log(count.value) // 0
count.value++
console.log(count.value) // 1
```

### Deep Reactivity

By default, `ref()` is **deeply reactive** — changes to nested objects trigger updates:

```js
const obj = ref({
  childObj: { count: 0 },
  childArr: ['el1', 'el2']
})

// ALL of these trigger a re-render:
obj.value.childObj.count++
obj.value.childArr.push('el3')
```

**Without deep reactivity**, you'd need to replace the entire object every time a nested property changes — like writing immutable Redux reducers for every tiny change.

---

## `shallowRef()` — When Deep Is Too Much

Sometimes you have a large object and only want to track top-level replacement, not deep mutations:

```js
import { ref, shallowRef } from 'vue'

const deep = ref({ nested: { count: 0 } })
deep.value.nested.count++  // ✅ triggers re-render

const shallow = shallowRef({ nested: { count: 0 } })
shallow.value.nested.count++  // ❌ does NOT trigger re-render
shallow.value = { nested: { count: 1 } }  // ✅ triggers re-render (top-level replacement)
```

**Use `shallowRef` when:**
- You have large objects where deep tracking is expensive
- You only care about the object being replaced, not mutated
- You're integrating with external libraries that manage their own state

---

## The Destructuring Trap

A common mistake — destructuring a reactive object **breaks reactivity**:

```js
const state = ref({ count: 0 })

// ❌ BAD — count is now a plain number, not reactive
let { count } = state.value
count++  // This does nothing to the UI

// ✅ GOOD — work with the ref directly
state.value.count++  // This triggers a re-render
```

Why? Destructuring copies the *value* at that moment. It's like taking a photo of someone — changing the photo doesn't change the person.

---

## `reactive()` vs `ref()` — Which One?

```js
import { ref, reactive } from 'vue'

// ref — wraps any value, access via .value
const count = ref(0)
count.value++

// reactive — wraps objects only, no .value needed
const state = reactive({ count: 0 })
state.count++
```

| | `ref()` | `reactive()` |
|---|---------|-------------|
| Works with primitives | ✅ | ❌ |
| Needs `.value` in script | ✅ | ❌ |
| Can be reassigned | ✅ (`ref.value = newObj`) | ❌ (loses reactivity) |
| Deep by default | ✅ | ✅ |

**The Vue team recommends `ref()` as the default.** It's more flexible and consistent — you always know you're dealing with a reactive wrapper.

---

## Key Takeaways

1. **`ref()` is your go-to** — works with any value, deeply reactive by default
2. **Access `.value` in script**, auto-unwrapped in templates
3. **Don't destructure reactive state** — you'll break the reactivity link
4. **Use `shallowRef()` for performance** when you don't need deep tracking
5. **Prefer `ref()` over `reactive()`** — it's the recommended convention

> **Playground:** Open `src/components/ReactivityFundamentals.vue` to experiment with deep vs shallow reactivity and see the destructuring trap in action.
