# Lesson 5: Form Input Bindings

## The Problem — Two-Way Data Flow

In vanilla JS, keeping an input's value in sync with a variable is tedious:

```js
const input = document.getElementById('name')
input.value = name                          // JS → DOM
input.addEventListener('input', (e) => {    // DOM → JS
  name = e.target.value
})
```

**Without `v-model`**, you'd write this for every single form field. 10 fields = 20 bindings (value + listener for each).

**With `v-model`**, one directive handles both directions:

```vue
<input v-model="name" />
<!-- Equivalent to: -->
<input :value="name" @input="name = $event.target.value" />
```

---

## Text Inputs

```vue
<script setup>
import { ref } from 'vue'
const message = ref('')
</script>

<template>
  <input v-model="message" placeholder="type here" />
  <p>You typed: {{ message }}</p>

  <!-- Textarea works the same way -->
  <textarea v-model="message"></textarea>
  <!-- Note: <textarea>{{ message }}</textarea> does NOT work — use v-model -->
</template>
```

### Modifiers

```vue
<!-- .lazy: sync on 'change' instead of 'input' (on blur, not every keystroke) -->
<input v-model.lazy="message" />

<!-- .number: auto-cast to number -->
<input v-model.number="age" type="number" />

<!-- .trim: strip whitespace -->
<input v-model.trim="name" />
```

---

## Checkboxes

### Single checkbox → boolean

```vue
<input type="checkbox" v-model="agreed" />
<!-- agreed is true/false -->
```

### Multiple checkboxes → array

```vue
<script setup>
const selectedServices = ref([])
</script>

<template>
  <input type="checkbox" value="Massage" v-model="selectedServices" />
  <input type="checkbox" value="Sauna" v-model="selectedServices" />
  <input type="checkbox" value="Pool" v-model="selectedServices" />
  <p>Selected: {{ selectedServices }}</p>
  <!-- e.g., ["Massage", "Pool"] -->
</template>
```

The key: when `v-model` binds to an **array**, checkboxes push/remove their `value` from that array.

---

## Radio Buttons

```vue
<script setup>
const picked = ref('')
</script>

<template>
  <input type="radio" value="one" v-model="picked" />
  <input type="radio" value="two" v-model="picked" />
  <p>Picked: {{ picked }}</p>
</template>
```

All radios with the same `v-model` form a group — selecting one deselects others.

---

## Select Dropdowns

```vue
<script setup>
const selected = ref('')
</script>

<template>
  <select v-model="selected">
    <option disabled value="">Please select</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
</template>
```

### Multiple Select → array

```vue
<select v-model="selectedMultiple" multiple>
  <option>A</option>
  <option>B</option>
</select>
<!-- selectedMultiple is an array -->
```

---

## Dynamic Values with `v-bind`

By default, checkbox/radio values are strings. Use `:value` for dynamic values:

```vue
<input type="checkbox" :true-value="1" :false-value="0" v-model="toggle" />
<!-- toggle is 1 or 0, not true/false -->

<input type="radio" :value="{ id: 1, name: 'Option A' }" v-model="picked" />
<!-- picked is the entire object -->
```

---

## `v-model` Summary Table

| Input Type | `v-model` binds to | Value type |
|-----------|-------------------|-----------|
| `<input type="text">` | `value` + `input` event | string |
| `<textarea>` | `value` + `input` event | string |
| `<input type="checkbox">` (single) | `checked` | boolean |
| `<input type="checkbox">` (array) | `checked` + `value` | array |
| `<input type="radio">` | `checked` + `value` | string/any |
| `<select>` | `value` + `change` event | string/any |
| `<select multiple>` | `value` + `change` event | array |

---

## Key Takeaways

1. **`v-model` = `:value` + `@input`** — it's syntactic sugar for two-way binding
2. **Checkboxes with array** `v-model` push/remove values automatically
3. **Modifiers** `.lazy`, `.number`, `.trim` save common boilerplate
4. **Use `:value`** to bind non-string values (objects, numbers)
5. **`v-model` on `<textarea>`** — don't use mustache interpolation inside the tag

> **Playground:** Open `src/components/FormInputBindings.vue` to experiment with text, checkbox, and select bindings.
