<script setup>
import { inject } from 'vue'

const count = inject('count', 314)
</script>

<template>
    {{ count }}
</template>

<style scoped>

</style>
