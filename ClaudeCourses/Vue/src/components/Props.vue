<script setup>
import { ref, defineProps } from 'vue'
import DeepChild from './DeepChild.vue'

const props = defineProps({
    numberProp: Number,
    stringProp: {
        type: [String, null],
        required: true
    },
    objectProp: {
        type: Object,
        default(rawProps) {
            return { key: 'defaultValue' }
        }
    },
    arrayProp: {
        type: Array,
        validator(value, props) {
            return value.includes(1)
        }
    },
})

const emit = defineEmits(['fireworkEvent'])

const someModel = defineModel('modelName')

function update() {
  someModel.value++
}

const [textInputModel, textInputmodifiers] = defineModel('textInputModel', {
  set(value) {
    if (textInputmodifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    } else if (textInputmodifiers.empty) {
      return ''
    }
    return value
  }
})

const count = ref(12);
</script>

<template>
    <p>{{ props }}</p>
    <button @click="$emit('fireworkEvent', 'someValue')">I emit a fireworkEvent that parent catches!</button>
    <div>Parent bound v-model is: {{ someModel }}</div>
    <button @click="update">Increment</button>
    <input type="text" v-model="textInputModel" />
    <p>{{ textInputModel }}</p>
    <header>
      <div v-if="$slots.header" class="card-header">
        <slot name="header"></slot>
      </div>
    </header>
    <footer>
      <slot name="footer" :count></slot>
    </footer>
    <DeepChild />
</template>

<style scoped>

</style>
