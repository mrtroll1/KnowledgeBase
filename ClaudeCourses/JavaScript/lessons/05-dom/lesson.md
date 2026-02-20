# Lesson 5: DOM Manipulation

## The Problem — The DOM Is Slow (If You're Careless)

The DOM (Document Object Model) is a tree representation of your HTML. JavaScript can read and modify it — but every modification can trigger the browser to recalculate styles, recalculate layout, repaint pixels, and composite layers. This process is expensive.

**Without understanding the rendering pipeline**, you'd write DOM code that accidentally forces the browser to recalculate layout hundreds of times per frame, causing jank and dropped frames.

**With that understanding**, you batch your changes, avoid layout thrashing, and keep animations at 60fps.

---

## Finding Elements

### The Modern Way: `querySelector` / `querySelectorAll`

```js
// Single element — returns first match or null
const header = document.querySelector('.header');
const submitBtn = document.querySelector('#submit-btn');
const firstInput = document.querySelector('form input[type="text"]');

// Multiple elements — returns a static NodeList
const allCards = document.querySelectorAll('.card');
allCards.forEach(card => card.classList.add('visible'));
```

### The Old Way: `getElementById` / `getElementsByClassName`

```js
const header = document.getElementById('header');           // by ID
const cards = document.getElementsByClassName('card');       // live HTMLCollection
const divs = document.getElementsByTagName('div');          // live HTMLCollection
```

| Method | Returns | Live/Static | CSS Selectors |
|--------|---------|------------|---------------|
| `querySelector` | single Element | N/A | Yes |
| `querySelectorAll` | NodeList | **Static** | Yes |
| `getElementById` | single Element | N/A | No (ID only) |
| `getElementsByClassName` | HTMLCollection | **Live** | No (class only) |
| `getElementsByTagName` | HTMLCollection | **Live** | No (tag only) |

**Without understanding live vs static**: A live HTMLCollection updates automatically when the DOM changes. This sounds convenient, but it causes subtle bugs:

```js
// DANGEROUS — live collection changes as you modify the DOM
const items = document.getElementsByClassName('item');
// items.length starts at 5

for (let i = 0; i < items.length; i++) {
  items[i].classList.remove('item'); // removing 'item' class shrinks the live collection!
  // i increments, but items.length decreases — you skip every other element
}

// SAFE — static NodeList doesn't change
const items = document.querySelectorAll('.item');
items.forEach(item => item.classList.remove('item')); // works correctly
```

Prefer `querySelector`/`querySelectorAll` — they accept any CSS selector and `querySelectorAll` returns a static snapshot.

---

## Creating and Modifying Elements

```js
// Create
const card = document.createElement('div');
card.className = 'card';
card.textContent = 'Hello world';

// Modify attributes
card.setAttribute('data-id', '42');
card.id = 'main-card';

// Modify styles
card.style.backgroundColor = '#f0f0f0';
card.style.padding = '16px';

// Modify classes (prefer classList over className)
card.classList.add('active', 'visible');
card.classList.remove('hidden');
card.classList.toggle('expanded');
card.classList.contains('active'); // true

// Insert into the DOM
document.body.appendChild(card);

// Insert at specific positions
parent.insertBefore(newElement, referenceElement);
parent.append(el1, el2, 'text');     // append multiple, accepts strings
parent.prepend(el);                   // insert as first child
element.before(otherEl);              // insert as previous sibling
element.after(otherEl);               // insert as next sibling

// Remove
card.remove();                        // modern — removes itself
parent.removeChild(card);             // old way

// Replace
parent.replaceChild(newEl, oldEl);    // old way
oldEl.replaceWith(newEl);             // modern
```

### innerHTML vs textContent vs innerText

```js
el.textContent = '<b>Hello</b>';  // Shows literal text: "<b>Hello</b>" — safe, no parsing
el.innerHTML = '<b>Hello</b>';    // Parses HTML: renders bold "Hello" — XSS risk with user input!
el.innerText = 'Hello';           // Like textContent but triggers reflow (slower)
```

**Without understanding the XSS risk**: `innerHTML` with user input is a security hole. Never do `el.innerHTML = userInput`. Use `textContent` for text, or sanitize HTML before inserting.

---

## The Rendering Pipeline

Every time you modify the DOM, the browser may need to run through some or all of these stages:

```
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
  │JavaScript│───►│  Style   │───►│  Layout  │───►│    Paint     │
  │ (DOM     │    │(compute  │    │(geometry,│    │(fill pixels, │
  │ changes) │    │ CSS for  │    │ position,│    │ colors,      │
  │          │    │ each el) │    │ size)    │    │ shadows)     │
  └──────────┘    └──────────┘    └──────────┘    └──────┬───────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │  Composite   │
                                                  │(combine      │
                                                  │ layers,      │
                                                  │ GPU-based)   │
                                                  └──────────────┘

  COST:  JavaScript < Style < Layout < Paint < Composite

  - Changing `transform` or `opacity` → only Composite (cheapest)
  - Changing `color` or `background` → Paint + Composite
  - Changing `width`, `height`, `top`, `margin` → Layout + Paint + Composite (most expensive)
```

The key insight: **Layout is the expensive one**. When the browser calculates the geometry of elements — their widths, heights, positions — it may need to recalculate the geometry of their neighbors and parents too. This can cascade through the entire page.

---

## Layout Thrashing — The Performance Killer

Layout thrashing happens when you read layout properties and write DOM changes in an interleaved pattern, forcing the browser to recalculate layout on every read.

