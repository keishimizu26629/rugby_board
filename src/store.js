import Vue from 'vue';
import Vuex from 'vuex';
import axios from './axios-auth';
import router from '@/router';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    idToken: null,
  },
  getters: {
    idToken(state) {
      return state.idToken;
    },
  },
  mutations: {
    updateIdToken(state, idToken) {
      state.idToken = idToken;
      localStorage.setItem('uid', response.user.uid);
    }
  },
  actions: {
    autoLogin() {
      
    },
    login({ commit }, {email, password}) {
      axios.post('/accounts:signInWithPassword?key=AIzaSyCH58r7rQrY3tK9lz68RkCvlq-6QVzWq40',{
        email: email,
        password: password,
        returnSecureToken: true
      })
      .then(response => {
        commit('updateIdToken', response.data.idToken);
        router.push('/');
      });
    }
  }
});