import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import './styles/index.css'
import { initAuth } from '@/composables/useAuth'

;(async () => {
  await initAuth()
  createApp(App).use(router).mount('#app')
})()
