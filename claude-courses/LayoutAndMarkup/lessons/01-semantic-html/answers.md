# Lesson 1: Semantic HTML — Answers

## Q1
Multiple problems:

1. `<div class="header">` should be `<header>` — gives the browser a `banner` landmark for free
2. `<div class="nav">` should be `<nav>` — creates a `navigation` landmark
3. The nav links should be in a `<ul>` with `<li>` items — screen readers announce "list, 3 items" so users know the scope
4. `<div class="main">` should be `<main>` — the primary landmark for the page content
5. `<div class="article">` should be `<article>` — marks self-contained content
6. `<h3>` as the first heading should be `<h1>` — the page title should always start at h1
7. `<div class="text">` should be `<p>` — it's a paragraph of text

Fixed:
```html
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/products">Products</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>Welcome to Our Store</h1>
    <p>We sell quality products...</p>
  </article>
</main>
```

## Q2
Three reasons (there are more):

1. **Accessibility** — Screen readers use semantic tags to create landmarks. Without them, a blind user must listen to the entire page linearly. With `<nav>`, `<main>`, `<aside>`, they can jump directly to any section. This isn't a nice-to-have — approximately 1 in 5 people have a disability.
2. **SEO** — Search engines use semantic structure to understand what content matters. A `<main>` with an `<article>` tells Google "this is the primary content." A wall of `<div>`s gives no signal, and your ranking suffers.
3. **Legal compliance** — WCAG 2.1 AA is legally required in many jurisdictions (ADA in the US, EN 301 549 in the EU, Accessibility Act in Canada). Non-semantic markup can fail WCAG criteria, exposing the company to lawsuits.
4. **Keyboard navigation** — Semantic elements like `<button>`, `<a>`, and `<input>` are natively focusable and operable with the keyboard. A `<div onclick="...">` is invisible to keyboard users unless you manually add `tabindex`, `role`, and key event handlers.
5. **Maintainability** — `<header>`, `<nav>`, `<main>` are self-documenting. Six months later, `<div class="hdr-wrp">` means nothing without context.

## Q3
Two heading levels are skipped:

- Under "Breakfast", `<h4>` should be `<h3>` — you went from h2 directly to h4, skipping h3
- Under "Dinner", `<h6>` should be `<h3>` — you went from h2 directly to h6, skipping h3, h4, and h5

Screen reader users navigating by heading level will think there are missing sections. The correct structure:

```html
<h1>Recipe Book</h1>
  <h2>Breakfast</h2>
    <h3>Pancakes</h3>
    <h3>Omelette</h3>
  <h2>Dinner</h2>
    <h3>Pasta</h3>
```

Remember: headings are for document structure, not for visual sizing. Use CSS to control how big a heading looks.

## Q4
Three problems:

1. **No labels on inputs** — `placeholder` is not a label. It disappears when the user types, and many screen readers don't reliably announce it. Fix: add `<label for="name">Full name</label>` and `<label for="email">Email address</label>` with matching `id` attributes on the inputs.
2. **The submit "button" is a div** — `<div class="btn">` is not focusable via keyboard, has no button role, and `onclick` doesn't fire on Enter/Space. Fix: use `<button type="submit">Submit</button>`. Native `<button>` gets keyboard support, focus management, and the correct ARIA role for free.
3. **No `<form>` element** — the inputs aren't wrapped in a `<form>`, which means pressing Enter won't submit, and assistive tech can't identify this as a form group.

Fixed:
```html
<form onsubmit="submitForm(); return false;">
  <label for="name">Full name</label>
  <input type="text" id="name" name="name" autocomplete="name">

  <label for="email">Email address</label>
  <input type="email" id="email" name="email" autocomplete="email">

  <button type="submit">Submit</button>
</form>
```

## Q5

1. **Company logo linking to homepage**: `alt="Acme Corp home"` — It's a functional image (it links somewhere), so the alt describes the destination/purpose, not the visual ("picture of a blue logo").
2. **Decorative wave divider**: `alt=""` — Purely decorative, conveys no information. Empty alt tells screen readers to skip it entirely.
3. **Product photo of red running shoes**: `alt="Red running shoes, $89.99"` — or more descriptively `alt="Nike Air Zoom red running shoes"`. The key is to convey what a sighted user would learn from the image. If the price is already in text nearby, no need to repeat it in alt.
4. **Screenshot of error message**: `alt="Error dialog showing the message: Connection timed out"` — The image contains text that the user needs to read, so the alt must include that text.
