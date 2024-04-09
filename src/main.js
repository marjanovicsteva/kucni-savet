import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

import PrimeVue from "primevue/config"
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primeicons/primeicons.css'
import 'croppie/croppie.css'

import firebaseConfig from './firebaseConfig'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
initializeApp(firebaseConfig);

const app = createApp(App)

app.use(router)
app.use(PrimeVue)
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
