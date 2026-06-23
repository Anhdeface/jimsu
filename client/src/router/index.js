import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import AccountView from '@/views/AccountView.vue'
import ListenView from '@/views/ListenView.vue'
import UploadView from '@/views/UploadView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView, meta: { guest: true } },
    { path: '/register', component: RegisterView, meta: { guest: true } },
    { path: '/account', component: AccountView, meta: { requiresAuth: true } },
    { path: '/listen/:slug', component: ListenView },
    { path: '/upload', component: UploadView, meta: { requiresAuth: true } },
    { path: '/about', component: AboutView }
  ]
})

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()
  if (!auth.checked) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.user) {
    return '/login'
  }
  if (to.meta.guest && auth.user) {
    return '/'
  }
})

export default router
