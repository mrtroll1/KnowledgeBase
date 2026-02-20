# Lesson 4: Bindings & List Rendering — Quiz

## Q1
What CSS classes will this div have when `isActive` is `true` and `hasError` is `false`?

```vue
<div class="base" :class="{ active: isActive, danger: hasError, 'font-bold': isActive && !hasError }">
```

---

## Q2
What's wrong with this list rendering? What bugs could it cause?

```vue
<input v-for="user in users" :placeholder="user.name" v-model="user.input" />
```

---

## Q3
Why does this code misbehave when you reorder the list?

```vue
<TransitionGroup name="fade">
  <li v-for="(item, index) in items" :key="index">{{ item.name }}</li>
</TransitionGroup>
```

---

## Q4
Rewrite this to follow Vue best practices:

```vue
<ul>
  <li v-for="task in tasks" v-if="!task.completed" :key="task.id">
    {{ task.title }}
  </li>
</ul>
```

---

## Q5
What's the difference between `:class="['a', 'b']"` and `:class="{ a: true, b: true }"`? When would you prefer one over the other?
