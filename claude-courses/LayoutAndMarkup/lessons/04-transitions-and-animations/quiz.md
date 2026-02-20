# Lesson 4: CSS Transitions & Animations — Quiz

## Q1
This hover effect works but stutters on mobile. Identify which properties are expensive and rewrite it to be performant, keeping the same visual result (card gets slightly larger, lifts up, and gains a shadow):

```css
.card {
  width: 300px;
  height: 200px;
  padding: 16px;
  transition: all 0.3s ease;
}
.card:hover {
  width: 315px;
  height: 210px;
  margin-top: -5px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
```

---

## Q2
What is `animation-fill-mode` and why is it needed? Given this CSS, describe exactly what the user sees before, during, and after the animation (including the 0.5s delay):

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal {
  opacity: 1;
  animation: fadeIn 0.4s ease-out 0.5s;
}
```

Now describe what changes if you add `animation-fill-mode: both`.

---

## Q3
A colleague's animation works but causes the entire page to repaint on every frame. The sidebar slides open by animating its `width`. Rewrite it to use a Composite-only approach:

```css
.sidebar {
  width: 0;
  overflow: hidden;
  transition: width 0.3s ease;
}
.sidebar.is-open {
  width: 280px;
}
```

---

## Q4
This page has animations but no `prefers-reduced-motion` handling. A user with a vestibular disorder visits the site. What do they experience, and how do you fix it?

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
```

---

## Q5
What's the difference between a CSS transition and a CSS animation? For each of these scenarios, which would you use and why?

1. A button background changes color on hover
2. A loading spinner rotates continuously
3. Three cards fade in one after another when the page loads
4. A tooltip smoothly appears when a user focuses an input
5. A notification slides in from the top, pauses, then slides back out
