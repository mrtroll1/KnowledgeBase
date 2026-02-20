# Lesson 2: CSS Specificity — Quiz

## Q1
Calculate the specificity for each selector and rank them from lowest to highest:

```css
a) div p span { }
b) .card .title { }
c) #main .card .title { }
d) .card > .title:hover { }
e) div#main p.intro::first-line { }
```

---

## Q2
Given this HTML and CSS, what color is the text? Walk through the cascade step by step.

```html
<div id="content">
  <p class="intro highlight">Hello world</p>
</div>
```

```css
#content p { color: blue; }
.intro.highlight { color: green; }
p.intro { color: red; }
```

---

## Q3
A developer writes this CSS. It works, but a colleague says it's "a specificity time bomb." Why?

```css
#header #nav .link.active { color: white; }
#header #nav .dropdown .link { color: gray; }
#footer #links a { color: blue; }
```

---

## Q4
You're working on a large project and discover this rule in a third-party stylesheet you cannot modify:

```css
#app .form-container .input-field { border: 2px solid red; }
```

You need the border to be blue for inputs inside your `.signup-section`. Write a selector that overrides it **without** using `!important` and explain your specificity math.

---

## Q5
What's wrong with this approach, and what would you do instead?

```css
.btn { background: gray; }
.page .sidebar .btn { background: green; }
.page .main .btn { background: blue; }
.page .main .section .btn { background: purple; }
.page .main .section .btn:hover { background: darkpurple; }

/* New requirement: make all buttons in .promo red */
.promo .btn { background: red; }  /* Doesn't work everywhere! */
```