```js
// BAD — layout thrashing
const boxes = document.querySelectorAll('.box');
boxes.forEach(box => {
  const height = box.offsetHeight;           // READ — forces layout calculation
  box.style.height = (height * 2) + 'px';   // WRITE — invalidates layout
  // Next iteration: READ forces layout AGAIN because the WRITE invalidated it
});
// N elements = N forced layouts!

// GOOD — batch reads, then batch writes
const boxes = document.querySelectorAll('.box');
const heights = [];

// Phase 1: read everything
boxes.forEach(box => {
  heights.push(box.offsetHeight);            // READ
});

// Phase 2: write everything
boxes.forEach((box, i) => {
  box.style.height = (heights[i] * 2) + 'px'; // WRITE
});
// Only 1 layout calculation total!
```

Layout-triggering properties (reading these forces layout if it's pending):
- `offsetWidth`, `offsetHeight`, `offsetTop`, `offsetLeft`
- `clientWidth`, `clientHeight`
- `scrollWidth`, `scrollHeight`, `scrollTop`
- `getBoundingClientRect()`
- `getComputedStyle()`

**Without knowing which properties trigger layout**, you'd innocently read `offsetHeight` inside a loop that also writes styles, and wonder why your page stutters.

---

## `requestAnimationFrame` — Sync with the Browser

The browser renders at ~60fps (one frame every ~16.7ms). `requestAnimationFrame` (rAF) tells the browser: "call this function right before the next paint."

```js
// BAD — animating with setTimeout
function animate() {
  element.style.left = (parseInt(element.style.left) + 1) + 'px';
  setTimeout(animate, 16); // roughly 60fps, but not synced with the browser
}

// GOOD — animating with requestAnimationFrame
function animate() {
  element.style.left = (parseInt(element.style.left) + 1) + 'px';
  requestAnimationFrame(animate); // synced with the browser's refresh rate
}
requestAnimationFrame(animate);
```

**Without `requestAnimationFrame`**, your animation runs on its own schedule, often out of sync with the browser's paint cycle. This causes:
- Wasted frames (you update twice before a paint)
- Tearing (you update mid-paint)
- Battery drain (runs even when the tab is hidden)

`requestAnimationFrame` guarantees: one callback per frame, synced with the display, paused when the tab is hidden.

---

## DocumentFragment — Batch DOM Insertions

Every `appendChild` can trigger the browser to recalculate. If you're adding 1,000 items, that's 1,000 potential recalculations.

```js
// BAD — 1,000 DOM insertions, 1,000 potential reflows
const list = document.querySelector('#list');
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  list.appendChild(li);           // triggers reflow each time
}

// GOOD — build in a DocumentFragment, insert once
const list = document.querySelector('#list');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);       // fragment is not in the DOM — no reflow
}

list.appendChild(fragment);       // ONE insertion, ONE reflow
```

A `DocumentFragment` is a lightweight container that exists only in memory. When you append it to the DOM, its children are moved — the fragment itself disappears. One insert instead of thousands.

---

## Virtual Scrolling — The Concept

What if you have 100,000 items in a list? Even with `DocumentFragment`, creating 100,000 DOM nodes is slow and memory-heavy.

**Virtual scrolling** only renders the items visible in the viewport (plus a small buffer), and swaps them as the user scrolls:

```
  ┌─────────────────────────────┐
  │   Items 1-50 (not rendered  │  ← above viewport, recycled
  │   — just empty space)       │
  ├─────────────────────────────┤
  │ ┌─────────────────────────┐ │
  │ │  Item 51                │ │  ← buffer
  │ │  Item 52                │ │
  │ │  Item 53  ─ VIEWPORT ─  │ │  ← visible to user
  │ │  Item 54                │ │
  │ │  Item 55                │ │
  │ │  Item 56                │ │  ← buffer
  │ └─────────────────────────┘ │
  ├─────────────────────────────┤
  │   Items 57-100000           │  ← below viewport, not rendered
  │   (empty space with         │     — total height is faked with
  │    correct total height)    │       CSS to keep scrollbar accurate
  └─────────────────────────────┘

  Only ~10-20 DOM nodes exist at any time, regardless of list size.
```

The trick:
1. Calculate the total height (itemCount * itemHeight)
2. Set that as the container's height (so the scrollbar looks right)
3. On scroll, calculate which items should be visible
4. Render only those items, positioned absolutely at their correct offset

Libraries like `react-window`, `react-virtualized`, or `@tanstack/virtual` handle this for you. The concept is worth understanding even if you use a library.

---

## A/B Summary

| Naive approach (A) | Performant approach (B) |
|--------------------|------------------------|
| `getElementsByClassName` (live, surprises) | `querySelectorAll` (static, predictable) |
| `innerHTML = userInput` (XSS risk) | `textContent` for text, sanitize for HTML |
| Read/write interleaved in a loop (thrashing) | Batch reads, then batch writes |
| `setTimeout` for animation | `requestAnimationFrame` |
| `appendChild` in a loop (N reflows) | `DocumentFragment` then one `appendChild` |
| Render 100,000 DOM nodes | Virtual scrolling (~20 nodes) |
| Animate `top`/`left` (triggers layout) | Animate `transform` (compositor only) |

---

## Key Takeaways

1. **Use `querySelector`/`querySelectorAll`** — they accept CSS selectors and return static collections
2. **The rendering pipeline**: Style -> Layout -> Paint -> Composite. Layout is the expensive step — avoid triggering it unnecessarily.
3. **Layout thrashing** (read-write-read-write) is the #1 DOM performance killer. Batch reads and writes separately.
4. **`requestAnimationFrame`** syncs your updates with the browser's paint cycle — always use it for animations
5. **`DocumentFragment`** lets you build a subtree in memory and insert it in one shot
6. **Virtual scrolling** renders only visible items — essential for large lists
7. **Animate with `transform` and `opacity`** — they skip Layout and Paint, running on the GPU compositor
