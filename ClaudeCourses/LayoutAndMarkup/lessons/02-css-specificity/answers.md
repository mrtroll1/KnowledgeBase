# Lesson 2: CSS Specificity — Answers

## Q1
Calculation:

```
a) div p span                    → 0,0,0,3  (3 elements)
b) .card .title                  → 0,0,2,0  (2 classes)
c) #main .card .title            → 0,1,2,0  (1 ID + 2 classes)
d) .card > .title:hover          → 0,0,3,0  (2 classes + 1 pseudo-class)
e) div#main p.intro::first-line  → 0,1,1,3  (1 ID + 1 class + 2 elements + 1 pseudo-element)
```

Ranking lowest to highest:
1. `a)` 0,0,0,3
2. `b)` 0,0,2,0
3. `d)` 0,0,3,0
4. `e)` 0,1,1,3
5. `c)` 0,1,2,0

Note: `e)` vs `c)` — both have 1 ID, but `c)` has 2 classes vs `e)`'s 1 class, so `c)` wins. The 3 elements in `e)` don't help because column C (classes) is compared before column D (elements).

## Q2
Step by step:

```
#content p       → 0,1,0,1  (1 ID + 1 element)
.intro.highlight → 0,0,2,0  (2 classes)
p.intro          → 0,0,1,1  (1 class + 1 element)
```

The text is **blue**. `#content p` has specificity 0,1,0,1. The ID in column B beats any number of classes in column C. Even though `.intro.highlight` has 2 classes, it can't outweigh a single ID.

This is precisely why IDs in CSS are problematic — they create a specificity level that classes can never overcome without resorting to their own IDs or `!important`.

## Q3
It's a specificity time bomb because every rule starts at 0,2,X,0 (two IDs). This means:

1. **To override any of these styles**, you need at least two IDs in your selector. Simple class-based overrides like `.link.active { color: yellow; }` (0,0,2,0) will always lose.
2. **Component reuse is broken** — if you move `.link` outside of `#header #nav`, the styles stop applying. The CSS is tightly coupled to the HTML structure.
3. **Escalation is inevitable** — the next developer who needs to override will add a third ID, or reach for `!important`, and the arms race begins.

The fix is to replace IDs with classes: `.header-nav .link--active`, `.dropdown-link`, `.footer-link`. Everything stays at the class level (0,0,X,0), overrides are straightforward, and components can be moved anywhere.

## Q4
The third-party rule has specificity 0,1,2,0 (1 ID + 2 classes). To beat it without `!important`, you need a selector with higher specificity.

```css
#app .signup-section .form-container .input-field {
  border: 2px solid blue;
}
/* Score: 0,1,3,0 — beats 0,1,2,0 */
```

The math: 1 ID (`#app`) + 3 classes (`.signup-section`, `.form-container`, `.input-field`) = 0,1,3,0, which is one class higher than the third-party 0,1,2,0.

Alternatively, you could duplicate a class to increase specificity without depending on a specific ancestor:

```css
#app .form-container .input-field.input-field {
  border: 2px solid blue;
}
/* Score: 0,1,3,0 — same result, .input-field counted twice */
```

Both approaches work. The key is that you're matching the ID (unavoidable since the third-party uses one) and adding just enough class-level specificity to win.

## Q5
The problem is **escalating specificity**. Each rule is more specific than the last:

```
.btn                              → 0,0,1,0
.page .sidebar .btn               → 0,0,3,0
.page .main .btn                  → 0,0,3,0
.page .main .section .btn         → 0,0,4,0
.page .main .section .btn:hover   → 0,0,5,0
```

When you add `.promo .btn` (0,0,2,0), it loses to `.page .sidebar .btn` (0,0,3,0), `.page .main .btn` (0,0,3,0), and `.page .main .section .btn` (0,0,4,0). The "promo" style only works if `.promo` is not inside `.page .main` or `.page .sidebar` — which it likely is.

The fix is to keep selectors flat from the start:

```css
.btn { background: gray; }
.btn--sidebar { background: green; }
.btn--primary { background: blue; }
.btn--featured { background: purple; }
.btn--featured:hover { background: darkpurple; }
.btn--promo { background: red; }
```

Every variant is at 0,0,1,0 (or 0,0,2,0 with pseudo-class). Override order is controlled by source order, which is predictable. This is the BEM approach — covered in the next lesson.
