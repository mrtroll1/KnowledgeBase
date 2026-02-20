# Lesson 5: Form Input Bindings — Quiz

## Q1
What's `v-model` actually shorthand for on a text input? Write the expanded version.

---

## Q2
You have 3 checkboxes bound to the same `v-model="skills"` where `skills = ref([])`. The user checks "Vue" and "React". What's the value of `skills`? What happens when they uncheck "Vue"?

---

## Q3
What's the difference between `v-model` and `v-model.lazy` on a text input? When would you use `.lazy`?

---

## Q4
Your form has a "quantity" field: `<input v-model="qty" type="number">`. The user types "5". What type is `qty`? How do you guarantee it's a number?

---

## Q5
Why does this NOT work for textarea?

```vue
<textarea>{{ message }}</textarea>
```

What should you use instead?
