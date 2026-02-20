# Lesson 2: CSS Specificity — Understanding the Cascade

## The Problem — Why Does My CSS Not Apply?

You write this:

```css
.card .title {
  color: blue;
}
```

Then later:

```css
.title {
  color: red;
}
```

The title stays **blue**. You add `!important`. Now it's red, but next week another developer adds `!important` to override yours. Soon the stylesheet is a battlefield of `!important` declarations and nobody can predict what styles will apply.

**Without understanding specificity**, you guess, you slap on `!important`, you add more and more selectors until something works. **With specificity knowledge**, you know exactly which rule wins and why — and you write CSS that doesn't fight itself.

---

## The Specificity Scoring System

Every CSS selector gets a specificity score. When two rules target the same element, the one with the **higher score wins**. The score has four columns:

```
     Inline    IDs    Classes    Elements
       ↓        ↓       ↓          ↓
      (A)      (B)     (C)        (D)
```

| Category | What counts | Weight |
|---|---|---|
| A — Inline styles | `style="..."` attribute in HTML | Highest |
| B — IDs | `#header`, `#nav` | High |
| C — Classes, attributes, pseudo-classes | `.card`, `[type="text"]`, `:hover`, `:focus` | Medium |
| D — Elements, pseudo-elements | `div`, `p`, `h1`, `::before`, `::after` | Lowest |

### How to calculate

Count each type in the selector, left to right:

```
Selector                      A   B   C   D    Score
─────────────────────────────────────────────────────
p                             0   0   0   1    0,0,0,1
.card                         0   0   1   0    0,0,1,0
#header                       0   1   0   0    0,1,0,0
style="color: red"            1   0   0   0    1,0,0,0
─────────────────────────────────────────────────────
.card .title                  0   0   2   0    0,0,2,0
#nav .link                    0   1   1   0    0,1,1,0
div.card > p.text             0   0   2   2    0,0,2,2
#sidebar #nav .link:hover     0   2   2   0    0,2,2,0
```

**Key insight**: The columns don't overflow into each other. 100 classes (0,0,100,0) will never beat one ID (0,1,0,0). One ID always beats any number of classes. One inline style always beats any number of IDs.

---

## How Browsers Resolve Conflicts

When multiple rules target the same element and property, the browser follows this cascade:

```
1. Origin & Importance
   └─ !important user-agent > !important author > author > user-agent

2. Specificity
   └─ Higher score wins

3. Source Order
   └─ If specificity is equal, the LAST rule in the stylesheet wins
```

### Example: Walking Through a Conflict

```html
<p id="intro" class="text highlight">Welcome</p>
```

```css
p { color: black; }                   /* 0,0,0,1 */
.text { color: gray; }               /* 0,0,1,0 — beats p */
.highlight { color: orange; }        /* 0,0,1,0 — same as .text, but later → wins */
#intro { color: blue; }              /* 0,1,0,0 — beats all classes */
p#intro.text { color: green; }       /* 0,1,1,1 — beats #intro alone */
```

Result: **green**. It has the highest specificity (0,1,1,1).

If you then add:

```css
.text { color: red !important; }     /* !important jumps to the top of the cascade */
```

Result: **red**. `!important` overrides all non-important rules regardless of specificity.

---

## Specificity Calculation Examples

Let's work through several real-world selectors:

### Example 1: Navigation link

```css
nav ul li a { }
```

- `nav` = element (D) → 1
- `ul` = element (D) → 1
- `li` = element (D) → 1
- `a` = element (D) → 1

Score: **0,0,0,4**

### Example 2: Navigation link with class

```css
.nav-list a { }
```

- `.nav-list` = class (C) → 1
- `a` = element (D) → 1

Score: **0,0,1,1** — beats Example 1, and is also more readable and maintainable.

### Example 3: Button variants

