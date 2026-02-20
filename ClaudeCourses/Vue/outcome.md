# Vue 3 Learning — Outcome Tracker

## Solid Understanding
- **Reactivity fundamentals**: `ref()`, `reactive()`, deep vs shallow reactivity, the `.value` access pattern
- **Template syntax**: Text interpolation, attribute binding (`:attr`), event handling (`@event`), modifiers (`.prevent`, `.stop`, `.once`)
- **Conditional rendering**: `v-if` / `v-else-if` / `v-else`, `v-show`, and when to use which
- **Computed properties**: Caching mechanism, computed vs methods, writable computed, accessing previous value
- **Watchers**: `watch` and `watchEffect`, async operations in watchers, `{ deep: true }`, `{ immediate: true }`
- **Class and style bindings**: Object syntax, array syntax, computed class objects, dynamic inline styles, style shorthand
- **List rendering**: `v-for` on arrays, objects, and ranges; `:key` importance; `(value, key, index)` destructuring
- **Form input bindings**: `v-model` on text, textarea, checkbox (single/array), radio, select; `.lazy`, `.number`, `.trim` modifiers
- **Component props**: `defineProps()` with type validation, required/default/validator, factory defaults for objects/arrays
- **Events**: `defineEmits()`, `$emit` with payloads, parent-child event communication
- **v-model on components**: `defineModel()`, named models, model modifiers with `set()` transform
- **Slots**: Default and named slots, `$slots` conditional rendering, scoped slots with slot props
- **Provide/Inject**: Cross-hierarchy data passing, avoiding prop drilling, default values
- **Composables**: `useXxx` convention, returning reactive state, composable composition, `toValue()` for flexible inputs
- **Custom directives**: `v-focus`, `v-highlight` — direct DOM manipulation hooks
- **Async components**: `defineAsyncComponent()`, loading/error states, `delay` and `timeout` options
- **Render functions**: `h()` (hyperscript), programmatic vnode creation, `onXxx` event handlers
- **Transitions**: `<Transition>` with 6 CSS classes, `mode="out-in"`, CSS animations with `@keyframes`
- **TransitionGroup**: List enter/leave animations, `.move` class for reorder animations
- **JavaScript transition hooks**: `@before-enter`, `@enter`, `@leave` for programmatic animations
- **Teleport**: `<Teleport to="body">`, conditional teleporting with `:disabled`
- **TypeScript integration**: `defineProps<T>()`, typed emits, typed refs and computed
- **Debugging**: `onRenderTracked`, `onRenderTriggered`, Vue DevTools
- **Accessibility**: Semantic HTML, ARIA attributes, form labels, focus management, visually hidden patterns

## Partial / Needs Refinement
- **Suspense**: Not covered in checklists — Vue's built-in component for handling async dependencies in component trees. Pairs with async `setup()` and async components
- **Router integration**: Vue Router (route guards, dynamic routes, nested routes, lazy loading) — essential for any real SPA but not in the checklist scope
- **State management**: Pinia (the official store) — important for medium/large apps but not covered
- **SSR / Nuxt patterns**: Server-side rendering, hydration, universal components — relevant for production but advanced
- **Performance optimization**: `v-memo`, `v-once`, virtual scrolling, `shallowRef` strategies — the checklist touched shallowRef but not the broader optimization toolkit
- **Testing**: Component testing with Vitest + Vue Test Utils — not covered but essential for production code

## Gaps — Not Yet Covered
- **Vue Router** — routing, navigation guards, route params
- **Pinia** — centralized state management
- **Suspense** — async dependency resolution
- **KeepAlive** — caching component instances between route switches
- **Custom elements / Web Components** — using Vue as a web component builder
- **Plugin authoring** — `app.use()`, install functions, global properties

## Lessons Completed
- **Lesson 01 — Reactivity Fundamentals**: Covered via checklist (ref, shallowRef, reactive, destructuring trap)
- **Lesson 02 — Template Syntax**: Covered via checklist (interpolation, binding, events, modifiers, v-if/v-show)
- **Lesson 03 — Computed Properties & Watchers**: Covered via checklist (caching, watch, watchEffect)
- **Lesson 04 — Bindings & List Rendering**: Covered via checklist (class/style binding, v-for, :key)
- **Lesson 05 — Form Input Bindings**: Covered via checklist (v-model, checkboxes, select, modifiers)
- **Lesson 06 — Component Props & Events**: Covered via checklist (defineProps, defineEmits, defineModel, slots, provide/inject)
- **Lesson 07 — Composables**: Covered via checklist (useMouse, useFetch, useEventListener, toValue)
- **Lesson 08 — Async Components & Render Functions**: Covered via checklist (defineAsyncComponent, h())
- **Lesson 09 — Transitions & Teleports**: Covered via checklist (Transition, TransitionGroup, Teleport)
- **Lesson 10 — TypeScript & Debugging**: Covered via checklist (type-based props, typed emits, render hooks)
- **Lesson 11 — Accessibility**: Covered via checklist (semantic HTML, ARIA, form labels, focus management)
