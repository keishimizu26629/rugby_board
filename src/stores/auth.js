import { defineStore } from 'pinia'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loginUser: null,
    loginError: '',
    isLoading: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.loginUser,
    getLoginUser: (state) => state.loginUser,
    hasLoginError: (state) => !!state.loginError,
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      this.loginError = ''

      try {
        const auth = getAuth()
        const userCredential = await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        )

        this.loginUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || '',
        }

        router.push('/')
      } catch (error) {
        this.loginError = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async register(credentials) {
      this.isLoading = true
      this.loginError = ''

      try {
        const auth = getAuth()
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        )

        this.loginUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || '',
        }

        router.push('/')
      } catch (error) {
        this.loginError = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        const auth = getAuth()
        await signOut(auth)
        this.loginUser = null
        router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    },

    initAuthListener() {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.loginUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
          }
        } else {
          this.loginUser = null
        }
      })
    },

    clearError() {
      this.loginError = ''
    },
  },
})
