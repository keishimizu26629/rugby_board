import Vue from 'vue';
import App from './App.vue';
import firebase from 'firebase';
import router from './router';
import store from './store';
import firebaseConfigJs from './firebaseConfig';
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

const firebaseConfig = firebaseConfigJs();

firebase.initializeApp(firebaseConfig);

store.dispatch('autoLogin').then(() => {
  new Vue({
    store,
    router,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
});
