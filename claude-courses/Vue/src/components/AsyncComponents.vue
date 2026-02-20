<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value += 1
}
</script>

<template>
  <p>Async component content</p>
  <p>Async component dynamic content: {{ count }}</p>
  <button @click="increment"> Increment </button>
</template>

<style scoped>

</style>
