import Vue from 'vue';
import App from './App.vue';
import firebase from 'firebase';
import router from './router';
import store from './store';

Vue.config.productionTip = false

const firebaseConfig = {
  apiKey: "AIzaSyCH58r7rQrY3tK9lz68RkCvlq-6QVzWq40",
  authDomain: "rugby-board.firebaseapp.com",
  projectId: "rugby-board",
  storageBucket: "rugby-board.appspot.com",
  messagingSenderId: "984035006338",
  appId: "1:984035006338:web:4d0fa13287367633bb219b"
};

firebase.initializeApp(firebaseConfig);

store.dispatch('autoLogin');

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