```css
/* A: Over-specific — hard to override */
div.container main section.content button.btn.primary { }
/* Score: 0,0,3,4 */

/* B: Flat and predictable */
.btn-primary { }
/* Score: 0,0,1,0 */
```

Version B is easier to understand, easier to override with `.btn-primary:hover` (0,0,2,0), and doesn't break when you change the HTML structure.

### Example 4: The ID trap

```css
/* A: Using an ID */
#signup-form .input { color: black; }
/* Score: 0,1,1,0 */

/* Now you need to override it for dark mode: */
.dark-mode .input { color: white; }
/* Score: 0,0,2,0 — LOSES to the ID selector */

/* So you're forced to escalate: */
#signup-form .dark-mode .input { color: white; }
/* Or worse: */
.input { color: white !important; }
```

**Without the ID**, the dark-mode override would have worked at the class level, with no escalation needed.

---

## Guidelines for Maintainable Specificity

### 1. Keep selectors flat

```css
/* Bad — deeply nested, mirrors HTML structure */
header nav ul li a.active { }

/* Good — one class, doesn't depend on HTML nesting */
.nav-link--active { }
```

**Why?** Flat selectors are low-specificity and easy to override. Deep selectors couple your CSS to your HTML structure — rearrange the HTML and the styles break.

### 2. Avoid IDs for styling

```css
/* Bad — can only be overridden by another ID or !important */
#sidebar { width: 300px; }

/* Good — easy to override at the same specificity level */
.sidebar { width: 300px; }
```

IDs are fine for JavaScript hooks and `<label for="">` — just don't use them in CSS selectors.

### 3. Avoid !important

`!important` is a **specificity escape hatch** — it wins any specificity battle but creates a new one you can only win with another `!important`. It should be reserved for:

- Utility classes in a design system (e.g., `.hidden { display: none !important; }`)
- Overriding third-party CSS you can't modify

If you need `!important` to make your own code work, your selectors are too specific somewhere.

### 4. Use a consistent specificity "layer"

The ideal CSS codebase has most selectors at the same specificity level — single classes (0,0,1,0). This means the only tiebreaker is source order, which is predictable and intentional.

```
Element selectors      0,0,0,X    ← Resets, base typography
Single class           0,0,1,0    ← Components, layouts (the sweet spot)
Two classes            0,0,2,0    ← Variations, states (.card.is-active)
IDs                    0,1,0,0    ← Avoid for styling
Inline styles          1,0,0,0    ← Avoid (except dynamically via JS)
!important             ∞          ← Nuclear option
```

---

## Debugging Specificity Issues

### Using DevTools

1. Open DevTools → Elements panel → select the element
2. Look at the Styles panel on the right
3. Styles are listed **in specificity order** (winning rule on top)
4. Overridden properties show a ~~strikethrough~~
5. Hover over a selector to see its specificity score (Chrome)

### A: Diagnosing a "my style doesn't apply" bug

```css
/* You wrote this */
.btn { background: blue; }

/* But the button is green. DevTools shows: */
.form .actions .btn { background: green; }    /* 0,0,3,0 ← WINNING */
.btn { background: blue; }                    /* 0,0,1,0 ← overridden */
```

**Fix**: Don't increase your specificity to match. Instead, ask why the other selector is so specific and flatten it. If it's third-party CSS you can't change, use one extra class rather than escalating to IDs or `!important`.

---

## Key Takeaways

1. **Specificity is a scoring system** — inline (A), IDs (B), classes (C), elements (D). Higher column always wins regardless of lower columns
2. **Source order is the tiebreaker** — when specificity is equal, the last rule wins
3. **Keep selectors flat** — single-class selectors (0,0,1,0) are the sweet spot
4. **Don't use IDs for styling** — they create specificity you can't easily override
5. **!important is a sign of a problem** — fix the specificity conflict, don't override it with a bigger hammer
6. **DevTools shows you the cascade** — when a style doesn't apply, check which rule is winning and why
