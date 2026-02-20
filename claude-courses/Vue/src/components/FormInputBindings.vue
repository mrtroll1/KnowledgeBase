<script setup>
import { ref, onMounted } from 'vue'

const message = ref('');

const checkedNames = ref([])
</script>

<template>
    <p>Message is: {{ message }}</p>
    <input v-model="message" placeholder="edit me" /> <br>
    <span>Multiline message is:</span>
    <p style="white-space: pre-line;">{{ message }}</p>
    <textarea v-model="message" placeholder="add multiple lines"></textarea>

    <div>Selected services: {{ checkedNames }}</div>

    <input type="checkbox" id="jack" value="Parenie" v-model="checkedNames" />
    <label for="jack">Parenie</label>

    <input type="checkbox" id="john" value="Massage" v-model="checkedNames" />
    <label for="john">Massage</label>

    <input type="checkbox" id="mike" value="I cho" v-model="checkedNames" />
    <label for="mike">I cho</label>

    <div>Selected: {{ selected }}</div>

    <select v-model="selected">
        <option disabled value="">Please select one</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
    </select>
</template>

<style scoped>

</style>
