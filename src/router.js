import Vue from 'vue';
import Router from 'vue-router';
import Board from './components/Board.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
// import store from './store';
import firebase from 'firebase';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Board,
      beforeEnter(to, from, next) {
        firebase.auth().onAuthStateChanged(user => {
          if(user) {
            next();
          } else {
            next('/login');
          }
        })
      }
    },
    {
      path: '/login',
      component: Login,
      beforeEnter(to, from, next) {
        firebase.auth().onAuthStateChanged(user => {
          if(user) {
            next('/');
          } else {
            next();
          }
        })
      }
    },
    {
      path: '/register',
      component: Register
    },
  ]
});
