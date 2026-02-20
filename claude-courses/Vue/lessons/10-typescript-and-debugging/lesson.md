# Lesson 10: TypeScript & Debugging

## Part 1: TypeScript in Vue

### The Problem — Types in Components

Vue components pass props, emit events, and manage state. Without TypeScript, a wrong prop type silently fails at runtime:

```vue
<!-- Parent passes a string, child expects a number -->
<PriceTag :price="'free'" />  <!-- Runtime bug, no warning until it breaks -->
```

**With TypeScript**, the compiler catches this before you even run the app.

---

### Type-Based Props with `defineProps<T>()`

```vue
<script setup lang="ts">
interface Props {
  msg: string
  labels?: string[]    // optional
  count: number
}

// Type-based declaration — compile-time checking
const { msg, labels = ['default'], count } = defineProps<Props>()
</script>
```

**Without TypeScript props:**
```js
// Runtime-only validation — errors show in console, not editor
defineProps({
  msg: { type: String, required: true },
  labels: { type: Array, default: () => ['default'] },
  count: { type: Number, required: true }
})
```

| Feature | Runtime Props | Type-Based Props |
|---------|-------------|-----------------|
| Error detection | Runtime (console) | Compile-time (editor) |
| Autocomplete | ❌ Limited | ✅ Full IntelliSense |
| Complex types | ❌ Can't express unions/generics | ✅ Full TypeScript |
| Default values | `default` option | Destructuring defaults |

### Typed Emits

```vue
<script setup lang="ts">
const emit = defineEmits<{
  update: [id: number, value: string]
  delete: [id: number]
}>()

emit('update', 1, 'new value')  // ✅ Type-checked
emit('update', '1', 'value')    // ❌ Error: string not assignable to number
</script>
```

### Typed Refs

```ts
const count = ref(0)                    // inferred as Ref<number>
const user = ref<User | null>(null)     // explicit type for complex/nullable
```

### Typed Computed

```ts
const double = computed(() => count.value * 2)  // inferred as ComputedRef<number>
const items = computed<Item[]>(() => ...)        // explicit when needed
```

---

## Part 2: Debugging Vue Apps

### Vue DevTools

Install the Vue DevTools browser extension. It gives you:
- Component tree inspection
- Reactive state viewer/editor
- Event timeline
- Performance profiling

### Reactivity Debugging Hooks

```vue
<script setup>
import { onRenderTracked, onRenderTriggered } from 'vue'

// Fires when a reactive dependency is TRACKED (during render)
onRenderTracked((event) => {
  console.log('Tracked:', event)
  // { effect, target, type, key }
})

// Fires when a reactive dependency TRIGGERS a re-render
onRenderTriggered((event) => {
  console.log('Triggered:', event)
  debugger  // Pause here to inspect what caused the re-render
})
</script>
```

### Common Debugging Patterns

**"Why isn't my component updating?"**
1. Check if the data is actually reactive (`ref` or `reactive`, not a plain variable)
2. Check for the destructuring trap (did you break reactivity?)
3. Check `onRenderTriggered` to see what triggers re-renders

**"Why is my component re-rendering too often?"**
1. Use `onRenderTracked` to see all tracked dependencies
2. Check if you're creating new objects/arrays in computed (breaks reference equality)
3. Use `shallowRef` for large data structures

**"My watcher isn't firing"**
1. Is it watching the right source? `watch(ref)` not `watch(ref.value)`
2. For nested changes, do you need `{ deep: true }`?
3. Did you use `watchEffect` (runs immediately) vs `watch` (lazy)?

---

## Key Takeaways

1. **`defineProps<T>()`** gives compile-time type checking and editor autocomplete
2. **Destructuring with defaults** replaces the `default` option in type-based props
3. **Typed emits** prevent mismatched event payloads
4. **`onRenderTracked/Triggered`** help diagnose reactivity issues
5. **Vue DevTools** is essential — install it first, debug second

> **Playground:** `src/components/TypeScript.vue` shows type-based props. `src/components/Debugging.vue` demonstrates render tracking hooks.
