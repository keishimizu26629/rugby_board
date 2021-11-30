import Vue from 'vue';
import Vuex from 'vuex';
import router from '@/router';
import firebase from 'firebase';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loginUser: null,
    positions: []
  },
  getters: {
    loginUser(state) {
      return state.loginUser;
    },
    positions(state) {
      return state.positions;
    }
  },
  mutations: {
    updateLoginUser(state, user) {
      state.loginUser = user;
    },
    updatePosition(state, positions) {
      state.positions = [];
      Object.entries(positions).forEach(object => {
        let position = {};
        position.name = object[1].name;
        position.position = object[1].position;
        state.positions.push(position);
      });
      // console.log(positions);
      // console.log(state.positions);
    },
    changePositions(state, positions) {
      state.positions = Object.values(positions);
    }
  },
  actions: {
    autoLogin: async function({ commit, dispatch }) {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          commit('updateLoginUser', user);
          dispatch('fetchData');
        }
      });
    },
    login: async function({ commit }, {email, password}) {
      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            commit('updateLoginUser', user);
            router.push('/');
          }
        });
      } catch(e) {
        console.log(e);
      }
    },
    logout({ commit }) {
      commit('updateLoginUser', null);
      firebase.auth().signOut();
      router.replace('/login');
    },
    fetchData: async function({ commit , getters}) {
      try {
        const response = await firebase.firestore().collection('users').doc(getters.loginUser.uid).get();
        commit('updatePosition', response.data().positions);
      } catch(e) {
        console.log(e);
      }
    },
    testPost: async function(context, {name, players}) {
      const loginUserRef = firebase.firestore().collection('users').doc(this.getters.loginUser.uid);
      firebase.firestore().runTransaction(async transaction =>{
        const loginUser = await transaction.get(loginUserRef);
        const newSetValue = loginUser.data();
        const positions = newSetValue.positions;
        const newPosition = {
          name: name,
          position: players
        }
        positions[name] = newPosition;
        newSetValue.positions = positions;
        await transaction.set(loginUserRef,
          newSetValue
        )
        context.commit('changePositions', positions);
      })
      .catch(() => {
        console.log('error');
      });
    },
    testDelete: async function(context, name) {
      const loginUserRef = firebase.firestore().collection('users').doc(this.getters.loginUser.uid);
      firebase.firestore().runTransaction(async transaction =>{
        const loginUser = await transaction.get(loginUserRef);
        const newSetValue = loginUser.data();
        const positions = newSetValue.positions;
        delete positions[name];
        newSetValue.positions = positions;
        await transaction.set(loginUserRef,
          newSetValue
        )
        context.commit('changePositions', positions);
      })
      .catch(() => {
        console.log('error');
      });
    }
  }
});
