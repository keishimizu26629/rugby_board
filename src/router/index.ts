import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import Board from '@/views/Board.vue'
import Login from '@/views/Login.vue'
import Register from '@/components/Register.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'

/**
 * アプリケーションのルート定義
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true,
      title: 'Figmaライク ラグビーボード'
    }
  },
  {
    path: '/board',
    name: 'Board',
    component: Board,
    meta: {
      requiresAuth: true,
      title: '旧仕様 ラグビーボード'
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

/**
 * Vue Router インスタンスの作成
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * ナビゲーションガード
 * 認証状態に基づいてルートアクセスを制御
 */
router.beforeEach((to, _from, next) => {
  const auth = getAuth()

  onAuthStateChanged(auth, (user: User | null) => {
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
