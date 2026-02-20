# Lesson 1: Reactivity Fundamentals — Answers

## Q1
Destructuring breaks reactivity. `let { name } = user.value` copies the string `'Alice'` into a plain variable — it's no longer connected to the ref. Reassigning `name = 'Bob'` changes a local variable, not the reactive state. Fix: `user.value.name = 'Bob'`.

## Q2
`shallowRef()` is the better choice. Since you never mutate individual items (the whole list gets replaced), you don't need deep tracking on 10,000 items. `shallowRef` only reacts to `.value` being reassigned, which is exactly your pattern. Deep reactivity would waste effort setting up proxy traps on every item.

## Q3
Output: `5`. `const copy = count` doesn't copy the value — it copies the *reference* to the same ref object. Both `count` and `copy` point to the same reactive container. Changing `copy.value` changes `count.value` because they're the same ref.

## Q4
Reassigning `state` breaks the reactive connection. The template is still bound to the *original* reactive object. When you do `state = reactive({ count: 0 })`, you create a new reactive object, but the template doesn't know about it — it's still watching the old one. Fix: reset properties individually (`state.count = 0`) or use `ref()` instead (`state.value = { count: 0 }`).

## Q5
`reactive()` is marginally nicer when you have a plain object with many properties and want to avoid `.value` everywhere. But in practice, `ref()` is almost always preferred because: (1) it works with primitives, (2) you can reassign the whole value, (3) it's more explicit (you always know it's reactive), and (4) it's the official recommendation. The `.value` trade-off is worth the consistency.
