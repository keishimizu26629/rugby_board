import { createRouter, createWebHistory } from 'vue-router'
import Board from './components/Board.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const routes = [
  {
    path: '/',
    name: 'Board',
    component: Board,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = getAuth()

  onAuthStateChanged(auth, (user) => {
    if (to.meta.requiresAuth && !user) {
      next('/login')
    } else if (to.meta.requiresGuest && user) {
      next('/')
    } else {
      next()
    }
  })
})

export default router
