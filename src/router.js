import Vue from 'vue';
import Router from 'vue-router';
import Board from './components/Board.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import store from './store';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/', 
      component: Board,
      beforeEnter(to, from, next) {
        if(store.getters.idToken) {
          next();
        } else {
          next('/login');
        }
      }
    },
    {
      path: '/login', 
      component: Login
    },
    {
      path: '/register', 
      component: Register
    },
  ]
});