import { createRouter, createWebHistory } from 'vue-router'
import BrowseView from '../views/BrowseView.vue'
import { useAuth } from '../composables/useAuth'

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
      path: '/bookings/:id/payment',
      component: () => import('../views/BookingConfirmView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/bookings/:id/review',
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
  const { isAuthenticated, isAdmin } = useAuth()
  if (to.meta.requiresGuest && isAuthenticated.value) return '/'
  if (to.meta.requiresAuth && !isAuthenticated.value) return '/login'
  if (to.meta.requiresAdmin && !isAdmin.value) return '/'
})
