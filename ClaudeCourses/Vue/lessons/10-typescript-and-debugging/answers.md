# Lesson 10: TypeScript & Debugging — Answers

## Q1
```ts
interface Props {
  title: string
  tags?: string[]
  onClick?: () => void
}

const { title, tags = [], onClick } = defineProps<Props>()
```
`required: true` → non-optional property. `default` → destructuring default. `Function` → typed callback signature.

## Q2
```ts
onRenderTriggered((event) => {
  console.log('Trigger:', event.key, event.type, event.target)
  debugger
})
```
Then change `user.name` and check if the hook fires. If it doesn't fire, the data isn't reactive (maybe `user` is a plain object, or you destructured it). If it fires with an unexpected key, something else is triggering the render. The `event.target` shows which reactive object triggered it, and `event.key` shows which property.

## Q3
`count` is `Ref<number>` (inferred from the initial value `0`). `user` is `Ref<null>` — TypeScript infers the narrowest type from the initial value. This is a problem because you can never assign a user object to it: `user.value = { name: 'Alice' }` would be a type error (can't assign `User` to `null`). Fix: `const user = ref<User | null>(null)` to explicitly allow both types.

## Q4
No, it won't compile. The emit signature declares `change` expects a `number`, but `'5'` is a `string`. TypeScript catches this at compile time: `Argument of type 'string' is not assignable to parameter of type 'number'`. Fix: `emit('change', 5)` or `emit('change', Number('5'))`.

## Q5
`onRenderTracked` fires during render when a reactive dependency is **accessed** (tracked). It tells you "what does this component depend on?" — useful for understanding why a component has too many dependencies. `onRenderTriggered` fires when a tracked dependency **changes** and causes a re-render. It tells you "what caused this re-render?" — useful for debugging unexpected updates. Use `Tracked` to audit dependencies, use `Triggered` to find what's causing re-renders.
