# Lesson 3: BEM Methodology — Predictable CSS at Scale

## The Problem — Why Do CSS Naming Conventions Exist?

You're on a team. One developer writes `.title`, another writes `.header-title`, a third writes `.titleText`. Six months later:

- Nobody knows if changing `.title` will break the sidebar, the modal, or the hero section
- Adding a new component means searching the entire codebase to avoid name collisions
- Styles leak between unrelated components because selectors are too generic
- Developers nest selectors deeper and deeper to scope styles, creating specificity wars

**Without a naming convention**, CSS becomes a global namespace of conflicting names. **With BEM**, every class name tells you three things: what component it belongs to, what part of that component it is, and what variation it represents.

---

## What Is BEM?

BEM stands for **Block, Element, Modifier**. It's a naming convention for CSS classes:

```
.block                    → The component itself
.block__element           → A part inside the component
.block--modifier          → A variation of the component
.block__element--modifier → A variation of a part
```

- **Block**: An independent, reusable component (`.card`, `.nav`, `.form`)
- **Element**: A piece that belongs to a block and has no meaning on its own (`.card__title`, `.card__image`)
- **Modifier**: A flag that changes appearance or behavior (`.card--featured`, `.card__title--large`)

### The symbols

- `__` (double underscore) = "is a child part of"
- `--` (double dash) = "is a variation of"

---

## How to Find Block Boundaries

A block is a **self-contained component** that can be placed anywhere on the page and still make sense.

### Ask yourself: "Could this exist independently?"

```
┌─────────────────────────────────────────────┐
│ .page-header                                │  ← Block: yes, it's a standalone header
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ .logo       │  │ .main-nav            │  │  ← Two separate blocks inside
│  └─────────────┘  │  ┌────┐ ┌────┐       │  │
│                    │  │link│ │link│  ...  │  │
│                    └──┴────┴─┴────┴──────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ .card                                       │  ← Block
│  ┌───────────────────────────────────────┐  │
│  │ .card__image                          │  │  ← Element (belongs to .card)
│  ├───────────────────────────────────────┤  │
│  │ .card__title                          │  │  ← Element
│  │ .card__description                    │  │  ← Element
│  │ .card__actions                        │  │  ← Element
│  │   ┌──────────┐  ┌──────────┐         │  │
│  │   │ .btn     │  │ .btn     │         │  │  ← Separate block (button is reusable)
│  │   └──────────┘  └──────────┘         │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

Notice: `.btn` is NOT `.card__btn`. A button is its own independent block that can exist anywhere — in a card, a form, a modal, a nav. If it's reusable across components, it's a block, not an element.

---

## Listing Elements Within a Block

Elements are parts of a block that **have no standalone meaning**. A `.card__title` outside of a card is meaningless.

### Rules for elements

1. **Element names describe what they ARE, not what they LOOK LIKE**

```css
/* Bad — describes appearance */
.card__blue-text { }
.card__big-heading { }

/* Good — describes purpose */
.card__title { }
.card__description { }
```

2. **Never nest element names** — there's no `.card__body__title`

```css
/* Bad — implies nested dependency */
.card__body__title { }
.card__actions__btn { }

/* Good — all elements belong directly to the block */
.card__title { }
.card__action-btn { }
```

The HTML can nest however it wants. BEM class names stay flat:

```html
<div class="card">
  <div class="card__body">
    <h2 class="card__title">Product Name</h2>   <!-- belongs to .card, not to .card__body -->
    <p class="card__description">Details...</p>
  </div>
  <div class="card__actions">
    <button class="btn btn--primary">Buy</button>  <!-- .btn is its own block -->
  </div>
</div>
```

---

## Modifiers for Variations

Modifiers change the **appearance**, **state**, or **behavior** of a block or element.

### Block modifiers

```html
<!-- Default card -->
<div class="card">...</div>

<!-- Featured card (different background, border) -->
<div class="card card--featured">...</div>

<!-- Compact card (less padding) -->
<div class="card card--compact">...</div>
```

```css
.card {
  padding: 24px;
  background: white;
  border: 1px solid #ddd;
}

.card--featured {
  background: #fffde7;
  border-color: #ffc107;
}

.card--compact {
  padding: 12px;
}
```

**Key**: The modifier class is always added **alongside** the base class, never instead of it. `class="card card--featured"`, not `class="card--featured"`.

### Element modifiers

```html
<div class="card">
  <h2 class="card__title card__title--large">Big Title</h2>
  <p class="card__description">...</p>
</div>
```

```css
.card__title {
  font-size: 16px;
}

.card__title--large {
  font-size: 24px;
}
```

---

## Keeping Blocks Independent

The most important BEM rule: **blocks must not depend on other blocks**.

### A: Cross-block dependency (breaks reusability)

```css
/* Card styles that only work inside a sidebar */
.sidebar .card {
  width: 100%;
  padding: 8px;
}

/* Button styles that change inside a card */
.card .btn {
  border-radius: 0;
}
```

This means `.card` looks different depending on where it's placed. Move it to the main content area and it breaks. The `.btn` loses its border-radius only inside cards — invisible coupling.

### B: Independent blocks with modifiers

```css
/* Card has its own modifier for narrow contexts */
.card--narrow {
  width: 100%;
  padding: 8px;
}

