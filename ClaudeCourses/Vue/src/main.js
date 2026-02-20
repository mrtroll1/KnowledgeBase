import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { ConfigPlugin } from './ConfigPlugin.js'

const app = createApp(App);

app.use(ConfigPlugin)

app.mount('#app');


