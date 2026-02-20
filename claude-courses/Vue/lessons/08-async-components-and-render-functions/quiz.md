# Lesson 8: Async Components & Render Functions — Quiz

## Q1
You have a heavy `ChartDashboard` component (200KB) that's only shown when the user clicks a "Show Charts" button. How would you optimize this? Write the code.

---

## Q2
What does this render function produce? Write the equivalent HTML output.

```js
h('div', { class: 'card' }, [
  h('h2', null, 'Title'),
  h('p', { style: { color: 'red' } }, 'Description')
])
```

---

## Q3
Why do render functions use `onClick` instead of `@click` or `v-on:click`?

---

## Q4
You need a component that renders a different HTML tag based on a `tag` prop (could be `div`, `section`, `article`, etc.). Which approach is better — template with `v-if` or render function? Write it.

---

## Q5
What's the `delay` option in `defineAsyncComponent` for? What problem does it solve?
