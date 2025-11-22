import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'
import './style.css'

import { useAuthStore } from './stores/auth.store'

const app = createApp(App)

// Pinia
const pinia = createPinia()
app.use(pinia)

// Initialize auth store
const authStore = useAuthStore()
authStore.initialize()

// Toast options
const toastOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button' as const,
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__fade',
  maxToasts: 5,
  newestOnTop: true
}

app.use(Toast, toastOptions)

// Router
app.use(router)

app.mount('#app')
