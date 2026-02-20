# Lesson 5: DOM Manipulation — Quiz

## Q1

What's wrong with this code?

```js
const items = document.getElementsByClassName('todo-item');

for (let i = 0; i < items.length; i++) {
  if (items[i].textContent === 'Done') {
    items[i].remove();
  }
}
```

---

## Q2

You need to add 500 `<li>` elements to a `<ul>`. A colleague wrote this:

```js
const ul = document.querySelector('#list');

for (let i = 0; i < 500; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  ul.appendChild(li);
}
```

What's the performance problem, and how would you fix it?

---

## Q3

What's wrong with this animation code?

```js
function moveBox() {
  const box = document.querySelector('.box');
  let pos = 0;

  setInterval(() => {
    pos += 2;
    box.style.left = pos + 'px';
  }, 16);
}
```

Identify at least two problems.

---

## Q4

This code runs on every frame to resize boxes based on their content. Users report the page is extremely slow. Why?

```js
function resizeAll() {
  const boxes = document.querySelectorAll('.auto-size');

  boxes.forEach(box => {
    const contentHeight = box.scrollHeight;         // read
    box.style.height = contentHeight + 'px';         // write
    const newHeight = box.offsetHeight;              // read
    box.style.marginBottom = (200 - newHeight) + 'px'; // write
  });

  requestAnimationFrame(resizeAll);
}
```

---

## Q5

A developer needs to display user comments on a page. They wrote:

```js
function renderComments(comments) {
  const container = document.querySelector('#comments');
  container.innerHTML = '';

  comments.forEach(comment => {
    container.innerHTML += `<div class="comment"><p>${comment.text}</p></div>`;
  });
}
```

Identify two problems with this approach (one performance, one security).
