<script setup>
import { ref, provide, defineAsyncComponent } from 'vue'

import TemplateSyntax from './components/TemplateSyntax.vue';
import ReactivityFundamentals from './components/ReactivityFundamentals.vue';
import ComputedProperties from './components/ComputedProperties.vue';
import ClassAndStyleBindings from './components/ClassAndStyleBindings.vue';
import ListRendering from './components/ListRendering.vue';
import FormInputBindings from './components/FormInputBindings.vue';
import Watchers from './components/Watchers.vue';
import Props from './components/Props.vue';
import Composables from './components/Composables.vue';
import Transitions from './components/Transitions.vue';
import Teleports from './components/Teleports.vue';
import Accessible from './components/Accessible.vue';
import TypeScript from './components/TypeScript.vue';
import Debugging from './components/Debugging.vue';
import RenderFunctions from './components/RenderFunctions.vue';

const AsyncComponents = defineAsyncComponent({
  loader: () => import('./components/AsyncComponents.vue'),

  // loadingComponent: LoadingComponent,
  // delay: 200,

  // errorComponent: ErrorComponent,
  // timeout: 3000
})

const propsToPass = {
  numberProp: 42,
  stringProp: 'wow',
  objectProp: {key : 'value'},
  arrayProp: [1,2],
}

function doFireworks(value) {
  console.log(value)
  console.log('WOOOOW!!!!!')
}

const countModel = ref(0)
const textModel = ref('')

provide('count', countModel)
</script>

<template>
<main>
  <div>
    <p>Template Syntax</p>
    <TemplateSyntax />
  </div>
  <div style="margin-top: 12px;">
    <p>Reactivity Fundamentals</p>
    <ReactivityFundamentals />
  </div>
  <div style="margin-top: 12px;">
    <p>Computed Properties</p>
    <ComputedProperties />
  </div>
  <div style="margin-top: 12px;">
    <p>Class and Style Bindings</p>
    <ClassAndStyleBindings />
  </div>
  <div style="margin-top: 12px;">
    <p>List Rendering</p>
    <ListRendering />
  </div>
  <div style="margin-top: 12px;">
    <p>Form Input Bindings</p>
    <FormInputBindings />
  </div>
  <div style="margin-top: 12px;">
    <p>Watchers</p>
    <Watchers />
  </div>
  <div style="margin-top: 12px;">
    <p>Props and Events</p>
    <Props 
      :="propsToPass"
      @firework-event="doFireworks"
      v-model:model-name="countModel"
      v-model:text-input-model.empty="textModel"
    >
      <template v-slot:header>
        Header content
      </template>
      <template #footer="count">
        {{ count }}
        Footer content with an <h2> element </h2>
      </template>
    </Props>
    <h1>Model value in parent: {{ countModel }}</h1>
  </div>
  <div style="margin-top: 12px;">
    <p>AsyncComponents</p>
    <AsyncComponents />
  </div>
  <div style="margin-top: 12px">
    <p>Composables</p>
    <Composables />
  </div>
  <div style="margin-top: 12px">
    <p>Transitions</p>
    <Transitions />
  </div>
  <div class="outer">
    <div style="margin-top: 12px">
      <p>Teleports</p>
      <Teleports />
    </div>
  </div>
  <div style="margin-top: 12px">
    <p>Accessible</p>
    <Accessible />
  </div>
  <div style="margin-top: 12px">
    <p>TypeScript</p>
    <TypeScript />
  </div>
  <div style="margin-top: 12px">
    <p>Debugging</p>
    <Debugging />
  </div>
  <div style="margin-top: 12px">
    <p>RenderFunctions</p>
    <RenderFunctions msg="message"/>
  </div>
  <div style="height: 200px;"></div>
</main>
</template>

<style scoped>
p {
  font-size: 20px; 
  font-weight: bold;
}
</style>