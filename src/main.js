import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

import PrimeVue from "primevue/config"
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primeicons/primeicons.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(PrimeVue)
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
