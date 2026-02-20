<script setup>
import { ref } from 'vue'
import { useMouse } from '../composables/mouse.js'
import { useFetch } from '../composables/fetch.js'

const { x, y } = useMouse()

const url = ref('https://www.wikipedia.com')
const { data, error, value } = useFetch(url, 'maybeRefOrGetter')

// This re-triggers the useFetch
url.value = 'lol'
url.value = 'https://www.wikipedia.com'
</script>

<template>
  <p>This components uses composables</p>
  <p> Mouse position is at: {{ x }}, {{ y }} </p>
  <div v-if="error">Oops! Error encountered: {{ error.message }}</div>
    <div v-else-if="data">
      Data loaded:
      <pre>{{ data }}</pre>
    </div>
  <div v-else>Loading...</div>
  <p>{{ value }}</p>
  <p v-highlight>Custom directive</p>
  <input v-focus:argument="value" />
</template>

<style scoped>
.is-highlight {
  background-color: yellow;
}
</style>
