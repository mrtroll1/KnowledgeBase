# Lesson 5: Form Input Bindings — Answers

## Q1
```vue
<input :value="message" @input="message = $event.target.value" />
```
`v-model` binds the `value` attribute (JS → DOM) and listens to the `input` event (DOM → JS). For checkboxes it's `:checked` + `@change`, for select it's `:value` + `@change`.

## Q2
`skills` is `['Vue', 'React']`. When they uncheck "Vue", it becomes `['React']`. Vue automatically pushes the `value` attribute of checked checkboxes into the array and removes it when unchecked. Order matches the order of checking.

## Q3
`v-model` syncs on every `input` event (every keystroke). `v-model.lazy` syncs on `change` event (when the input loses focus / user presses Enter). Use `.lazy` for expensive operations like API search or validation that you don't want running on every keystroke.

## Q4
Despite `type="number"`, `qty` is still a **string** (`"5"`) because all HTML input values are strings. Use `v-model.number` to auto-cast: `<input v-model.number="qty" type="number">`. Now `qty` will be the number `5`.

## Q5
Interpolation inside `<textarea>{{ message }}</textarea>` is rendered once as static text — it doesn't create a two-way binding. The textarea's content becomes the literal text and won't update reactively. Use `<textarea v-model="message"></textarea>` instead, which properly binds the value and listens for changes.
