import { createRouter, createWebHistory } from 'vue-router'
import BrowseView from '../views/BrowseView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: BrowseView },
    { path: '/spaces/:id', component: () => import('../views/SpaceDetailView.vue') },
    {
      path: '/bookings/:id/confirm',
      component: () => import('../views/BookingConfirmView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/bookings/:id/cancelled',
      component: () => import('../views/BookingConfirmView.vue'),
      meta: { requiresAuth: true },
    },
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
    {
      path: '/profiles',
      component: () => import('../views/ProfilesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-spaces',
      component: () => import('../views/MySpacesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/spaces/new',
      component: () => import('../views/CreateSpaceView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/spaces/:id/edit',
      component: () => import('../views/EditSpaceView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-bookings',
      component: () => import('../views/MyBookingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/owner/bookings',
      component: () => import('../views/OwnerBookingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('rs_token')
  if (to.meta.requiresGuest && token) return '/'
  if (to.meta.requiresAuth && !token) return '/login'
  if (to.meta.requiresAdmin) {
    const userRaw = localStorage.getItem('rs_user')
    const user = userRaw ? JSON.parse(userRaw) : null
    if (!user?.is_admin) return '/'
  }
})
