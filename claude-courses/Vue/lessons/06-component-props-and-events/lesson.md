# Lesson 6: Component Props, Events & Slots

## The Problem — Components Need to Communicate

You've split your app into components. Now `Parent` needs to pass data to `Child`, and `Child` needs to notify `Parent` when something happens.

**Without a clear communication pattern**, you'd reach for global variables, DOM events, or direct parent/child references — all fragile and hard to debug.

Vue gives you three clean patterns:
- **Props** — parent → child data (downward)
- **Events** — child → parent notifications (upward)
- **Slots** — parent → child template content (content injection)

---

## Props — Parent Passes Data Down

### Basic Declaration

```vue
<!-- Child.vue -->
<script setup>
const props = defineProps({
  title: String,
  count: {
    type: Number,
    required: true
  },
  items: {
    type: Array,
    default: () => []         // ⚠️ Objects/arrays MUST use factory function
  },
  status: {
    type: String,
    validator: (value) => ['active', 'inactive'].includes(value)
  }
})
</script>
```

```vue
<!-- Parent.vue -->
<Child title="Hello" :count="42" :items="myList" status="active" />
```

### Key Rules

1. **Props are read-only** — never mutate a prop in the child
2. **Objects/arrays need factory defaults** — `default: () => []` not `default: []`
3. **kebab-case in template, camelCase in JS** — `:my-prop` → `myProp`

**Without prop validation**, a typo in a prop name silently fails. With validation, you get console warnings in development.

---

## Events — Child Notifies Parent

```vue
<!-- Child.vue -->
<script setup>
const emit = defineEmits(['update', 'delete'])

function handleClick() {
  emit('update', { id: 1, value: 'new' })  // emit with payload
}
</script>

<template>
  <button @click="handleClick">Update</button>
  <button @click="$emit('delete', id)">Delete</button>
</template>
```

```vue
<!-- Parent.vue -->
<Child @update="handleUpdate" @delete="handleDelete" />
```

**Without `defineEmits`**, events still work but you lose documentation and validation of what events a component emits.

---

## `v-model` on Components — Two-Way Binding

`v-model` on a component is sugar for a prop + event pair:

```vue
<!-- Parent.vue -->
<Child v-model="count" />
<!-- Equivalent to: -->
<Child :modelValue="count" @update:modelValue="count = $event" />
```

```vue
<!-- Child.vue -->
<script setup>
const model = defineModel()  // creates the prop + event automatically
</script>

<template>
  <button @click="model++">{{ model }}</button>
</template>
```

### Named Models & Modifiers

```vue
<!-- Parent.vue -->
<Child v-model:title.capitalize="pageTitle" />
```

```vue
<!-- Child.vue -->
<script setup>
const [title, modifiers] = defineModel('title', {
  set(value) {
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  }
})
</script>
```

---

## Slots — Parent Injects Content

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <header v-if="$slots.header">
      <slot name="header"></slot>
    </header>
    <main>
      <slot>Default content if nothing provided</slot>
    </main>
    <footer>
      <slot name="footer" :count="items.length"></slot>
    </footer>
  </div>
</template>
```

```vue
<!-- Parent.vue -->
<Card>
  <template #header>
    <h2>My Card Title</h2>
  </template>

  <p>This goes in the default slot</p>

  <template #footer="{ count }">
    <p>{{ count }} items</p>  <!-- Slot props: child passes data back -->
  </template>
</Card>
```

### Slot Props — Child Passes Data to Parent's Template

The `<slot :count="items.length">` pattern lets the child expose data that the parent's template can use. Think of it as: "here's the template (parent), here's the data for it (child)."

---

## Provide / Inject — Skip the Prop Drilling

When data needs to go from grandparent → deeply nested child, passing through every intermediate component is tedious:

```
App → Layout → Sidebar → Menu → MenuItem (needs theme from App)
```

```vue
<!-- App.vue (ancestor) -->
<script setup>
import { provide, ref } from 'vue'
const theme = ref('dark')
provide('theme', theme)  // Any descendant can access this
</script>
```

```vue
<!-- MenuItem.vue (deep descendant) -->
<script setup>
import { inject } from 'vue'
const theme = inject('theme', 'light')  // 'light' is fallback default
</script>
```

**Use provide/inject for:** app-wide config (theme, locale, current user), not for regular parent-child data flow. For direct parent-child, props are clearer.

---

## Key Takeaways

1. **Props down, events up** — the fundamental communication pattern
2. **`defineModel()`** simplifies two-way binding between parent and child
3. **Slots** let parents inject template content — with slot props for data flow back
4. **Provide/inject** for deep hierarchies — avoids prop drilling
5. **`$slots.name`** to conditionally render slot wrappers

> **Playground:** `src/components/Props.vue` covers props, emits, defineModel, slots, and slot props. `src/components/DeepChild.vue` shows provide/inject.
