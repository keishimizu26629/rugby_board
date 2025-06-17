import { createApp } from 'vue';
import App from './App.vue';
import { initializeApp } from 'firebase/app';
import router from './router';
import { createPinia } from 'pinia';
import firebaseConfigJs from './firebaseConfig';
import vuetify from './plugins/vuetify';
import { AuthService } from './services/authService';
import { BoardService } from './services/boardService';
import { useAuthStore } from './stores/auth';

const firebaseConfig = firebaseConfigJs();

// Firebase初期化
initializeApp(firebaseConfig);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// DIコンテナとしてprovideを利用
app.provide('authRepo', new AuthService());
app.provide('boardRepo', new BoardService());

app.use(router);
app.use(vuetify);

// Piniaストアの初期化（app.use(pinia)の後で行う）
const authStore = useAuthStore();
authStore.initAuthListener();

app.mount('#app');
