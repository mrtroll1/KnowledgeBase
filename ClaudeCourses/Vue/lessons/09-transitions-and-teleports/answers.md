# Lesson 9: Transitions & Teleports — Answers

## Q1
By default, the entering element starts its transition at the same time as the leaving element. Both exist in the DOM simultaneously, causing visual overlap or layout shifts. `mode="out-in"` sequences them: the old element completes its leave transition and is removed, *then* the new element enters. This ensures only one element is visible at a time.

## Q2
```css
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(-100%);  /* Start off-screen left */
}
.slide-leave-to {
  transform: translateX(100%);   /* Exit off-screen right */
}
```
`-enter-from` is the starting state, `-leave-to` is the ending state. The `-active` classes define the transition properties.

## Q3
The `.list-move` class. `TransitionGroup` applies a move class when items change position, but you need CSS to animate it:
```css
.list-move {
  transition: transform 0.5s ease;
}
```
Without this, Vue applies `transform` to move items but the transform snaps instantly because there's no transition defined for it.

## Q4
Use `<Teleport to="body">` to render the modal as a direct child of `<body>`, escaping the parent's `overflow: hidden` and stacking context. The component stays in its logical position in the code (inside ConfirmDialog), but the rendered DOM output is appended to `<body>`. This solves z-index, overflow, and positioning issues without any restructuring.

## Q5
Use JS hooks when: (1) You need dynamic durations based on data (CSS can't read JS variables). (2) You're using animation libraries like GSAP that manage their own timing. (3) You need complex multi-step sequences (staggered animations). (4) You need to integrate with canvas or WebGL animations. For simple fades, slides, and scales — CSS transitions are simpler and more performant.
