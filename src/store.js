import Vue from 'vue';
import Vuex from 'vuex';
import axiosAuth from './axiosAuth';
import axiosRefresh from './axiosRefresh';
import axios from './cloudFireStore';
import router from '@/router';
// import firebase from 'firebase';

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
    },
  },
  actions: {
    autoLogin: async function({ commit, dispatch }) {
      const idToken = localStorage.getItem('idToken');
      if (!idToken) return;
      const now = new Date();
      const expiresTimeMs = localStorage.getItem('expiresTimeMs');
      const isExpired = now.getTime() >= expiresTimeMs;
      const refreshIdToken = localStorage.getItem('refreshToken');
      if (isExpired) {
        await dispatch('refreshToken', refreshIdToken);
      } else {
        const expiresInMs = expiresTimeMs - now.getTime();
        setTimeout(() => {
          dispatch('refreshIdToken', refreshIdToken);
        }, expiresInMs);
        commit('updateIdToken', idToken);
      }
    },
    login: async function({ commit, dispatch }, {email, password}) {
      try {
        const response = await axiosAuth.post('/accounts:signInWithPassword?key=AIzaSyCH58r7rQrY3tK9lz68RkCvlq-6QVzWq40',{
          email: email,
          password: password,
          returnSecureToken: true
        })
        const now = new Date();
        const additionTime = response.data.expiresIn * 1000;
        const expiresTimeMs = now.getTime() + additionTime;
        console.log(response.data);
        localStorage.setItem('uid', response.data.localId);
        localStorage.setItem('idToken', response.data.idToken);
        localStorage.setItem('expiresTimeMs', expiresTimeMs);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        commit('updateIdToken', response.data.idToken);
        setTimeout(() => {
          dispatch('refreshIdToken', response.data.refreshToken);
        }, additionTime);
        router.push('/');
      } catch(e) {
        console.log(e);
      }
    },
    refreshIdToken: async function({ commit, dispatch }, refreshToken) {
      const response = await axiosRefresh.post('/token?key=AIzaSyCH58r7rQrY3tK9lz68RkCvlq-6QVzWq40',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      });
      console.log(response.data.id_token);
      const additionTime = response.data.expiresIn * 1000;
      commit('updateIdToken', response.data.id_token);
      setTimeout(() => {
        dispatch('refreshIdToken', response.data.refresh_token);
      }, additionTime);
    },
    logout({ commit }) {
      commit('updateIdToken', null);
      localStorage.removeItem('uid');
      localStorage.removeItem('idToken');
      localStorage.removeItem('expiresTimeMs');
      localStorage.removeItem('refreshToken');
      router.replace('/login');
    },
    testPost() {
      // const userData = {
      //   name: 'test',
      //   email: 'test@gmail.com',
      // };
      // const uid = localStorage.getItem('uid');
      // axios.post(`/user/${uid}`,
      axios.post(`/cities/LA`,
      {
        name: {
          stringValue: 'test'
        },
        email: {
          stringValue: 'test@gmail.com'
        }
      },
      // {
      //   fields: {
      //     name: {
      //       stringValue: 'test'
      //     },
      //     email: {
      //       stringValue: 'test@gmail.com'
      //     }
      //   }
      // },
      // {
      //   Authorization: `Bearer ${this.idToken}`
      // }
      )
    }
  }
});
