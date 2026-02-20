# Lesson 3: Computed Properties & Watchers — Quiz

## Q1
Your colleague uses a watcher to keep `fullName` in sync. What's wrong with this approach?

```js
const firstName = ref('John')
const lastName = ref('Doe')
const fullName = ref('')

watch([firstName, lastName], () => {
  fullName.value = `${firstName.value} ${lastName.value}`
}, { immediate: true })
```

---

## Q2
You have an expensive filtering operation. Which approach is better and why?

```vue
<!-- Option A -->
<li v-for="item in items.filter(i => i.price > 100)">{{ item.name }}</li>

<!-- Option B -->
<script setup>
const expensiveItems = computed(() => items.value.filter(i => i.price > 100))
</script>
<li v-for="item in expensiveItems">{{ item.name }}</li>
```

---

## Q3
What's the difference between `watch` and `watchEffect`? When would you prefer one over the other?

---

## Q4
Will this watcher fire when `user.address.city` changes? Why or why not?

```js
const user = ref({ name: 'Alice', address: { city: 'Paris' } })

watch(user, (newVal) => {
  console.log('User changed:', newVal)
})

user.value.address.city = 'London'
```

---

## Q5
You need to fetch search results 500ms after the user stops typing. Which Vue tool would you use and how would you structure it?
