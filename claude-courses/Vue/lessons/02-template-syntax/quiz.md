# Lesson 2: Template Syntax — Quiz

## Q1
Which of these will work inside `{{ }}`? Which won't? Why?

```vue
A: {{ count + 1 }}
B: {{ if (count > 0) { return 'positive' } }}
C: {{ count > 0 ? 'positive' : 'zero' }}
D: {{ let x = count * 2 }}
E: {{ items.filter(i => i.active).length }}
```

---

## Q2
What's the difference between these two? When would you use each?

```vue
<p v-if="loading">Loading...</p>
<p v-show="loading">Loading...</p>
```

---

## Q3
Rewrite this event handler to use Vue modifiers instead of JavaScript:

```vue
<script setup>
function onSubmit(event) {
  event.preventDefault()
  event.stopPropagation()
  submitForm()
}
</script>

<template>
  <form @submit="onSubmit">...</form>
</template>
```

---

## Q4
What does the `:=` (v-bind with no attribute name) syntax do? What's the equivalent vanilla JS?

```vue
<div v-bind="{ id: 'app', class: 'container', 'data-theme': 'dark' }">
```

---

## Q5
Your teammate wrote `<div v-html="userComment"></div>` where `userComment` comes from a database of user-submitted content. What's the risk, and how would you fix it?
