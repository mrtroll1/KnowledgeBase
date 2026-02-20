<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const x = 0;

function receiveString(str: string): number {
    return 1
}

// receiveString(x);

const author = ref({
    name: 'Kolyan',
    articles: [
        'Govno',
        'Govnishe',
        'Govnobrazie'
    ]
})
const hasGoodBooks = computed(() => {
    return author.value.articles.includes('Good') ? '' : 'not'
})
const newArticle = ref('');

function addArticle() {
    const text = newArticle.value.trim()
    if (!text) return
    author.value.articles.push(text)
    newArticle.value = ''
}
</script>

<template>
    <p>This author <strong>has {{ hasGoodBooks }}</strong> published good books.</p>
    <input v-model="newArticle" @keyup.enter="addArticle" type="text" placeholder="Add an article">
    <p>
        Computed properties, unlike methods, are cached based on their reactive dependencies. <br>
        Method invokation always re-runs the function.
    </p>
    <p>By default, computed properties are get-only. But we can add a setter as well.</p>
    <p>We can do computed((previous) => { ... }) to acess the previous value.</p>
</template>

<style scoped>
strong {
    font-weight: bold;
}
</style>