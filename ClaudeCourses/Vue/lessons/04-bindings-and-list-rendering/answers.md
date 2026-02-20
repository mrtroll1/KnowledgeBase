# Lesson 4: Bindings & List Rendering — Answers

## Q1
Classes: `base active font-bold`. Static `class="base"` always applies. `:class` adds `active` (isActive is true), skips `danger` (hasError is false), adds `font-bold` (true && !false = true). Static and dynamic classes merge.

## Q2
Missing `:key`. Without a key, Vue reuses DOM elements by array position. If users get reordered or filtered, the input values will stick to the *position*, not the *user* — so user A's input appears next to user B's name. Fix: `<input v-for="user in users" :key="user.id" ...>`.

## Q3
Using `index` as key. When items reorder, index 0 is still index 0 — Vue thinks nothing moved and reuses DOM elements in place. Transitions won't animate because from Vue's perspective, no element moved. Fix: use a stable identifier like `item.id` as the key.

## Q4
```vue
<script setup>
const incompleteTasks = computed(() => tasks.value.filter(t => !t.completed))
</script>

<template>
  <ul>
    <li v-for="task in incompleteTasks" :key="task.id">
      {{ task.title }}
    </li>
  </ul>
</template>
```
`v-if` has higher priority than `v-for` in Vue 3, so `task` isn't available when `v-if` evaluates. Even if it worked, filtering in the template re-runs every render. Computed caches the filtered list.

## Q5
Array syntax always applies all classes in the array. Object syntax conditionally applies classes based on boolean values. Use array when classes are always present or when mixing static/dynamic: `:class="['always-on', { conditional: isTrue }]"`. Use object when most classes are conditional toggles. They can be combined — arrays can contain objects.
