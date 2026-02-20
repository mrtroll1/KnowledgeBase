# Lesson 1: Semantic HTML — Native HTML Done Right

## The Problem — Why Does Markup Choice Matter?

Imagine you build a website that looks perfect in Chrome on your laptop. Visually, everything is fine. Then:

- A **screen reader** user visits — they hear "div, div, div, div, clickable, div" and have no idea where the navigation is
- **Google crawls** your site — it can't tell your main content from your sidebar, so your SEO suffers
- A **keyboard user** tries to navigate — there are no landmarks to jump between, so they Tab through 47 elements to reach the content
- Your company gets an **accessibility lawsuit** — WCAG compliance is a legal requirement in many jurisdictions (ADA in the US, EAA in the EU)

All of this because the HTML used `<div>` and `<span>` for everything instead of the tags HTML already provides.

---

## Semantic Tags vs Div Soup

### A: Div Soup (how it's often done)

```html
<div class="header">
  <div class="logo">Acme Corp</div>
  <div class="nav">
    <div class="nav-item"><a href="/">Home</a></div>
    <div class="nav-item"><a href="/about">About</a></div>
    <div class="nav-item"><a href="/contact">Contact</a></div>
  </div>
</div>

<div class="main-content">
  <div class="article">
    <div class="article-title">How to Build Accessible Websites</div>
    <div class="article-date">2026-02-20</div>
    <div class="article-body">
      <div class="paragraph">Accessibility matters because...</div>
    </div>
  </div>

  <div class="sidebar">
    <div class="sidebar-title">Related Articles</div>
    <div class="sidebar-list">
      <div class="sidebar-item">Article One</div>
      <div class="sidebar-item">Article Two</div>
    </div>
  </div>
</div>

<div class="footer">
  <div class="copyright">© 2026 Acme Corp</div>
</div>
```

A screen reader sees: a flat wall of generic containers. No landmarks, no headings, no structure. The user must listen to everything sequentially to understand the page.

### B: Semantic Markup (the same layout, done right)

```html
<header>
  <a href="/" class="logo">Acme Corp</a>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>How to Build Accessible Websites</h1>
    <time datetime="2026-02-20">February 20, 2026</time>
    <p>Accessibility matters because...</p>
  </article>

  <aside aria-label="Related articles">
    <h2>Related Articles</h2>
    <ul>
      <li><a href="/article-one">Article One</a></li>
      <li><a href="/article-two">Article Two</a></li>
    </ul>
  </aside>
</main>

<footer>
  <p>© 2026 Acme Corp</p>
</footer>
```

Now a screen reader announces: "banner landmark, navigation landmark with 3 links, main landmark, article: heading level 1 'How to Build Accessible Websites', complementary landmark 'Related articles'..." The user can jump directly to any section.

**What changed visually?** Nothing. The page looks the same. But the browser, screen readers, search engines, and keyboard users now understand the structure.

---

## The Semantic Tag Reference

```
┌──────────────────────────────────────────────────┐
│ <header>              Banner landmark            │
│   <nav>               Navigation landmark        │
│     <ul><li>           Proper list semantics     │
├──────────────────────────────────────────────────┤
│ <main>                Main landmark (1 per page) │
│   <article>           Self-contained content     │
│     <section>         Thematic grouping          │
│   <aside>             Complementary content      │
├──────────────────────────────────────────────────┤
│ <footer>              Contentinfo landmark       │
└──────────────────────────────────────────────────┘
```

| Tag | When to use | Landmark role |
|---|---|---|
| `<header>` | Introductory content, logo, nav | `banner` (when top-level) |
| `<nav>` | Groups of navigation links | `navigation` |
| `<main>` | The dominant content of the page — **only one per page** | `main` |
| `<article>` | Self-contained content that makes sense on its own (blog post, comment, product card) | `article` |
| `<section>` | Thematic grouping of content — usually has a heading | `region` (when labelled) |
| `<aside>` | Content tangentially related to the main content (sidebar, callout) | `complementary` |
| `<footer>` | Footer information — copyright, links, contact | `contentinfo` (when top-level) |

**Without these tags**, you must add ARIA roles manually (`<div role="banner">`), which is more work, more error-prone, and violates the first rule of ARIA: "Don't use ARIA if you can use a native HTML element."

---

## Heading Hierarchy — h1 Through h6

Headings create an **outline** of your page. Screen reader users navigate by headings the way sighted users scan visually.

### Rules

1. **One `<h1>` per page** — the page title
2. **Don't skip levels** — go h1 → h2 → h3, never h1 → h3
3. **Headings are for structure, not styling** — don't use `<h3>` because it "looks the right size." Use CSS for that

### A: Broken heading hierarchy

```html
<h1>Our Products</h1>
<h3>Electronics</h3>        <!-- Skipped h2! -->
<h5>Smartphones</h5>        <!-- Skipped h4! -->
<h2>Customer Reviews</h2>
```

A screen reader user jumping between headings gets a confusing outline. They might think they missed a section.

