# Lesson 3: BEM Methodology — Answers

## Q1
Problems and fixes:

1. **`product-card__body__header`** — Nested element names. Elements always belong directly to the block, regardless of HTML nesting. Fix: `product-card__header`
2. **`title`** — Generic class with no block prefix. It will collide with any other `.title` on the page. Fix: `product-card__title`
3. **`product-card__body__content`** — Same nesting problem. Fix: `product-card__content`
4. **`product-card__desc-highlighted`** — A modifier should use `--`, not a hyphenated suffix. Fix: `product-card__desc--highlighted` (and it must appear alongside the base class `product-card__desc`)
5. **`product-card--actions`** — This uses modifier syntax (`--`) but it's an element (a part of the card), not a variation. Fix: `product-card__actions`
6. **`primary`** — A modifier without its block. If this modifies a button block, it should be `btn--primary` alongside `btn`. Fix: `btn btn--primary`

Corrected:
```html
<div class="product-card">
  <div class="product-card__header">
    <h2 class="product-card__title">Product Name</h2>
  </div>
  <div class="product-card__content">
    <p class="product-card__desc product-card__desc--highlighted">On sale!</p>
  </div>
  <div class="product-card__actions">
    <button class="btn btn--primary">Buy Now</button>
  </div>
</div>
```

## Q2
It's problematic because it creates a **cross-block dependency** — `.card` now looks different depending on its parent (`.sidebar`). If you move the card to a different container, the compact styles disappear. The card is no longer a self-contained component.

It also increases specificity to 0,0,2,0, meaning overriding these rules elsewhere requires at least two classes.

BEM approach — use a modifier on the card itself:

```html
<div class="sidebar">
  <div class="card card--compact">
    <h3 class="card__title">...</h3>
  </div>
</div>
```

```css
.card { padding: 24px; }
.card--compact { padding: 8px; }

.card__title { font-size: 18px; }
.card--compact .card__title { font-size: 14px; }
```

Now the card's compact appearance is encoded in its own class list. You can read the HTML and know exactly how it will look without tracing parent selectors. Note: `.card--compact .card__title` is 0,0,2,0, which is acceptable because it's the block modifying its own elements — not a cross-block dependency.

## Q3
Refactored HTML and CSS:

```html
<div class="user-profile user-profile--online">
  <img class="user-profile__avatar user-profile__avatar--large" src="avatar.jpg" alt="Jane Doe">
  <span class="user-profile__name">Jane Doe</span>
  <span class="user-profile__role">Engineer</span>
</div>
```

```css
.user-profile { }
.user-profile--online { }

.user-profile__avatar { }
.user-profile__avatar--large { }

.user-profile__name { }
.user-profile--online .user-profile__name { }
/* e.g., make the name green when online */

.user-profile__role { }
```

What changed:
- Block name is `user-profile` (not `profile-section` — "section" describes layout, not the component)
- All elements use `user-profile__` prefix — no standalone `.user-name` or `.user-avatar` that could collide
- `.online` modifier becomes `user-profile--online` — it's a variation of the block
- `.large` modifier becomes `user-profile__avatar--large` — it's a variation of the element
- No parent-child selectors like `.profile-section .user-avatar` — except within the same block for modifier-driven changes

## Q4
`.btn` is its **own block**, not `.card__btn`. The reasoning:

1. **Independence test**: Can a button exist outside of a card? Yes — buttons appear in forms, modals, navbars, and standalone. It has meaning on its own.
2. **Reusability**: If it were `.card__btn`, you'd have to duplicate all button styles for `.form__btn`, `.modal__btn`, `.nav__btn`. That's the opposite of DRY.
3. **Existing component**: Buttons are almost always their own block with their own modifiers (`.btn--primary`, `.btn--small`, `.btn--ghost`).

Correct markup:
```html
<div class="card">
  <h2 class="card__title">Article Title</h2>
  <p class="card__summary">A short summary...</p>
  <button class="btn btn--secondary">Read More</button>
</div>
```

The button is a separate block that happens to live inside a card. The card doesn't own it or control its styles.

## Q5
Specificity for each:

```
.alert              → 0,0,1,0
.alert--success     → 0,0,1,0
.alert--error       → 0,0,1,0
.alert__icon        → 0,0,1,0
.alert__message     → 0,0,1,0
.alert__close       → 0,0,1,0
.alert__close:hover → 0,0,2,0
```

Every selector except the `:hover` state is at exactly 0,0,1,0. This is a good thing because:

1. **No specificity conflicts** — when all selectors have the same weight, **source order** is the only tiebreaker, and source order is something you control intentionally
2. **Easy to override** — any selector at 0,0,1,0 or higher can modify these styles. No IDs or `!important` needed
3. **Predictable cascade** — you can read the stylesheet top to bottom and know exactly which rules apply. A modifier placed after the base rule will override it because of source order, not specificity tricks
4. **The `:hover` at 0,0,2,0 is appropriate** — state changes (hover, focus, active) should beat the base style, and one extra pseudo-class achieves exactly that
