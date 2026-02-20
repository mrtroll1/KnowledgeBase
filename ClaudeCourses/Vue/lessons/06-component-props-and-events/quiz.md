# Lesson 6: Component Props, Events & Slots — Quiz

## Q1
What's wrong with this default value? What bug could it cause?

```js
defineProps({
  items: {
    type: Array,
    default: []
  }
})
```

---

## Q2
Expand this `v-model` into its underlying prop + event. What prop name and event name does Vue use?

```vue
<UserForm v-model:email="userEmail" />
```

---

## Q3
You have a `DataTable` component that renders rows. The parent wants to control how each row looks. Which Vue feature would you use — props, events, or slots? Show a rough implementation.

---

## Q4
Your app has this hierarchy: `App → Dashboard → Sidebar → UserAvatar`. `UserAvatar` needs the current user object from `App`. What are your two options, and which is better here?

---

## Q5
What does `$slots.header` check for? Why would you use it?

```vue
<header v-if="$slots.header" class="card-header">
  <slot name="header"></slot>
</header>
```
