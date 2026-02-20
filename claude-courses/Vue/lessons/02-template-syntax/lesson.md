# Lesson 2: Template Syntax

## The Problem — How Does Data Get to the DOM?

In vanilla JS, you manually wire data to the DOM:

```js
const name = 'Alice'
document.getElementById('greeting').textContent = `Hello, ${name}`
document.getElementById('link').setAttribute('href', url)
document.getElementById('btn').addEventListener('click', handler)
```

**Without Vue's template syntax**, every data → DOM connection is a manual `querySelector` + assignment. Add 50 dynamic elements and you're drowning in imperative DOM code.

**With Vue templates**, you declare bindings once and Vue keeps them in sync:

```vue
<template>
  <p>Hello, {{ name }}</p>
  <a :href="url">Link</a>
  <button @click="handler">Click</button>
</template>
```

---

## Text Interpolation — `{{ }}`

The double-mustache syntax renders reactive data as text:

```vue
<p>Message: {{ msg }}</p>
<p>Computed: {{ msg.split('').reverse().join('') }}</p>
```

You can use any **JavaScript expression** (not statements) inside `{{ }}`:

```vue
<!-- ✅ Expressions — these work -->
{{ number + 1 }}
{{ ok ? 'YES' : 'NO' }}
{{ message.split('').reverse().join('') }}

<!-- ❌ Statements — these DON'T work -->
{{ if (ok) { return message } }}
{{ let x = 1 }}
```

---

## Raw HTML — `v-html`

Mustaches render text, not HTML. Use `v-html` when you need to inject actual HTML:

```vue
<p>Text: {{ rawHtml }}</p>         <!-- shows <b>bold</b> as text -->
<p v-html="rawHtml"></p>           <!-- renders bold text -->
```

> **Warning:** Only use `v-html` with trusted content. User-supplied HTML = XSS vulnerability.

---

## Attribute Binding — `v-bind` / `:`

Dynamic attributes use `v-bind:attr` or the shorthand `:attr`:

```vue
<script setup>
const someId = ref('my-id')
const url = ref('https://vuejs.org')
const elementAttrs = ref({ id: 'container', class: 'wrapper' })
</script>

<template>
  <!-- Dynamic attribute -->
  <p :id="someId">Dynamic id</p>

  <!-- Same-name shorthand (Vue 3.4+) -->
  <p :id>Same as :id="id"</p>

  <!-- Spread all attributes from an object -->
  <div v-bind="elementAttrs">Gets id="container" class="wrapper"</div>

  <!-- Dynamic attribute NAME -->
  <a :[attrName]="url">Dynamic attribute name</a>
</template>
```

**Without `:attr`**, you'd have to use vanilla JS `setAttribute()` calls and manage updates manually.

---

## Event Handling — `v-on` / `@`

Listen to DOM events with `v-on:event` or the shorthand `@event`:

```vue
<script setup>
const count = ref(0)

function handleClick(event) {
  count.value++
}
</script>

<template>
  <!-- Inline handler -->
  <button @click="count++">Add 1</button>

  <!-- Method handler -->
  <button @click="handleClick">Add 1</button>

  <!-- With event modifiers -->
  <form @submit.prevent="onSubmit">Prevents page reload</form>
  <input @keyup.enter="submit" />
  <button @click.once="doOnce">Only fires once</button>
</template>
```

### Common Event Modifiers

| Modifier | Effect |
|----------|--------|
| `.prevent` | `event.preventDefault()` |
| `.stop` | `event.stopPropagation()` |
| `.once` | Handler fires only once |
| `.self` | Only trigger if target is the element itself |
| `.enter`, `.tab`, `.esc` | Key modifiers |

**Without modifiers**, you'd write `event.preventDefault()` and `event.stopPropagation()` inside every handler — noisy boilerplate.

---

## Conditional Rendering — `v-if` / `v-show`

```vue
<p v-if="score >= 90">Excellent!</p>
<p v-else-if="score >= 70">Good</p>
<p v-else>Keep trying</p>

<p v-show="isVisible">Always in DOM, toggled via CSS display</p>
```

| | `v-if` | `v-show` |
|---|--------|---------|
| Removes from DOM | ✅ | ❌ (just `display: none`) |
| Lazy (doesn't render until true) | ✅ | ❌ |
| Good for | Rarely toggled content | Frequently toggled content |
| Toggle cost | High (DOM insert/remove) | Low (CSS change) |

---

## Lifecycle Integration

Templates render after the component mounts. Use `onMounted` to run code after the DOM is available:

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('DOM is ready')
  // Safe to query DOM elements here
})
</script>
```

---

## Key Takeaways

1. **`{{ }}` for text**, `:attr` for attributes, `@event` for events — the three pillars
2. **Expressions only** in templates — no `if`, `for`, `let` statements
3. **Event modifiers** eliminate boilerplate (`@submit.prevent` > `e.preventDefault()`)
4. **`v-if` removes from DOM**, `v-show` hides with CSS — pick based on toggle frequency
5. **`v-html` is dangerous** with untrusted content — prefer text interpolation

> **Playground:** Open `src/components/TemplateSyntax.vue` to try dynamic attributes, event modifiers, and the spread binding pattern.
