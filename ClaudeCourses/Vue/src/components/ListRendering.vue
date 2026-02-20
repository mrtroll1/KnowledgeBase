<script setup>
import { ref, onMounted } from 'vue'

const items = ref([1,2,3,4])

const objectOfItems = ref({
    item1: 1,
    item2: 2,
    item3: 3
})

</script>

<template>
    <li v-for="item in items">{{item}}</li>
    <li v-for="(item, index) in items">{{index}} {{item}}</li>
    <li v-for="(value, key, index) in objectOfItems">{{key}}: {{value}}, index: {{index}}</li>
    <p v-for="i in 10">{{i}}</p>
</template>

<style scoped>

</style>
