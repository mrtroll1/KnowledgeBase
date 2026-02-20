# Lesson 4: CSS Transitions & Animations — Smooth, Performant Motion

## The Problem — Why Do Some Animations Feel Janky?

You add a simple hover effect:

```css
.card:hover {
  width: 320px;
  height: 400px;
  margin-left: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
```

It works, but it stutters — especially on mobile. The animation feels "heavy." Meanwhile, another site has cards that glide smoothly with no jank at all.

**Without understanding the rendering pipeline**, you animate whatever properties look right and hope for the best. **With pipeline knowledge**, you know that `width`, `height`, and `margin` trigger expensive reflows, while `transform` and `opacity` are nearly free — and you get 60fps every time.

---

## The Rendering Pipeline

Every time the browser updates the screen, it runs through up to four stages:

```
Style → Layout → Paint → Composite
  │        │        │        │
  │        │        │        └─ Move pre-painted layers around (GPU)
  │        │        └─ Fill in pixels (colors, shadows, text)
  │        └─ Calculate sizes & positions of every element
  └─ Figure out which CSS rules apply to each element
```

### What each stage costs

| Stage | Triggered by | Cost |
|---|---|---|
| **Layout** (reflow) | `width`, `height`, `margin`, `padding`, `top`, `left`, `font-size`, `display` | Expensive — recalculates geometry of the element AND its neighbors |
| **Paint** | `color`, `background`, `box-shadow`, `border-radius`, `visibility` | Medium — redraws pixels but doesn't move things around |
| **Composite** | `transform`, `opacity` | Cheap — the GPU moves or fades pre-painted layers, no recalculation |

### A: Animating expensive properties

```css
.card {
  width: 300px;
  height: 350px;
  margin-left: 0;
  transition: all 0.3s ease;
}
.card:hover {
  width: 320px;       /* triggers Layout → Paint → Composite */
  height: 400px;      /* triggers Layout → Paint → Composite */
  margin-left: 10px;  /* triggers Layout → Paint → Composite */
}
```

Every frame: the browser recalculates the layout of the card AND every element around it, then repaints, then composites. At 60fps that's 16.6ms per frame — layout recalculations easily blow that budget.

### B: Animating with transform and opacity

```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: scale(1.05) translateX(10px);  /* Composite only */
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);  /* Paint only, no layout */
}
```

`transform` and `opacity` skip Layout and Paint entirely. The browser promotes the element to its own GPU layer and just moves/fades it — buttery smooth even on low-end devices.

**Rule of thumb**: If you can achieve the visual effect with `transform` (scale, translate, rotate) or `opacity`, always prefer those over `width`, `height`, `margin`, `top`, `left`.

---

## CSS Transitions

A transition smoothly animates a property from one value to another when that property changes (usually on hover, focus, or class toggle).

### Syntax

```css
.element {
  transition: <property> <duration> <timing-function> <delay>;
}
```

| Part | What it does | Example |
|---|---|---|
| `property` | Which CSS property to animate | `transform`, `opacity`, `background-color` |
| `duration` | How long the animation takes | `0.3s`, `200ms` |
| `timing-function` | The acceleration curve | `ease`, `ease-in-out`, `linear`, `cubic-bezier(...)` |
| `delay` | Wait before starting | `0s`, `0.1s` |

### Example: Button hover

```css
/* A: No transition — instant, jarring */
.btn {
  background: #1976d2;
  color: white;
}
.btn:hover {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* B: With transition — smooth, professional */
.btn {
  background: #1976d2;
  color: white;
  transition: background 0.2s ease,
              transform 0.2s ease,
              box-shadow 0.2s ease;
}
.btn:hover {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
```

### Timing functions visualized

```
linear          ease-in         ease-out        ease-in-out
│    ╱           │      ╱        │  ╱            │    ╱─╮
│   ╱            │    ╱          │ ╱             │   ╱   │
│  ╱             │  ╱            │╱              │  ╱    │
│ ╱              │╱              │               │╱      │
└────────        └────────       └────────       └────────
Constant speed   Starts slow    Starts fast     Slow-fast-slow
                 ends fast      ends slow       (most natural)
```

### Don't use `transition: all`

```css
/* Bad — transitions EVERY property change, including ones you didn't intend */
.card { transition: all 0.3s ease; }

/* Good — explicit about what animates */
.card { transition: transform 0.3s ease, opacity 0.3s ease; }
```

`transition: all` can cause unexpected animations (e.g., `color` or `padding` changes you didn't mean to animate), and it prevents the browser from optimizing because it has to watch every property.

---

## CSS Animations with @keyframes

Transitions go from A to B. Animations can go from A to B to C to D, loop, reverse, and run independently of user interaction.

### Syntax

```css
@keyframes animation-name {
  from { /* starting state */ }
  to   { /* ending state */ }
}

/* Or with percentage stops */
@keyframes animation-name {
  0%   { /* start */ }
  50%  { /* midpoint */ }
  100% { /* end */ }
}
```

Apply it to an element:

```css
.element {
  animation: name duration timing-function delay iteration-count direction fill-mode;
}
```

### Example: Fade-in on page load

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  animation: fadeInUp 0.6s ease-out;
}
```

### Example: Loading spinner

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### Example: Pulse effect

```css
@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.notification-badge {
  animation: pulse 2s ease-in-out infinite;
}
```

### Animation properties reference

| Property | Values | What it does |
|---|---|---|
| `animation-name` | `fadeIn`, `spin`, etc. | Which `@keyframes` to use |
| `animation-duration` | `0.3s`, `500ms` | How long one cycle takes |
| `animation-timing-function` | `ease`, `linear`, `cubic-bezier()` | Acceleration curve |
| `animation-delay` | `0s`, `0.5s` | Wait before starting |
| `animation-iteration-count` | `1`, `3`, `infinite` | How many times to play |
| `animation-direction` | `normal`, `reverse`, `alternate` | Direction of playback |
| `animation-fill-mode` | `none`, `forwards`, `backwards`, `both` | What state to hold before/after |

---

## animation-fill-mode — The Most Misunderstood Property

By default, an animation's styles **only apply during the animation**. Before it starts and after it ends, the element snaps back to its original styles.

```css
@keyframes slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
```

### Without fill-mode (default: `none`)

```
Before animation: element at original position (visible)
During animation: slides in from left
After animation:  SNAPS BACK to original position (visible)
                  ^ jarring — the animation did nothing permanent
