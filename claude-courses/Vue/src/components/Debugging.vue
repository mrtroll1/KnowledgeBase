<script setup>
import { onRenderTracked, onRenderTriggered } from 'vue'

// onRenderTracked((event) => {
//   debugger
// })

// onRenderTriggered((event) => {
//   debugger
// })

import { ref, shallowRef } from 'vue'

// const count = ref(0);

const obj = ref({
    childObj: { count: 0},
    childArr: ['el1', 'el2'],
})
function mutateDeeply(someObj) {
    someObj.childObj.count++
    someObj.childArr.push('newEl')
}

const refArr = ref(['el1', 'el2'])
const shallowObj = shallowRef({
    childObj: { count: 0},
    childArr: refArr,
    childNumber: 0, // This had to be added because otherwise obj and shallowObj have identical structure and that confuses Vue.
})
function mutateShallow() {
    shallowObj.value.childObj.count++
}
function mutateShallowDeeply(someObj) {
    someObj.childObj.count++
    someObj.childArr.value.push('newEl')
}

const state = ref({ count: 1})
let { count } = state
</script>

<template>
    <button @click="count++">This button updates count: {{ count }} on click and in-line</button>
    <div> 
        The following object is mutated deeply, i.e. by default reactivity tracks changes in children too
        <button @click="mutateDeeply(obj)">{{ obj }}</button>
        To avoid that, use shallowRef.
    </div>
    <div>
        DOM updates are not synchronous. If logic within a single method is update-critical, use await nextTick().
    </div>
    <p>It is recommended to only work with references instead of oeiginal objects to not loose reactivity.</p>
    <div>
        If you only want to only tracks certain children, pass them as refs to a shallowRef: {{ shallowObj }}
        <button @click="mutateShallow">This button changes non-reactive object</button>
        <button @click="mutateShallowDeeply(shallowObj)">This button changes reactive array</button>
    </div>
</template>