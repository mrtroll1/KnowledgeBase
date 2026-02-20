# Lesson 11: Accessibility

## The Problem — Your App Excludes Users

Your app works perfectly... if you can see the screen and use a mouse. But:
- ~15% of the world population has some form of disability
- Screen readers can't navigate `<div>` soup
- Keyboard-only users can't interact with `<div @click>`
- Low vision users can't read low-contrast text

**Without accessibility**, you're building for 85% of users. **With accessibility**, you build for everyone — and it's often required by law.

---

## Semantic HTML — The Foundation

```html
<!-- ❌ Div soup — screen reader hears "group, group, group" -->
<div class="header">
  <div class="nav">
    <div class="nav-item" onclick="...">Home</div>
  </div>
</div>
<div class="content">
  <div class="article">
    <div class="title">My Post</div>
  </div>
</div>

<!-- ✅ Semantic — screen reader hears "banner, navigation, link Home, main, article, heading My Post" -->
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>
<main>
  <article>
    <h1>My Post</h1>
  </article>
</main>
```

### Key Semantic Elements

| Element | Purpose | Screen Reader Announces |
|---------|---------|----------------------|
| `<header>` | Page/section header | "banner" |
| `<nav>` | Navigation links | "navigation" |
| `<main>` | Primary content | "main" |
| `<article>` | Self-contained content | "article" |
| `<section>` | Thematic grouping | "region" (with label) |
| `<aside>` | Tangential content | "complementary" |
| `<footer>` | Page/section footer | "contentinfo" |
| `<button>` | Clickable action | "button" (focusable, Enter/Space) |

---

## Form Accessibility

### Labels — Every Input Needs One

```html
<!-- ❌ No label — screen reader just says "edit text" -->
<input type="text" placeholder="Search..." />

<!-- ✅ Visible label -->
<label for="search">Search:</label>
<input type="text" id="search" />

<!-- ✅ Visually hidden but accessible -->
<label for="search" class="sr-only">Search:</label>
<input type="text" id="search" placeholder="Search..." />
```

### ARIA Attributes — When HTML Isn't Enough

```html
<!-- Link two elements: label + instructions -->
<label id="date-label" for="date">Date:</label>
<span id="date-instructions">Format: MM/DD/YYYY</span>
<input id="date" aria-labelledby="date-label" aria-describedby="date-instructions" />
```

| Attribute | Purpose |
|-----------|---------|
| `aria-labelledby` | Points to element(s) that label this element |
| `aria-describedby` | Points to element(s) that describe this element |
| `aria-hidden="true"` | Hides from screen readers (decorative content) |
| `role="search"` | Identifies the purpose of a `<form>` |

### Fieldset & Legend — Grouping Related Inputs

```html
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street:</label>
  <input id="street" />
  <label for="city">City:</label>
  <input id="city" />
</fieldset>
```

**Without `<fieldset>`**, screen reader users don't know these inputs are related.

---

## Accessibility in Vue

### Focus Management

When content changes dynamically (modals, route changes), manage focus:

```vue
<script setup>
import { ref, nextTick } from 'vue'
const showModal = ref(false)
const modalRef = ref(null)

async function openModal() {
  showModal.value = true
  await nextTick()
  modalRef.value?.focus()
}
</script>

<template>
  <div v-if="showModal" ref="modalRef" tabindex="-1" role="dialog" aria-modal="true">
    <p>Modal content</p>
  </div>
</template>
```

### Skip Links

```vue
<template>
  <a href="#main-content" class="sr-only focus:not-sr-only">
    Skip to main content
  </a>
  <nav>...</nav>
  <main id="main-content">...</main>
</template>
```

### Visually Hidden CSS

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Quick Accessibility Checklist

- [ ] Every `<img>` has `alt` (empty `alt=""` for decorative images)
- [ ] Every form input has a `<label>`
- [ ] Color is not the only way to convey information
- [ ] Interactive elements are keyboard accessible (Tab, Enter, Escape)
- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skipping)
- [ ] Focus is managed when content changes dynamically
- [ ] Page has a `<main>` landmark

---

## Key Takeaways

1. **Semantic HTML first** — `<button>`, `<nav>`, `<main>` are free accessibility
2. **Every input needs a label** — visible or visually hidden, never placeholder-only
3. **ARIA supplements HTML** — use `aria-labelledby`, `aria-describedby` for complex relationships
4. **Manage focus in SPAs** — modal opens → focus modal, route changes → focus main content
5. **Test with keyboard** — if you can't Tab to it and Enter to activate it, it's broken

> **Playground:** `src/components/Accessible.vue` demonstrates ARIA attributes, form labels, and accessible patterns.
