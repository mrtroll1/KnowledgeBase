<h1>Native HTML</h1>
When designing web-pages, we are concerned with multiple side-metrics:
1. Accessibility 2. SEO 3. Cross-browser consistency 4. Legal (ehtical) compliance

General rules/guidelines:
<ul>
    <li>Use semantic tags: header, nav, main, section, aside, footer</li>
    <li>Logical heading outline: one h1 per page, no jumps</li>
    <li>Interactive elements use the right tags</li>
    <li>Images have meaningful alts</li>
    <li>Forms have labels</li>
    <li>Lists are real lists</li>
    <li>No redundant wrappers, no layout-breaking content overflow</li>
</ul>

<h1>Specificity</h1>
When styling a website, several conflicting rules might be applied to the same element.
CSS specificity is the scoring system browsers use to decide which selector wins when multiple rules target the same element.
The higher the specificity, the more priority the rule has.

```
* → 0-0-0-0
:where(.btn) - zero specificity wrapper → 0-0-0-0 
::before → 0-0-0-1
a → 0-0-0-1
ul li a → 0-0-0-3 (three element selectors) Descendant chain of type selectors. Matches any <a> inside an <li> inside a <ul>.
h1 + p → 0-0-0-2 Adjacent sibling combinator. Matches a <p> that comes immediately after an <h1>.
.btn → 0-0-1-0
[type="text"] → 0-0-1-0
:hover → 0-0-1-0
#header → 0-1-0-0
#header nav a → 0-1-0-2
#header .menu .item → 0-1-2-0
Inline: <div style="color: red"> → 1-0-0-0 (beats all author rules without !important)
```

General rules/guidelines:
<ul>
    <li>Keep selectors flat</li>
    <li>Pair BEM (block-element-model) with low specificity</li>
    <li>Make utilities intentionally strong (or weak)</li>
    <li>Avoid IDs in CSS</li>
    <li>Don’t chain classes unless needed</li>
</ul>

<h1>BEM</h1>
We can decompose most of the work with static CSS into styling either of the following:
<ul>
    <li><strong>Block:</strong> a standalone component that could live anywhere. Examples: card, button, navbar</li>
    <li><strong>Element:</strong> a part of a block that has no meaning on its own. Examples: card__title, navbar__item.</li>
    <li><strong>Modifier:</strong> a flag that changes appearance/behavior. Examples: card--featured, button--primary, navbar__item--active</li>
</ul>

Decomposing goes as follows
<ul>
    <li>Find the block boundary: can it be moved without breaking the page? It’s a block.</li>
    <li>List elements inside the block: titles, media, actions, etc.</li>
    <li>List variants (modifiers): sizes, states, themes, density, emphasis.</li>
    <li>Keep blocks independent: blocks never style inside other blocks by selector chaining.</li>
</ul>

<h1>Transitions & Animations</h1>
Transitions and animations allow us to make our website more engaging. However, incorrect use will 
1. wokr slowly 2. be fragile

General rules
<ul>
    <li>Avoid layout/paint animations, animate only transform and opacity</li>
    <li>Use consistent durations and ease-in/outs, define custom --ease-fast, dur-sm, dur-md, ...</li>
    <li>Transition declared on the resting (default) state, only properties that actually change are listed.</li>
    <li>Keyframes: animation-fill-mode: both when you need end state retained.</li>
    <li>Respect prefers-reduced-motion; provide instant or softer alternatives.</li>
    <li>Manually test on phone, tablet, desktop, Use DevTools Performance panel. </li>
</ul>