### B: Correct heading hierarchy

```html
<h1>Our Products</h1>
  <h2>Electronics</h2>
    <h3>Smartphones</h3>
    <h3>Laptops</h3>
  <h2>Customer Reviews</h2>
    <h3>5-Star Reviews</h3>
    <h3>Recent Reviews</h3>
```

The outline is now logical:
```
1. Our Products
   1.1 Electronics
       1.1.1 Smartphones
       1.1.2 Laptops
   1.2 Customer Reviews
       1.2.1 5-Star Reviews
       1.2.2 Recent Reviews
```

---

## Form Labels and ARIA Basics

Every form input **must** have a label. Without one, screen reader users hear "edit text" with no context.

### A: Inputs without labels

```html
<input type="email" placeholder="Enter your email">
<input type="password" placeholder="Password">
<button>Sign In</button>
```

The placeholder disappears when the user starts typing. A screen reader may not announce it at all. The user has no persistent label.

### B: Properly labelled inputs

```html
<label for="email">Email address</label>
<input type="email" id="email" name="email" autocomplete="email">

<label for="password">Password</label>
<input type="password" id="password" name="password" autocomplete="current-password">

<button type="submit">Sign In</button>
```

The `for` attribute on `<label>` links it to the input's `id`. Clicking the label focuses the input. Screen readers announce "Email address, edit text."

### When to Use ARIA

ARIA (Accessible Rich Internet Applications) fills gaps where native HTML falls short — interactive widgets, dynamic content, custom components.

```html
<!-- ARIA for a custom component that has no native equivalent -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Tab 2</button>
</div>
<div role="tabpanel" id="panel-1">Content for tab 1</div>
<div role="tabpanel" id="panel-2" hidden>Content for tab 2</div>
```

**The first rule of ARIA**: Don't use ARIA if a native HTML element already does what you need. `<button>` already has `role="button"` built in — adding `role="button"` to a `<div>` is reinventing the wheel and forgetting the brakes (no keyboard support, no focus management).

---

## Lists — ol, ul, dl

### When to use each

| List type | Use when | Example |
|---|---|---|
| `<ul>` | Items have no meaningful order | Navigation links, feature lists, tags |
| `<ol>` | Order matters | Steps in a recipe, ranked results, instructions |
| `<dl>` | Key-value pairs | Glossary, metadata, FAQ |

### A: Fake list with divs

```html
<div class="features">
  <div>✓ Free shipping</div>
  <div>✓ 30-day returns</div>
  <div>✓ 24/7 support</div>
</div>
```

A screen reader says: "Free shipping. 30-day returns. 24/7 support." No indication that these are a group of related items, or how many there are.

### B: Semantic list

```html
<ul class="features">
  <li>Free shipping</li>
  <li>30-day returns</li>
  <li>24/7 support</li>
</ul>
```

A screen reader says: "List, 3 items. Free shipping. 30-day returns. 24/7 support." The user knows it's a group and how many items it contains.

### Definition list (dl) — often overlooked

```html
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language — the structure of web pages</dd>

  <dt>CSS</dt>
  <dd>Cascading Style Sheets — the presentation of web pages</dd>

  <dt>ARIA</dt>
  <dd>Accessible Rich Internet Applications — accessibility extensions for HTML</dd>
</dl>
```

---

## Image Alt Text

Every `<img>` needs an `alt` attribute. What goes in it depends on the image's purpose.

### Meaningful images — describe the content

```html
<!-- A: Missing or useless alt text -->
<img src="chart.png">
<img src="chart.png" alt="chart">
<img src="chart.png" alt="image1234.png">

<!-- B: Meaningful alt text -->
<img src="chart.png" alt="Bar chart showing sales growth: Q1 $2M, Q2 $3.1M, Q3 $4.5M, Q4 $5.2M">
```

### Decorative images — use empty alt

```html
<!-- Decorative divider, gradient blob, background flourish -->
<img src="divider.svg" alt="">
```

An empty `alt=""` tells screen readers to skip the image entirely. **Omitting** the `alt` attribute is different — the screen reader may announce the file name, which is useless.

### Icons with text

```html
<!-- Icon is decorative because the text already conveys meaning -->
<button>
  <img src="trash.svg" alt="">
  Delete
</button>

<!-- Icon-only button — alt IS the label -->
<button aria-label="Delete item">
  <img src="trash.svg" alt="">
</button>
```

---

## Key Takeaways

1. **Semantic HTML is free accessibility** — `<nav>`, `<main>`, `<article>` create landmarks that screen readers and keyboards use automatically
2. **Div and span are last resorts** — they carry zero meaning. Use them only when no semantic tag fits
3. **Heading hierarchy is a document outline** — don't skip levels, don't use headings for font size
4. **Every input needs a label** — `<label for="id">`, not placeholder text
5. **ARIA is a supplement, not a replacement** — prefer native HTML; use ARIA only for custom widgets
6. **Alt text depends on purpose** — describe meaningful images, empty-alt decorative ones, never omit the attribute
