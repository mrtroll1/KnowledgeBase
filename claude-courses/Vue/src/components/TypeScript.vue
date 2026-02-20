<script setup lang="ts">

// const propsRuntime = defineProps({
//   foo: { type: String, required: true },
//   bar: Number,
// })

// const propstypeBased = defineProps<{
//   foo: string
//   bar?: number
// }>()

interface PropsInterface {
  msg: string
  labels?: string[]
}

const { msg = 'hello', labels = ['one', 'two'] } = defineProps<PropsInterface>()

</script>

<template>

</template>