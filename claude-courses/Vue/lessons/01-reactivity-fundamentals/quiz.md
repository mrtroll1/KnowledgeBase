# Lesson 1: Reactivity Fundamentals — Quiz

## Q1
What's wrong with this code? Why won't the template update?

```vue
<script setup>
import { ref } from 'vue'
const user = ref({ name: 'Alice', age: 25 })
let { name } = user.value
name = 'Bob'
</script>

<template>
  <p>{{ user.name }}</p>
</template>
```

---

## Q2
You have a large list of 10,000 items that gets replaced entirely on each API call (never mutated in place). Which is more appropriate — `ref()` or `shallowRef()`? Why?

---

## Q3
What's the output of this code?

```js
import { ref } from 'vue'

const count = ref(0)
const copy = count
copy.value = 5

console.log(count.value)
```

---

## Q4
Your colleague wrote this and complains that clicking the button doesn't update the UI:

```vue
<script setup>
import { reactive } from 'vue'
let state = reactive({ count: 0 })

function reset() {
  state = reactive({ count: 0 })
}
</script>

<template>
  <p>{{ state.count }}</p>
  <button @click="state.count++">+</button>
  <button @click="reset">Reset</button>
</template>
```

The increment works, but reset doesn't. Why?

---

## Q5
When should you use `reactive()` instead of `ref()`? Is there a case where `reactive()` is genuinely better?
