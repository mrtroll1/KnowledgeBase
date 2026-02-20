# Lesson 11: Accessibility — Answers

## Q1
Multiple issues: (1) `<div>` isn't focusable — keyboard users can't Tab to it. (2) `<div>` has no button role — screen readers don't announce it as interactive. (3) No keyboard handler — Enter/Space won't trigger it. Fix: use `<button @click="submit">Submit</button>`. A native `<button>` is focusable, announced as "button", and responds to Enter/Space automatically. Zero ARIA needed.

## Q2
Add an accessible label:
```html
<button @click="deleteItem" aria-label="Delete item">
  <svg aria-hidden="true"><!-- trash icon --></svg>
</button>
```
`aria-label` gives the button an accessible name. `aria-hidden="true"` on the SVG prevents screen readers from trying to read the SVG content. Screen reader now announces: "Delete item, button."

## Q3
Focus should move to the modal (or its first focusable element) when it opens, and return to the trigger button when it closes. Implementation:
```js
async function openModal() {
  showModal.value = true
  await nextTick()
  modalRef.value?.focus()  // or first input inside modal
}
function closeModal() {
  showModal.value = false
  triggerButton.value?.focus()  // return focus to trigger
}
```
Also trap focus inside the modal (Tab shouldn't escape to the page behind).

## Q4
Violates "don't use color as the only indicator." Color-blind users (8% of males) may not distinguish red from other text. Fix: use color **plus** another indicator — an asterisk (*), the word "Required", or an icon. Example: `<label>Name <span class="required">* (required)</span></label>`.

## Q5
`aria-labelledby` provides the **name** of an element — what it IS. Like a label: "Date of Birth." `aria-describedby` provides additional **description** — extra context about the element. Like help text: "Format: MM/DD/YYYY." Screen readers announce the label first, then pause, then read the description. Use `labelledby` for the primary identification, `describedby` for supplementary instructions, error messages, or hints.
