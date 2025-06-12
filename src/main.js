import { createApp } from 'vue'
import App from './App.vue'
import { initializeApp } from 'firebase/app'
import router from './router'
import { createPinia } from 'pinia'
import firebaseConfigJs from './firebaseConfig'
import vuetify from './plugins/vuetify'
import { useAuthStore } from './stores/auth'

const firebaseConfig = firebaseConfigJs()

// Firebase初期化
initializeApp(firebaseConfig)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// Piniaストアの初期化
const authStore = useAuthStore()

// 自動ログイン
authStore.initAuthListener()

app.mount('#app')
