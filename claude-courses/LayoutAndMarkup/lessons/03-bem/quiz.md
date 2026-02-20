# Lesson 3: BEM Methodology — Quiz

## Q1
Identify the BEM naming problems in these class names and fix them:

```html
<div class="product-card">
  <div class="product-card__body__header">
    <h2 class="title">Product Name</h2>
  </div>
  <div class="product-card__body__content">
    <p class="product-card__desc product-card__desc-highlighted">On sale!</p>
  </div>
  <div class="product-card--actions">
    <button class="product-card__buy-btn primary">Buy Now</button>
  </div>
</div>
```

---

## Q2
You have a `card` component that appears in two places: a sidebar and a grid. In the sidebar, cards should be compact (less padding, smaller title). Your colleague suggests this CSS:

```css
.sidebar .card { padding: 8px; }
.sidebar .card__title { font-size: 14px; }
```

Why is this problematic in BEM, and how would you do it instead?

---

## Q3
Refactor this CSS to use BEM. The HTML is for a user profile component with an avatar, name, role, and an "online" state indicator:

```css
.profile-section .user-avatar { }
.profile-section .user-name { }
.profile-section .user-role { }
.profile-section.online .user-name { }
.profile-section .user-avatar.large { }
```

Write both the corrected HTML and CSS.

---

## Q4
Is the `.btn` inside this card an element of `.card` or its own block? Explain your reasoning.

```html
<div class="card">
  <h2 class="card__title">Article Title</h2>
  <p class="card__summary">A short summary...</p>
  <button class="???">Read More</button>
</div>
```

---

## Q5
What is the specificity of every selector in this BEM-style CSS? Why is this a good thing?

```css
.alert { }
.alert--success { }
.alert--error { }
.alert__icon { }
.alert__message { }
.alert__close { }
.alert__close:hover { }
```
