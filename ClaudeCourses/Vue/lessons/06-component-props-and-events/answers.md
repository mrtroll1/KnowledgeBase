# Lesson 6: Component Props, Events & Slots — Answers

## Q1
`default: []` shares the same array instance across all component instances. If one instance mutates it, all instances see the change. Fix: use a factory function `default: () => []` so each instance gets its own array. Same rule applies to objects: `default: () => ({})`.

## Q2
```vue
<UserForm :email="userEmail" @update:email="userEmail = $event" />
```
Named `v-model:email` creates prop `email` and event `update:email`. Without a name (`v-model`), it uses `modelValue` and `update:modelValue`.

## Q3
**Scoped slots.** The child owns the data and iteration logic, the parent controls presentation:
```vue
<!-- DataTable.vue -->
<tr v-for="row in data" :key="row.id">
  <slot name="row" :row="row">
    <!-- default rendering -->
    <td>{{ row.name }}</td>
  </slot>
</tr>

<!-- Parent -->
<DataTable :data="users">
  <template #row="{ row }">
    <td>{{ row.name }}</td>
    <td><button @click="edit(row)">Edit</button></td>
  </template>
</DataTable>
```
Props can't pass template structure. Events are for notifications, not rendering. Slots are the right tool for "parent decides how to render child's data."

## Q4
**Option 1:** Pass `user` as props through every intermediate component (prop drilling): `App → Dashboard(user) → Sidebar(user) → UserAvatar(user)`. Tedious and pollutes intermediate components.
**Option 2:** `provide('user', user)` in App, `inject('user')` in UserAvatar. Better here — the intermediate components don't need to know about the user. Provide/inject is designed for exactly this kind of cross-cutting concern.

## Q5
`$slots.header` checks whether the parent provided content for the `header` slot. If the parent didn't provide a `#header` template, the entire `<header>` wrapper element won't render — avoiding an empty `<header class="card-header"></header>` in the DOM. It's a conditional wrapper pattern.
