# Lesson 2: Template Syntax — Answers

## Q1
- **A: ✅** — arithmetic expression, returns a value
- **B: ❌** — `if` is a statement, not an expression
- **C: ✅** — ternary is an expression
- **D: ❌** — `let` is a declaration/statement
- **E: ✅** — method chain that returns a value (a number)

Rule: if it can go on the right side of `=` in JS, it's an expression and works in `{{ }}`.

## Q2
`v-if` removes the element from the DOM entirely. `v-show` keeps it in the DOM but sets `display: none`. Use `v-show` when you toggle frequently (e.g., a loading spinner that flickers) because CSS is cheaper than DOM insertion. Use `v-if` for content that's rarely shown (e.g., an admin panel) because it avoids rendering cost for content most users never see.

## Q3
```vue
<form @submit.prevent.stop="submitForm">...</form>
```
Modifiers chain — `.prevent` calls `preventDefault()`, `.stop` calls `stopPropagation()`. The handler function now only contains business logic, no event plumbing.

## Q4
It spreads the object as individual attributes on the element. Equivalent to:
```js
el.setAttribute('id', 'app')
el.setAttribute('class', 'container')
el.setAttribute('data-theme', 'dark')
```
Useful when attributes come from a dynamic object (e.g., passed as props from a parent or returned from a composable).

## Q5
**XSS vulnerability.** A user could submit `<script>document.cookie</script>` or `<img onerror="maliciousCode()">` and it would execute in other users' browsers. Fix: use text interpolation `{{ userComment }}` instead (auto-escapes HTML), or sanitize the HTML server-side with a library like DOMPurify before storing/rendering it.