/* Button has its own modifier for square corners */
.btn--square {
  border-radius: 0;
}
```

```html
<!-- In the sidebar -->
<div class="sidebar">
  <div class="card card--narrow">
    <button class="btn btn--square">Action</button>
  </div>
</div>

<!-- In the main area — card is the same component, different modifiers -->
<div class="main">
  <div class="card">
    <button class="btn btn--primary">Action</button>
  </div>
</div>
```

Now each block's styles are self-contained. You can predict what any block looks like by reading its class list alone, without knowing its parent.

---

## BEM + Flat Specificity = Predictable CSS

BEM naturally keeps all selectors at a single class level:

```css
.card            { }    /* 0,0,1,0 */
.card--featured  { }    /* 0,0,1,0 */
.card__title     { }    /* 0,0,1,0 */
.card__title--lg { }    /* 0,0,1,0 */
```

Every rule has the same specificity. The cascade is resolved purely by source order, which you control. No IDs, no nesting, no `!important`, no surprises.

**Without BEM**, you end up with:

```css
.sidebar .card .title             { }    /* 0,0,3,0 */
.main-content .card .title        { }    /* 0,0,3,0 */
#featured .card .title            { }    /* 0,1,2,0 */
.sidebar .card .title:hover       { }    /* 0,0,4,0 */
```

Different specificity levels, unpredictable overrides, and you can't tell which rule wins without calculating every score.

---

## Real Examples

### Example 1: Card Component

```html
<article class="card card--featured">
  <img class="card__image" src="product.jpg" alt="Wireless headphones">
  <div class="card__body">
    <h3 class="card__title">Wireless Headphones</h3>
    <p class="card__price">$79.99</p>
    <p class="card__description">Premium sound quality with 30-hour battery life.</p>
  </div>
  <div class="card__actions">
    <button class="btn btn--primary">Add to Cart</button>
    <button class="btn btn--ghost">Wishlist</button>
  </div>
</article>
```

```css
.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}
.card--featured {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}
.card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.card__body {
  padding: 16px;
}
.card__title {
  margin: 0 0 8px;
  font-size: 18px;
}
.card__price {
  font-weight: bold;
  color: #1976d2;
}
.card__description {
  color: #666;
  font-size: 14px;
}
.card__actions {
  padding: 0 16px 16px;
  display: flex;
  gap: 8px;
}
```

### Example 2: Navigation

```html
<nav class="main-nav" aria-label="Main navigation">
  <a href="/" class="main-nav__logo">
    <img src="logo.svg" alt="Acme Corp home">
  </a>
  <ul class="main-nav__list">
    <li class="main-nav__item">
      <a href="/" class="main-nav__link main-nav__link--active">Home</a>
    </li>
    <li class="main-nav__item">
      <a href="/products" class="main-nav__link">Products</a>
    </li>
    <li class="main-nav__item">
      <a href="/about" class="main-nav__link">About</a>
    </li>
  </ul>
</nav>
```

```css
.main-nav {
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #1a1a2e;
}
.main-nav__logo {
  margin-right: auto;
}
.main-nav__list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
}
.main-nav__link {
  display: block;
  padding: 16px 12px;
  color: #ccc;
  text-decoration: none;
}
.main-nav__link:hover {
  color: white;
}
.main-nav__link--active {
  color: white;
  border-bottom: 2px solid #e94560;
}
```

### Example 3: Form

```html
<form class="login-form">
  <div class="login-form__field">
    <label class="login-form__label" for="email">Email</label>
    <input class="login-form__input" type="email" id="email" name="email">
  </div>
  <div class="login-form__field">
    <label class="login-form__label" for="password">Password</label>
    <input class="login-form__input login-form__input--error" type="password" id="password" name="password">
    <span class="login-form__error-text">Password must be at least 8 characters</span>
  </div>
  <button class="btn btn--primary btn--full-width" type="submit">Sign In</button>
</form>
```

```css
.login-form {
  max-width: 400px;
  padding: 32px;
}
.login-form__field {
  margin-bottom: 20px;
}
.login-form__label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
}
.login-form__input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}
.login-form__input:focus {
  border-color: #1976d2;
  outline: 2px solid rgba(25, 118, 210, 0.3);
}
.login-form__input--error {
  border-color: #d32f2f;
}
.login-form__error-text {
  display: block;
  margin-top: 4px;
  color: #d32f2f;
  font-size: 13px;
}
```

---

## Key Takeaways

1. **BEM is Block__Element--Modifier** — a naming convention that makes CSS self-documenting
2. **Blocks are independent** — they work anywhere on the page, no parent-context required
3. **Elements belong to blocks** — they have no meaning on their own, and their names stay flat (no `__el1__el2`)
4. **Modifiers are additive** — always used alongside the base class, never alone
5. **No cross-block styling** — don't write `.parent .child { }`. Use modifiers instead
6. **BEM keeps specificity flat** — every selector is a single class (0,0,1,0), so the cascade is controlled by source order alone
