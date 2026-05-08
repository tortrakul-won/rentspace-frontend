import { createRouter, createWebHistory } from 'vue-router'
import BrowseView from '../views/BrowseView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: BrowseView },
    { path: '/spaces/:id', component: () => import('../views/SpaceDetailView.vue') },
    {
      path: '/login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
  ],
})

// Redirect logged-in users away from /login and /register
router.beforeEach((to) => {
  const token = localStorage.getItem('rs_token')
  if (to.meta.requiresGuest && token) return '/'
})
