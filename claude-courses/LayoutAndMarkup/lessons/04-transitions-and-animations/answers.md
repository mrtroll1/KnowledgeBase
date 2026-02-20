# Lesson 4: CSS Transitions & Animations — Answers

## Q1
Expensive properties identified:

- `width: 315px` — triggers **Layout** (recalculates size of card and everything around it)
- `height: 210px` — triggers **Layout**
- `margin-top: -5px` — triggers **Layout** (pushes the card up and shifts siblings)
- `transition: all` — transitions every changing property, including unintended ones

Performant rewrite using transform (Composite-only):

```css
.card {
  width: 300px;
  height: 200px;
  padding: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: scale(1.05) translateY(-5px);   /* Composite only */
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);   /* Paint only, no Layout */
}
```

`scale(1.05)` replaces the width/height increase (300 * 1.05 = 315, 200 * 1.05 = 210). `translateY(-5px)` replaces the negative margin. Both are `transform` operations that skip Layout and Paint entirely, running on the GPU. `box-shadow` triggers Paint but not Layout, which is acceptable for a hover effect.

Also fixed: `transition: all` replaced with explicit properties.

## Q2
`animation-fill-mode` controls what styles apply **before the animation starts** (during the delay) and **after the animation ends**.

**Without fill-mode** (default `none`):

1. **Before (0s - 0.5s delay)**: Modal is visible at `opacity: 1` (its declared style)
2. **Animation starts (0.5s)**: Opacity jumps to 0 instantly (the `from` state) — a visible flash/blink
3. **During (0.5s - 0.9s)**: Fades from 0 to 1
4. **After (0.9s+)**: Modal stays at `opacity: 1` (reverts to declared style)

The user sees a fully visible modal, then it blinks off at 0.5s, then fades back in. Jarring.

**With `animation-fill-mode: both`**:

1. **Before (0s - 0.5s delay)**: Modal starts at `opacity: 0` (the `from` state is applied backwards during the delay)
2. **Animation starts (0.5s)**: Fades from 0 to 1
3. **During (0.5s - 0.9s)**: Smooth fade-in
4. **After (0.9s+)**: Modal stays at `opacity: 1` (the `to` state is held forwards)

The user sees nothing, then a smooth fade-in. No blink.

`backwards` applies the `from` state during the delay. `forwards` holds the `to` state after completion. `both` does both — which is almost always what you want.

## Q3
The `width` animation triggers Layout on every frame because the browser must recalculate how much space the sidebar occupies and reflow the content next to it.

Composite-only rewrite:

```css
.sidebar {
  width: 280px;                    /* Always its final width */
  transform: translateX(-100%);    /* Moved off-screen to the left */
  transition: transform 0.3s ease;
}
.sidebar.is-open {
  transform: translateX(0);        /* Slides into view */
}
```

The sidebar always occupies its full 280px in the DOM, but `transform: translateX(-100%)` visually hides it off-screen. When `.is-open` is added, it slides in. The `transform` is Composite-only — no Layout, no Paint, just the GPU moving a layer.

If the sidebar shouldn't take up DOM space when closed, you can wrap the layout so the main content fills the gap:

```css
.layout {
  display: flex;
}
.sidebar {
  width: 280px;
  margin-left: -280px;                /* Collapsed out of flow */
  transform: translateX(0);
  transition: margin-left 0s 0.3s,    /* Snap margin after slide-out */
              transform 0.3s ease;
}
.sidebar.is-open {
  margin-left: 0;                     /* Snap into flow */
  transform: translateX(0);
  transition: margin-left 0s 0s,      /* Snap margin immediately */
              transform 0.3s ease;    /* Animate the slide */
}
```

However, the simplest high-performance pattern is the pure `translateX` approach and accepting the sidebar's space in the layout.

## Q4
What the user experiences:

1. **`parallaxScroll` infinite animation** — continuous background movement. This is the most harmful. Users with vestibular disorders can experience nausea, dizziness, and disorientation from large-scale continuous motion.
2. **`bounceIn` on notifications** — sudden bouncing motion can trigger discomfort, especially if notifications appear frequently.
3. **`btn:hover` background transition** — this is a subtle color change. Generally safe for users with motion sensitivities.

Fix using `prefers-reduced-motion`:

```css
.hero-bg {
  animation: parallaxScroll 20s linear infinite;
}
.notification {
  animation: bounceIn 0.5s ease;
}
.btn:hover {
  transition: background 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .hero-bg {
    animation: none;  /* Remove continuous motion entirely */
  }
  .notification {
    animation: none;  /* Replace bounce with instant appearance */
    /* Or use a gentle fade instead: */
    /* animation: fadeIn 0.3s ease; */
  }
  /* The button hover transition is subtle enough to keep, */
  /* but could be removed if desired: */
  /* .btn:hover { transition: none; } */
}
```

Even better — use the opt-in pattern where no-motion is the default:

```css
.hero-bg { /* no animation by default */ }
.notification { /* appears instantly by default */ }

@media (prefers-reduced-motion: no-preference) {
  .hero-bg { animation: parallaxScroll 20s linear infinite; }
  .notification { animation: bounceIn 0.5s ease; }
  .btn:hover { transition: background 0.2s ease; }
}
```

This is safer because if a browser doesn't support the media query, users get no motion rather than all motion.

## Q5
**Transition**: Smoothly interpolates between two states when a property value changes. Requires a trigger (hover, focus, class change). Goes from A to B and back. Cannot loop, cannot have multiple steps.

**Animation**: Runs independently using `@keyframes`. Can auto-play, loop, have multiple steps, pause, reverse, and run without user interaction.

Scenario breakdown:

1. **Button background on hover** → **Transition**. It's a simple A→B state change triggered by hover. `transition: background 0.2s ease`.

2. **Loading spinner** → **Animation**. It needs to loop continuously (`infinite`) with no user trigger. `animation: spin 0.8s linear infinite`.

3. **Cards fading in on page load** → **Animation**. No user trigger (auto-play on load), needs staggered delays, and uses `animation-fill-mode: both` to keep cards hidden before their delay. Transitions can't auto-play.

4. **Tooltip on focus** → **Transition**. Triggered by a state change (`:focus`), goes from hidden to visible and back. `transition: opacity 0.2s ease, transform 0.2s ease`.

5. **Notification slide-in, pause, slide-out** → **Animation**. Multiple stages (in → hold → out) require keyframe percentages like `0% { top: -100% } 10% { top: 0 } 90% { top: 0 } 100% { top: -100% }`. Transitions can only go A→B, not A→B→A with a pause in the middle.
