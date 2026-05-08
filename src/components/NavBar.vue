<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useLoading } from '../composables/useLoading'
import AppLogo from './AppLogo.vue'

const router = useRouter()
const { isAuthenticated, activeProfile, profiles, switchProfile, logout } = useAuth()
const { show: showLoading, hide: hideLoading } = useLoading()

const menuOpen = ref(false)

function closeMenu() { menuOpen.value = false }

async function handleSwitch(profileId: string) {
  closeMenu()
  showLoading()
  await switchProfile(profileId)
  hideLoading()
}

async function handleLogout() {
  closeMenu()
  showLoading()
  await new Promise(r => setTimeout(r, 500))
  logout()
  await router.push('/')
  hideLoading()
}

// Generate a deterministic background colour from the display name
const avatarColor = computed(() => {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-rose-500',   'bg-amber-500', 'bg-cyan-500',
  ]
  const name = activeProfile.value?.display_name ?? ''
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx] ?? 'bg-brand'
})

const avatarInitial = computed(() =>
  (activeProfile.value?.display_name ?? '?')[0].toUpperCase()
)
</script>

<template>
  <header class="sticky top-0 z-40 bg-surface border-b border-border">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

      <AppLogo />

      <nav class="hidden md:flex items-center gap-6 text-sm text-text-secondary">
        <RouterLink to="/" class="hover:text-text-primary transition-colors">Browse</RouterLink>
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
        <button
          @click="menuOpen = !menuOpen"
          class="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-surface-muted transition-colors"
        >
          <!-- Avatar -->
          <div :class="['w-7 h-7 rounded-full flex items-center justify-center shrink-0', avatarColor]">
            <span class="text-white text-xs font-semibold leading-none">{{ avatarInitial }}</span>
          </div>

          <!-- Name + role badge -->
          <div class="hidden sm:flex flex-col items-start leading-none gap-0.5">
            <span class="text-sm font-medium text-text-primary">{{ activeProfile?.display_name ?? '—' }}</span>
            <span
              :class="[
                'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded',
                activeProfile?.role === 'owner'
                  ? 'bg-brand-light text-brand'
                  : 'bg-emerald-100 text-emerald-700',
              ]"
            >
              {{ activeProfile?.role ?? '' }}
            </span>
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
            <p class="text-sm font-medium text-text-primary">{{ activeProfile?.display_name }}</p>
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
              <span
                :class="[
                  'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded',
                  profile.role === 'owner'
                    ? 'bg-brand-light text-brand'
                    : 'bg-emerald-100 text-emerald-700',
                ]"
              >
                {{ profile.role }}
              </span>
              <span>{{ profile.display_name }}</span>
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

        <!-- Click outside to close -->
        <div v-if="menuOpen" class="fixed inset-0 z-40" @click="closeMenu" />
      </div>

    </div>
  </header>
</template>
