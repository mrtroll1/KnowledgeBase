# Layout & Markup Learning — Outcome Tracker

## Solid Understanding
- **Semantic HTML**: Why it matters (accessibility, SEO, cross-browser, legal), semantic tags vs div soup (header, nav, main, article, section, aside, footer)
- **Heading hierarchy**: h1-h6 rules, logical document structure, one h1 per page
- **Form accessibility**: Labels for every input, fieldset/legend for grouping, ARIA attributes (aria-labelledby, aria-describedby)
- **Lists**: When to use ol, ul, dl — semantic meaning of each
- **Image alt text**: Meaningful descriptions vs empty alt for decorative images
- **CSS specificity**: Scoring system (inline > ID > class > element), how browsers resolve conflicts, specificity calculation
- **Specificity guidelines**: Flat selectors, avoid !important, avoid IDs for styling, debugging specificity issues
- **BEM methodology**: Block-Element-Modifier naming, finding block boundaries, listing elements, modifier variations
- **BEM architecture**: Keeping blocks independent, no cross-block dependencies, BEM + flat specificity = predictable CSS
- **Rendering pipeline**: Style → Layout → Paint → Composite, which properties trigger which stages
- **Animation performance**: Only transform and opacity are cheap (compositor-only), layout/paint properties cause jank
- **CSS transitions**: property, duration, timing-function, delay
- **CSS animations**: @keyframes, animation properties, animation-fill-mode
- **Motion accessibility**: prefers-reduced-motion media query

## Partial / Needs Refinement
- **Flexbox**: Not in the checklist — `display: flex`, axis model, `justify-content`, `align-items`, `flex-grow/shrink/basis`. This is the most-used layout tool in modern CSS and a critical gap
- **Grid**: Not in the checklist — `display: grid`, `grid-template`, `fr` units, `auto-fit/auto-fill`. Essential for two-dimensional layouts
- **Responsive design**: Media queries, mobile-first approach, fluid typography, container queries — the checklist doesn't cover responsive patterns at all
- **CSS custom properties (variables)**: `--color-primary`, theming, scoping — not covered but fundamental to modern CSS architecture
- **Stacking context**: `z-index` behavior, what creates new stacking contexts — often misunderstood and not in the checklist
- **Logical properties**: `margin-inline`, `padding-block` — for internationalization (RTL support)

## Gaps — Not Yet Covered
- **Flexbox** — the primary 1D layout system
- **Grid** — the primary 2D layout system
- **Responsive design** — media queries, breakpoints, fluid layouts
- **CSS custom properties** — variables, theming, scoping
- **Stacking context & z-index** — layering behavior
- **Logical properties** — RTL-friendly layout
- **CSS container queries** — component-level responsive design
- **Web fonts** — loading strategies, FOIT/FOUT, font-display
- **Dark mode** — color-scheme, prefers-color-scheme

## Lessons Completed
- **Lesson 01 — Semantic HTML**: Covered via checklist (layout-markup/all.md — HTML section)
- **Lesson 02 — CSS Specificity**: Covered via checklist (layout-markup/all.md — specificity section)
- **Lesson 03 — BEM**: Covered via checklist (layout-markup/all.md — BEM section)
- **Lesson 04 — Transitions & Animations**: Covered via checklist (layout-markup/all.md — animations section)
