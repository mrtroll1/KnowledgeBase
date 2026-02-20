# Lesson 4: Bindings & List Rendering

## The Problem — Dynamic Styling and Lists

How do you toggle a CSS class based on state? How do you render a list that changes?

**Without Vue**, you'd write:
```js
if (isActive) el.classList.add('active')
else el.classList.remove('active')

items.forEach(item => {
  const li = document.createElement('li')
  li.textContent = item
  list.appendChild(li)
})
// And then manually sync when items change...
```

**With Vue**, bindings and `v-for` handle it declaratively.

---

## Dynamic Class Binding

### Object Syntax — toggle classes based on booleans

```vue
<script setup>
import { ref, computed } from 'vue'
const isActive = ref(true)
const hasError = ref(false)
</script>

<template>
  <!-- Object syntax: key = class name, value = boolean -->
  <div :class="{ active: isActive, 'text-danger': hasError }">
    Gets class="active" when isActive is true
  </div>
</template>
```

### Computed Class Object — for complex logic

```js
const classObject = computed(() => ({
  active: isActive.value,
  'text-danger': hasError.value && !isActive.value
}))
```
```vue
<div :class="classObject">Computed classes</div>
```

### Array Syntax — always apply, optionally toggle

```vue
<div :class="['base-class', isActive ? 'active' : '']">
  Always has base-class, conditionally has active
</div>
```

---

## Dynamic Style Binding

```vue
<script setup>
const color = ref('red')
const fontSize = ref(14)
</script>

<template>
  <!-- Object syntax with camelCase or kebab-case -->
  <p :style="{ color, fontSize: fontSize + 'px' }">Dynamic style</p>

  <!-- Shorthand: { color } is the same as { color: color } -->
  <p :style="{ color }">Shorthand works</p>
</template>
```

Static `style` and `:style` merge — static styles aren't overwritten:
```vue
<p style="font-weight: bold" :style="{ color }">Both apply</p>
```

---

## List Rendering — `v-for`

### Arrays

```vue
<li v-for="item in items">{{ item }}</li>

<!-- With index -->
<li v-for="(item, index) in items">{{ index }}: {{ item }}</li>
```

### Objects

```vue
<!-- (value, key, index) -->
<li v-for="(value, key, index) in myObject">
  {{ index }}. {{ key }}: {{ value }}
</li>
```

### Ranges

```vue
<!-- 1 through 10 (starts at 1, not 0) -->
<p v-for="n in 10">{{ n }}</p>
```

### The `:key` Rule

**Always use `:key` with `v-for`** for items that can change:

```vue
<!-- ❌ Without key — Vue reuses DOM elements by position -->
<li v-for="item in items">{{ item.name }}</li>

<!-- ✅ With key — Vue tracks each item by identity -->
<li v-for="item in items" :key="item.id">{{ item.name }}</li>
```

**Without `:key`**, when you insert an item at the beginning, Vue doesn't move existing elements — it patches them in place. This breaks component state, transitions, and input focus.

### `v-for` with `v-if`

Never use `v-if` on the same element as `v-for`. `v-if` has higher priority and won't have access to the loop variable:

```vue
<!-- ❌ BAD — v-if can't see 'item' -->
<li v-for="item in items" v-if="item.active">{{ item.name }}</li>

<!-- ✅ GOOD — use computed to filter first -->
<script setup>
const activeItems = computed(() => items.value.filter(i => i.active))
</script>
<li v-for="item in activeItems" :key="item.id">{{ item.name }}</li>
```

---

## Array Mutation Methods

Vue detects these array mutations and updates the DOM:

```js
items.value.push('new')      // ✅ tracked
items.value.splice(1, 1)     // ✅ tracked
items.value.sort()            // ✅ tracked
items.value[0] = 'replaced'  // ✅ tracked (Vue 3 — was broken in Vue 2)
```

---

## Key Takeaways

1. **`:class` with objects** for conditional classes — cleaner than ternaries in class strings
2. **`:style` merges** with static `style` — they don't conflict
3. **Always use `:key`** with `v-for` — prevents subtle bugs with reordering
4. **Never `v-for` + `v-if` on same element** — filter with computed instead
5. **`v-for` works on arrays, objects, and ranges** — `(value, key, index)` for objects

> **Playground:** `src/components/ClassAndStyleBindings.vue` and `src/components/ListRendering.vue`
