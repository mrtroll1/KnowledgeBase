# Lesson 11: Accessibility — Quiz

## Q1
What's wrong with this from an accessibility perspective? How would you fix it?

```html
<div class="btn" onclick="submit()">Submit</div>
```

---

## Q2
You have an icon-only button. Screen readers announce it as just "button". How do you make it accessible?

```html
<button @click="deleteItem">
  <svg><!-- trash icon --></svg>
</button>
```

---

## Q3
When a Vue modal opens, the focus stays on the trigger button behind the overlay. What should happen instead, and how do you implement it?

---

## Q4
Your designer says "use red text for required fields." What accessibility principle does this violate?

---

## Q5
What's the difference between `aria-labelledby` and `aria-describedby`? When would you use each?
