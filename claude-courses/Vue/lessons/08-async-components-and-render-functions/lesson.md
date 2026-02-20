# Lesson 8: Async Components & Render Functions

## The Problem — Large Bundles and Template Limits

Two separate problems, one lesson:

1. **Bundle size:** Your app has 50 components. Loading them all upfront means a massive initial download — even for pages the user may never visit.

2. **Template limits:** Sometimes you need to generate elements programmatically (e.g., a dynamic heading `h1`-`h6` based on a prop). Templates can't do this without ugly `v-if` chains.

---

## Async Components — Load on Demand

### Basic Usage

```js
import { defineAsyncComponent } from 'vue'

// Only downloads AdminPanel.vue when it's actually rendered
const AdminPanel = defineAsyncComponent(() =>
  import('./components/AdminPanel.vue')
)
```

```vue
<template>
  <AdminPanel v-if="isAdmin" />
  <!-- Component JS is only fetched when isAdmin becomes true -->
</template>
```

**Without async components**, `AdminPanel` is bundled with the main app — every user downloads admin code even if they're not an admin.

### With Loading & Error States

```js
const AdminPanel = defineAsyncComponent({
  loader: () => import('./AdminPanel.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,          // Show loading after 200ms (avoids flash)
  timeout: 10000       // Error after 10 seconds
})
```

### When to Use Async Components

| Scenario | Use Async? |
|----------|-----------|
| Admin-only panels | ✅ Most users never need it |
| Below-the-fold content | ✅ Load when scrolled into view |
| Modal dialogs | ✅ Load when opened |
| Navigation header | ❌ Shown immediately on every page |
| Core layout components | ❌ Needed for initial render |

---

## Render Functions — Templates Without Templates

### The `h()` Function

`h()` (hyperscript) creates virtual DOM nodes programmatically:

```js
import { h, ref } from 'vue'

export default {
  props: { level: Number },
  setup(props, { slots }) {
    return () => h(
      `h${props.level}`,        // tag: 'h1', 'h2', etc.
      { class: 'heading' },     // attributes
      slots.default()            // children
    )
  }
}
```

```vue
<!-- Usage -->
<DynamicHeading :level="2">Hello World</DynamicHeading>
<!-- Renders: <h2 class="heading">Hello World</h2> -->
```

**Without render functions**, you'd need:
```vue
<h1 v-if="level === 1"><slot /></h1>
<h2 v-else-if="level === 2"><slot /></h2>
<h3 v-else-if="level === 3"><slot /></h3>
<!-- ... 6 v-if blocks for a simple pattern -->
```

### `h()` Signature

```js
h(
  tag,       // String ('div'), component, or Fragment
  props,     // Object with attributes, event handlers, etc.
  children   // String, array of vnodes, or slots
)
```

### Events in Render Functions

```js
h('button', {
  onClick: (event) => { count.value++ },
  class: 'btn'
}, `Clicked ${count.value} times`)
```

Event handlers use `onXxx` format: `onClick`, `onMouseenter`, `onKeyup`.

### When to Use Render Functions

| Scenario | Template | Render Function |
|----------|---------|----------------|
| Regular UI | ✅ Readable, declarative | Overkill |
| Dynamic tag/component | Awkward with `v-if` | ✅ Clean |
| Programmatic generation | ❌ Can't loop to create varying structures | ✅ Full JS power |
| Component libraries | Limited flexibility | ✅ Maximum control |

**Rule of thumb:** Use templates for 95% of components. Use render functions when templates feel like they're fighting you.

---

## Key Takeaways

1. **Async components** split your bundle — load expensive components only when needed
2. **`defineAsyncComponent`** supports loading/error states and timeouts
3. **`h()` creates vnodes** — full programmatic control over rendering
4. **Render functions** solve dynamic tag/structure problems that templates can't
5. **Templates are preferred** — render functions are an escape hatch, not the default

> **Playground:** `src/components/AsyncComponents.vue` is a simple component loaded asynchronously. `src/components/RenderFunctions.vue` shows `h()` with props and events.
