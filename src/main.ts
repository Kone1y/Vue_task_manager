import './assets/main.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { createPersistence } from './stores/plugins/persistence'

const app = createApp(App)

const pinia = createPinia()
pinia.use(createPersistence())

// 顺序很重要：先装 pinia，路由守卫里才能 useUserStore()
app.use(pinia)
app.use(router)

app.mount('#app')