```

### With `animation-fill-mode: forwards`

```
Before animation: element at original position (visible)
During animation: slides in from left
After animation:  STAYS at the "to" state (translateX(0), opacity 1)
```

### With `animation-fill-mode: backwards`

```
Before animation: element shows the "from" state (off-screen, transparent)
                  ^ useful when there's a delay
During animation: slides in from left
After animation:  snaps back to original position
```

### With `animation-fill-mode: both`

```
Before animation: "from" state (off-screen)
During animation: slides in from left
After animation:  stays at "to" state
                  ^ usually what you want
```

### Practical example: staggered card entrance

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeInUp 0.5s ease-out both; /* "both" is key */
}
.card:nth-child(1) { animation-delay: 0s; }
.card:nth-child(2) { animation-delay: 0.1s; }
.card:nth-child(3) { animation-delay: 0.2s; }
.card:nth-child(4) { animation-delay: 0.3s; }
```

Without `both`, the second, third, and fourth cards would be **visible** during their delay period, then jump to the "from" state, then animate in. With `both`, they start hidden and animate in sequentially.

---

## prefers-reduced-motion — Accessibility for Motion

Some users experience motion sickness, vertigo, or seizures from animations. The `prefers-reduced-motion` media query lets you respect their system preferences.

### A: Ignoring motion preferences (harmful)

```css
.hero {
  animation: bounce 1s ease infinite;
}
/* Users with vestibular disorders get nauseous. No opt-out. */
```

### B: Respecting motion preferences (accessible)

```css
.hero {
  animation: bounce 1s ease infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero {
    animation: none;
  }
}
```

### A better pattern — opt-in to motion

Instead of adding animations and then removing them, start with no motion and add it only for users who haven't requested reduction:

```css
/* Base: no motion */
.card {
  opacity: 1;
  transform: none;
}

/* Add motion only for users who are OK with it */
@media (prefers-reduced-motion: no-preference) {
  .card {
    animation: fadeInUp 0.5s ease-out both;
  }

  .btn {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
}
```

This approach is safer — if the media query isn't supported, users get the non-animated version by default.

### What to keep vs. what to remove

| Keep (reduced-motion) | Remove (reduced-motion) |
|---|---|
| Opacity fades (gentle) | Sliding, bouncing, zooming |
| Color transitions | Parallax scrolling |
| Instant state changes | Auto-playing carousels |

---

## Performance Testing Tips

### 1. Use DevTools Performance panel

1. Open DevTools → Performance tab
2. Click Record, interact with the animation, then Stop
3. Look at the **Frames** section — each bar should be under 16.6ms (60fps)
4. Long bars in **Layout** or **Paint** = expensive properties being animated

### 2. Spot layout thrashing

In the Performance panel, purple bars labeled "Layout" during an animation mean you're triggering reflow. Switch to `transform` and they'll disappear.

### 3. Check the Rendering panel

1. DevTools → More tools → Rendering
2. Enable **"Paint flashing"** — green rectangles show areas being repainted
3. Enable **"Layout Shift Regions"** — blue rectangles show layout changes
4. If an animation causes green/blue flashing across the entire page, it's expensive

### 4. Force GPU acceleration (use sparingly)

```css
.animated-element {
  will-change: transform;
}
```

`will-change` tells the browser to promote the element to its own compositing layer ahead of time. Use it for elements you **know** will animate. Don't apply it to everything — each layer costs GPU memory.

### A: Bad — animating layout properties

```css
/* DevTools will show Layout + Paint on every frame */
.sidebar {
  width: 0;
  transition: width 0.3s ease;
}
.sidebar.open {
  width: 300px;
}
```

### B: Good — same visual result with transform

```css
/* DevTools will show Composite only */
.sidebar {
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.sidebar.open {
  transform: translateX(0);
}
```

Visually identical. The sidebar slides in from the left. But version B is dramatically cheaper because it never triggers Layout or Paint.

---

## Key Takeaways

1. **The rendering pipeline has four stages** — Style, Layout, Paint, Composite. Animate at the cheapest stage possible
2. **Only `transform` and `opacity` are Composite-only** — everything else triggers Layout or Paint, which is expensive
3. **Transitions** are for A→B state changes (hover, focus, class toggle). Be explicit about which properties to transition
4. **@keyframes animations** are for multi-step, looping, or auto-playing motion. Use the shorthand: `animation: name duration timing delay count direction fill`
5. **`animation-fill-mode: both`** is almost always what you want — it holds the start state during delay and the end state after completion
6. **Respect `prefers-reduced-motion`** — always provide a reduced-motion alternative. The opt-in pattern (no motion by default, add it via `no-preference`) is the safest approach
7. **Use DevTools** to verify performance — look for Layout/Paint bars during animations and switch to transforms if they appear
