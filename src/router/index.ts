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
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('rs_token')
  if (to.meta.requiresGuest && token) return '/'
  if (to.meta.requiresAuth && !token) return '/login'
})
