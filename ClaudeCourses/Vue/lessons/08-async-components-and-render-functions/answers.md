# Lesson 8: Async Components & Render Functions — Answers

## Q1
```js
import { defineAsyncComponent } from 'vue'
const ChartDashboard = defineAsyncComponent({
  loader: () => import('./ChartDashboard.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 15000
})
```
```vue
<ChartDashboard v-if="showCharts" />
```
The 200KB bundle only downloads when `showCharts` becomes true. The `delay` prevents a loading flash for fast connections.

## Q2
```html
<div class="card">
  <h2>Title</h2>
  <p style="color: red;">Description</p>
</div>
```
`h(tag, props, children)` — first arg is the tag, second is attributes/props, third is children (string or array of vnodes).

## Q3
Render functions work with the virtual DOM directly, not with Vue template directives. In the vnode props object, DOM events follow the `onXxx` naming convention (matching `addEventListener` style but camelCased). `@click` and `v-on:click` are template compiler sugar that gets compiled down to `onClick` internally.

## Q4
Render function — much cleaner:
```js
export default {
  props: { tag: { type: String, default: 'div' } },
  setup(props, { slots }) {
    return () => h(props.tag, null, slots.default?.())
  }
}
```
A template approach would need `<div v-if="tag === 'div'">`, `<section v-else-if="tag === 'section'">`, etc. for every possible tag — unscalable. Vue also has `<component :is="tag">` as a middle ground.

## Q5
`delay` (in ms) waits before showing the loading component. It solves the "loading flash" problem — if the async component loads in 50ms, the user sees a brief flicker of a spinner that looks broken. With `delay: 200`, the spinner only appears if loading takes longer than 200ms, giving fast loads a seamless experience.
