# Lesson 9: Transitions & Teleports

## Part 1: Transitions

### The Problem — Smooth UI Changes

Elements appear and disappear with `v-if` / `v-show`. Without animation, this feels jarring — content pops in and out like a broken TV.

**Without `<Transition>`**, you'd manually manage CSS classes, timeouts, and cleanup:
```js
el.classList.add('fade-enter')
requestAnimationFrame(() => {
  el.classList.remove('fade-enter')
  el.classList.add('fade-enter-active')
})
el.addEventListener('transitionend', () => { /* cleanup */ })
```

**With `<Transition>`**, Vue handles the class lifecycle automatically.

---

### CSS Transitions

```vue
<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>

<template>
  <button @click="show = !show">Toggle</button>
  <Transition name="fade">
    <p v-if="show">Hello!</p>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

### The 6 Transition Classes

```
ENTER                          LEAVE
┌──────────┐                   ┌──────────┐
│-enter-from│ → -enter-active → │ visible  │ → -leave-active → -leave-to
│ (start)   │   (animating)    │          │   (animating)     (end)
└──────────┘                   └──────────┘

Classes applied:
Frame 1:    .fade-enter-from + .fade-enter-active
Frame 2+:   .fade-enter-active (enter-from removed)
Done:       all removed

Frame 1:    .fade-leave-from + .fade-leave-active
Frame 2+:   .fade-leave-active + .fade-leave-to
Done:       element removed from DOM
```

### CSS Animations (@keyframes)

```vue
<Transition name="bounce">
  <p v-if="show">Bouncing!</p>
</Transition>

<style>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
</style>
```

### Transition Modes

When swapping between two elements, both exist briefly during the transition:

```vue
<!-- mode="out-in": old leaves first, then new enters -->
<Transition name="fade" mode="out-in">
  <p v-if="tab === 'a'" key="a">Tab A</p>
  <p v-else key="b">Tab B</p>
</Transition>
```

| Mode | Behavior | Use Case |
|------|----------|----------|
| (default) | Both animate simultaneously | Crossfade effects |
| `out-in` | Old leaves, then new enters | Tab switching, most cases |
| `in-out` | New enters, then old leaves | Rare — stacking effects |

### JavaScript Hooks

For programmatic control (e.g., GSAP animations):

```vue
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  @before-leave="onBeforeLeave"
  @leave="onLeave"
  @after-leave="onAfterLeave"
>
```

```js
function onEnter(el, done) {
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.3s ease'
    el.style.opacity = 1
    el.addEventListener('transitionend', done)
  })
}
```

### TransitionGroup — Animating Lists

```vue
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">{{ item.name }}</li>
</TransitionGroup>

<style>
.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-move {  /* Animate reordering */
  transition: transform 0.5s ease;
}
</style>
```

`TransitionGroup` wraps list items. The `.list-move` class animates items shuffling positions.

---

## Part 2: Teleports

### The Problem — DOM Hierarchy vs Visual Hierarchy

A modal component lives inside a deeply nested component tree:

```
App → Dashboard → Sidebar → SettingsPanel → ConfirmDialog
```

But visually, the modal should overlay the entire page and be a direct child of `<body>` (for proper z-index, positioning, and accessibility).

**Without Teleport**, you'd hoist the modal state up to App or use a portal library.

**With Teleport**, the component stays in its logical place but renders elsewhere:

```vue
<template>
  <button @click="open = true">Open Modal</button>

  <Teleport to="body">
    <div v-if="open" class="modal-overlay">
      <div class="modal">
        <p>I render in &lt;body&gt;, not inside SettingsPanel!</p>
        <button @click="open = false">Close</button>
      </div>
    </div>
  </Teleport>
</template>
```

### Conditional Teleport

```vue
<!-- Only teleport on desktop; on mobile, render in place -->
<Teleport to="body" :disabled="isMobile">
  <div class="tooltip">{{ text }}</div>
</Teleport>
```

### Teleport Target

`to` accepts any CSS selector:

```vue
<Teleport to="body">          <!-- append to body -->
<Teleport to="#modals">        <!-- append to #modals div -->
<Teleport to=".portal-target"> <!-- append to element with class -->
```

---

## Key Takeaways

1. **`<Transition>`** automates enter/leave CSS classes — 6 classes total
2. **`mode="out-in"`** prevents overlapping content during swaps
3. **`<TransitionGroup>`** for list animations — add `.list-move` for reorder animation
4. **JS hooks** (`@enter`, `@leave`) for programmatic animations (GSAP, etc.)
5. **`<Teleport to="body">`** renders content outside the component tree — perfect for modals
6. **`:disabled`** on Teleport for conditional teleporting (mobile vs desktop)

> **Playground:** `src/components/Transitions.vue` has CSS transitions, animations, JS hooks, and TransitionGroup. `src/components/Teleports.vue` shows modal teleporting.
