# Lesson 10: TypeScript & Debugging — Quiz

## Q1
Convert this runtime props declaration to a type-based one with TypeScript:

```js
defineProps({
  title: { type: String, required: true },
  tags: { type: Array, default: () => [] },
  onClick: Function
})
```

---

## Q2
Your component isn't updating when you change `user.name`. How would you use `onRenderTriggered` to diagnose this?

---

## Q3
What's the TypeScript type of `count` here? What about `user`?

```ts
const count = ref(0)
const user = ref(null)
```

Why might the second one be a problem?

---

## Q4
Will this emit call compile? Why or why not?

```ts
const emit = defineEmits<{
  change: [value: number]
}>()

emit('change', '5')
```

---

## Q5
When would you use `onRenderTracked` vs `onRenderTriggered`? What's the difference?
