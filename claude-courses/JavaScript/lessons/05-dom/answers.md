# Lesson 5: DOM Manipulation — Answers

## Q1

`getElementsByClassName` returns a **live** HTMLCollection. When you `remove()` an element that has the class `todo-item`, the collection immediately shrinks and re-indexes.

Example with 5 items where items 1, 3, and 4 have text "Done":
- `i=0`: item[0] is not "Done", skip. i becomes 1.
- `i=1`: item[1] is "Done", remove it. Collection re-indexes — what was item[2] is now item[1]. i becomes 2.
- You just skipped the new item[1].

You end up skipping elements because the live collection shifts under you as you remove items.

Fixes:
1. **Use `querySelectorAll`** (static NodeList — doesn't change when the DOM changes):
   ```js
   document.querySelectorAll('.todo-item').forEach(item => {
     if (item.textContent === 'Done') item.remove();
   });
   ```
2. **Iterate in reverse** (removing from the end doesn't affect earlier indices):
   ```js
   for (let i = items.length - 1; i >= 0; i--) { ... }
   ```

## Q2

Each `appendChild` call modifies the live DOM, which can trigger the browser to recalculate styles and layout. With 500 iterations, that's potentially 500 reflows.

The fix is to use a `DocumentFragment`:

```js
const ul = document.querySelector('#list');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 500; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);  // in memory only — no reflow
}

ul.appendChild(fragment);    // one DOM insertion, one reflow
```

The fragment exists only in memory. Appending children to it doesn't touch the live DOM. When you append the fragment to `ul`, all 500 `<li>` elements are inserted in a single operation.

## Q3

Two problems:

**1. Using `setInterval` instead of `requestAnimationFrame`.**
`setInterval` with 16ms is an approximation of 60fps, but it's not synchronized with the browser's actual paint cycle. This leads to:
- Animations that drift out of sync with the display refresh
- Wasted CPU when the tab is in the background (rAF pauses automatically; setInterval does not)
- Potential frame skipping or visual tearing

**2. Animating `left` instead of `transform`.**
`box.style.left` triggers Layout (the browser recalculates the geometry of the element and potentially its neighbors) and Paint on every frame. This is the most expensive path through the rendering pipeline.

Using `transform: translateX()` only triggers the Composite step, which runs on the GPU and is much cheaper.

Fixed version:
```js
function moveBox() {
  const box = document.querySelector('.box');
  let pos = 0;

  function frame() {
    pos += 2;
    box.style.transform = `translateX(${pos}px)`;  // compositor only
    requestAnimationFrame(frame);                    // synced with display
  }
  requestAnimationFrame(frame);
}
```

## Q4

This is **layout thrashing**. Inside the `forEach` loop, there are interleaved reads and writes:

1. `box.scrollHeight` — READ (forces layout if any pending writes exist)
2. `box.style.height = ...` — WRITE (invalidates layout)
3. `box.offsetHeight` — READ (forces layout AGAIN because of the write in step 2)
4. `box.style.marginBottom = ...` — WRITE (invalidates layout again)

For N boxes, this forces 2N layout recalculations per frame. At 60fps with many boxes, the browser can't keep up.

The fix is to separate reads and writes into distinct phases:

```js
function resizeAll() {
  const boxes = document.querySelectorAll('.auto-size');

  // Phase 1: READ all values
  const measurements = [];
  boxes.forEach(box => {
    measurements.push({
      scrollHeight: box.scrollHeight
    });
  });

  // Phase 2: WRITE all values
  boxes.forEach((box, i) => {
    const h = measurements[i].scrollHeight;
    box.style.height = h + 'px';
    box.style.marginBottom = (200 - h) + 'px';
  });

  requestAnimationFrame(resizeAll);
}
```

One batch read, one batch write, one layout recalculation per frame.

## Q5

**Performance problem:** `container.innerHTML += ...` is expensive. On each iteration, the browser:
1. Serializes the entire existing DOM tree inside `container` to a string
2. Concatenates the new HTML string
3. Parses the entire combined string back into DOM nodes
4. Replaces all children

For 100 comments, step 1-4 happens 100 times, and each time the string gets larger. This is O(n^2) in total work.

Fix: Use `DocumentFragment` with `createElement`, or build the entire HTML string first and set `innerHTML` once:
```js
container.innerHTML = comments
  .map(c => `<div class="comment"><p>${sanitize(c.text)}</p></div>`)
  .join('');
```

**Security problem:** `comment.text` is user input being injected directly into `innerHTML`. If a user submits `<script>alert('hacked')</script>` or `<img onerror="..." src="x">` as their comment text, it will execute as HTML — this is a Cross-Site Scripting (XSS) vulnerability.

Fix: Use `textContent` for user-generated content (it inserts as plain text, never parsed as HTML):
```js
const fragment = document.createDocumentFragment();
comments.forEach(comment => {
  const div = document.createElement('div');
  div.className = 'comment';
  const p = document.createElement('p');
  p.textContent = comment.text;  // safe — never parsed as HTML
  div.appendChild(p);
  fragment.appendChild(div);
});
container.innerHTML = '';
container.appendChild(fragment);
```
