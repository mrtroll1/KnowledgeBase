<script setup>
import { ref } from 'vue'

const show = ref(true)

const count = ref(0)

const items = ref([1,2,3])

function onBeforeEnter(el) {
  el.style.opacity = 0;
  el.style.transform = 'translateY(-20px)';
}

function onEnter(el, done) {
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    el.style.opacity = 1;
    el.style.transform = 'translateY(0)';
    el.addEventListener('transitionend', done);
  });
} 

function onAfterEnter(el) {
  el.style.transition = '';
} 

function onEnterCancelled(el) {
  el.style.transition = '';
}

function onBeforeLeave(el) {
  el.style.opacity = 1;
  el.style.transform = 'translateY(0)';
}

function onLeave(el, done) {
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    el.style.opacity = 0;
    el.style.transform = 'translateY(-20px)';
    el.addEventListener('transitionend', done);
  });
}

function onAfterLeave(el) {
  // Optional: clean up styles
}

function onLeaveCancelled(el) {
  el.style.transition = '';
}
</script>

<template>
  <button @click="count+=1">Toggle</button>
  <Transition name="fade" mode="out-in">
    <p v-if="count % 6 == 0">fading hello</p>
  </Transition>
  <Transition name="slide-fade" mode="out-in">
    <p v-if="count % 6 == 1">slide-fading hello</p>
  </Transition>
  <Transition name="bounce" mode="out-in">
    <p v-if="count % 6 == 2" style="text-align: center;">
      Hello here is some bouncy text!
    </p>
  </Transition>
  <Transition name="custom-classes" mode="out-in"
    enter-from-class="background__red" 
    leave-to-class="background__red" 
    enter-to-class="background__green"
    leave-from-class="background__green"
    >
    <p v-if="count % 6 == 3" class="background__red">transition with cusom css classes' names</p>
  </Transition>
  <Transition name="nested" mode="out-in">
    <div v-if="count % 6 == 4" class="outer">
      <div class="inner">
        Hello
      </div>
    </div>
  </Transition>
  <Transition :css="false" mode="out-in"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @enter-cancelled="onEnterCancelled"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
    @leave-cancelled="onLeaveCancelled"
  >
    <p v-if="count % 6 == 5">WOW!!!</p>
  </Transition>
  <button @click="items.push(4)">Add a 4</button>
  <button @click="items.pop()">Remove an element</button>
  <button @click="items.sort(() => Math.random() - .5)">Shuffle</button>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item">
      {{ item }}
    </li>
  </TransitionGroup>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

.background__red {
  background: red;
}

.background__green {
  background: green;
}

.nested-enter-active .inner,
.nested-leave-active .inner {
  transition: all 0.3s ease-in-out;
}

.nested-enter-from .inner,
.nested-leave-to .inner {
  transform: translateX(30px);
  opacity: 0;
}

.nested-enter-active .inner {
  transition-delay: 0.25s;
}

.list-move, 
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
