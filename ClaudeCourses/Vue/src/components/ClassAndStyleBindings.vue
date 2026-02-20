<script setup>
import { ref, computed } from 'vue'

const isActive = ref(true)
const hasError = ref(false)
const classObject = computed(() => ({
    active: isActive.value + 1, 
    'text-danger': hasError 
}))

const classArr = ref(['class-1', 'class-2'])

const color = ref('red')
const fontSize = ref(8)
function changeStyle() {
    color.value = (color.value === 'red') ? 'blue' : 'red'
    fontSize.value += 4
}


</script>

<template>
    <div :class="classObject">
        This div has classes set dynamically by passing an object {{ classObject }} <br>
        Moreover, this classObject is a computed property.
    </div>
    <div :class="classArr">
        This div has classes set dynamically by passing an array {{ classArr }} <br>
    </div>
    <p style="font-weight: bold;" :style="{ color, fontSize: fontSize + 'px'}">This text changes style on click and inline objects support short-hand x for x: x</p>
    <button @click="changeStyle">Change styles</button>
</template>

<style scoped>

</style>