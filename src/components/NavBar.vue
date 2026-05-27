<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useLoading } from '../composables/useLoading'
import AppLogo from './AppLogo.vue'
import RoleBadge from './RoleBadge.vue'
import NotificationBell from './NotificationBell.vue'
import { minDelay } from '../utils/minDelay'

const router = useRouter()
const { isAuthenticated, isAdmin, activeProfile, profiles, switchProfile, logout, token } = useAuth()
const { show: showLoading, hide: hideLoading } = useLoading()

const menuOpen = ref(false)

function closeMenu() { menuOpen.value = false }

async function handleSwitch(profileId: string) {
  closeMenu()
  showLoading()
  await minDelay(switchProfile(profileId), 800)
  hideLoading()
}

async function handleLogout() {
  closeMenu()
  showLoading()
  await minDelay(Promise.resolve(), 500)
  logout()
  await router.push('/')
  hideLoading()
}

const avatarColor = computed(() => {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-rose-500',   'bg-amber-500', 'bg-cyan-500',
  ]
  const name = activeProfile.value?.profile_name ?? ''
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx] ?? 'bg-brand'
})

const avatarInitial = computed(() =>
  (activeProfile.value?.profile_name ?? '?')[0].toUpperCase()
)
</script>

<template>
  <header class="sticky top-0 z-40 bg-surface border-b border-border">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

      <AppLogo />

      <nav class="hidden md:flex items-center gap-6 text-sm text-text-secondary">
        <RouterLink to="/" class="hover:text-text-primary transition-colors">Browse</RouterLink>
        <RouterLink
          v-if="activeProfile?.role === 'owner'"
          to="/my-spaces"
          class="hover:text-text-primary transition-colors"
        >My Spaces</RouterLink>
        <RouterLink
          v-if="activeProfile?.role === 'owner'"
          to="/owner/bookings"
          class="hover:text-text-primary transition-colors"
        >Bookings</RouterLink>
        <RouterLink
          v-if="activeProfile?.role === 'owner'"
          to="/owner/earnings"
          class="hover:text-text-primary transition-colors"
        >Earnings</RouterLink>
        <RouterLink
          v-if="activeProfile?.role === 'renter'"
          to="/my-bookings"
          class="hover:text-text-primary transition-colors"
        >My Bookings</RouterLink>
        <a href="#" class="hover:text-text-primary transition-colors">How it works</a>
      </nav>

      <!-- Unauthenticated -->
      <div v-if="!isAuthenticated" class="flex items-center gap-3 ml-auto">
        <RouterLink
          to="/register"
          class="hidden md:block text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          List your space
        </RouterLink>
        <RouterLink
          to="/login"
          class="text-sm bg-brand text-text-inverse px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors font-medium"
        >
          Sign in
        </RouterLink>
      </div>

      <!-- Authenticated -->
      <div v-else class="flex items-center gap-3 ml-auto relative">

        <NotificationBell @open="menuOpen = false" />

        <button
          @click="menuOpen = !menuOpen"
          class="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-muted transition-colors"
        >
          <!-- Avatar -->
          <div :class="['w-7 h-7 rounded-full flex items-center justify-center shrink-0', avatarColor]">
            <span class="text-white text-xs font-semibold leading-none">{{ avatarInitial }}</span>
          </div>

          <!-- Name + role badge -->
          <div class="hidden sm:flex flex-col items-start leading-none gap-0.5">
            <span class="text-sm font-medium text-text-primary">{{ activeProfile?.profile_name ?? '—' }}</span>
            <RoleBadge v-if="activeProfile?.role" :role="activeProfile.role" />
          </div>

          <svg
            :class="['hidden sm:block w-3.5 h-3.5 text-text-muted transition-transform shrink-0', menuOpen && 'rotate-180']"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown -->
        <div
          v-if="menuOpen"
          class="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg py-1 z-50"
        >
          <!-- Profile info header -->
          <div class="px-3 py-2.5 border-b border-border mb-1">
            <p class="text-sm font-medium text-text-primary">{{ activeProfile?.profile_name }}</p>
            <p class="text-xs text-text-muted mt-0.5">{{ activeProfile?.role === 'owner' ? 'Owner account' : 'Renter account' }}</p>
          </div>

          <template v-if="profiles.length > 1">
            <p class="px-3 pt-1.5 pb-1 text-xs font-medium text-text-muted uppercase tracking-wide">Switch profile</p>
            <button
              v-for="profile in profiles"
              :key="profile.id"
              @click="handleSwitch(profile.id)"
              :class="[
                'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                profile.id === activeProfile?.id
                  ? 'text-brand bg-brand-light'
                  : 'text-text-primary hover:bg-surface-subtle',
              ]"
            >
              <RoleBadge :role="profile.role" />
              <span>{{ profile.profile_name }}</span>
              <svg
                v-if="profile.id === activeProfile?.id"
                class="ml-auto w-3.5 h-3.5 text-brand shrink-0"
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <div class="my-1 border-t border-border" />
          </template>

          <RouterLink
            v-if="activeProfile?.role === 'owner'"
            to="/my-spaces"
            @click="closeMenu"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            My Spaces
          </RouterLink>
          <RouterLink
            v-if="activeProfile?.role === 'owner'"
            to="/owner/bookings"
            @click="closeMenu"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Bookings
          </RouterLink>
          <RouterLink
            v-if="activeProfile?.role === 'owner'"
            to="/owner/earnings"
            @click="closeMenu"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Earnings
          </RouterLink>
          <RouterLink
            v-if="activeProfile?.role === 'renter'"
            to="/my-bookings"
            @click="closeMenu"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            My Bookings
          </RouterLink>
          <RouterLink
            to="/account"
            @click="closeMenu"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Account
          </RouterLink>
          <RouterLink
            to="/profiles"
            @click="closeMenu"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Manage profiles
          </RouterLink>
          <div class="my-1 border-t border-border" />

          <!-- Admin link -->
          <RouterLink
            v-if="isAdmin"
            to="/admin"
            @click="closeMenu"
            class="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Dashboard
          </RouterLink>

          <button
            @click="handleLogout"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-error hover:bg-red-50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>

        <!-- Click outside to close menu -->
        <div v-if="menuOpen" class="fixed inset-0 z-40" @click="closeMenu" />
      </div>

    </div>
  </header>
</template>
