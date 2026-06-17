<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useLoading } from '../composables/useLoading'
import RoleBadge from '../components/RoleBadge.vue'
import { minDelay } from '../utils/minDelay'

const router = useRouter()
const { profiles, activeProfile, switchProfile } = useAuth()
const { show: showLoading, hide: hideLoading } = useLoading()

const ROLES = ['renter', 'owner'] as const
type Role = typeof ROLES[number]

const ROLE_META: Record<Role, { label: string; description: string; icon: string }> = {
  renter: {
    label: 'Renter',
    description: 'Browse and book spaces for your needs.',
    icon: '🔍',
  },
  owner: {
    label: 'Owner',
    description: 'List and manage your spaces, accept bookings.',
    icon: '🏢',
  },
}

function profileForRole(role: Role) {
  return profiles.value.find((p) => p.role === role) ?? null
}

async function handleSwitch(profileId: string) {
  showLoading()
  await minDelay(switchProfile(profileId), 800)
  await router.push('/')
  hideLoading()
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <div class="max-w-lg mx-auto px-4 py-12">

      <div class="mb-8">
        <button
          @click="router.back()"
          class="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 class="text-2xl font-bold text-text-primary">Profiles</h1>
        <p class="text-sm text-text-secondary mt-1">Switch between roles or add a new profile.</p>
      </div>

      <div class="space-y-3">
        <div
          v-for="role in ROLES"
          :key="role"
          :class="[
            'bg-surface border rounded-2xl p-5 transition-colors',
            profileForRole(role)?.id === activeProfile?.id
              ? 'border-brand ring-1 ring-brand/20'
              : 'border-border',
          ]"
        >
          <div class="flex items-start gap-4">
            <span class="text-2xl mt-0.5">{{ ROLE_META[role].icon }}</span>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-base font-semibold text-text-primary">
                  {{ profileForRole(role)?.profile_name ?? ROLE_META[role].label }}
                </span>
                <RoleBadge :role="role" />
                <span
                  v-if="profileForRole(role)?.id === activeProfile?.id"
                  class="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-emerald-100 text-emerald-700"
                >
                  Active
                </span>
              </div>

              <p class="text-xs text-text-muted mt-0.5">{{ ROLE_META[role].description }}</p>
            </div>

            <!-- Action -->
            <div class="shrink-0 flex flex-col items-end gap-2">
              <span
                v-if="profileForRole(role)?.id === activeProfile?.id"
                class="text-xs text-text-muted"
              >
                Current
              </span>
              <RouterLink
                v-if="profileForRole(role)?.id === activeProfile?.id"
                to="/profile/edit"
                class="text-xs font-medium text-brand hover:text-brand-hover transition-colors"
              >
                Edit
              </RouterLink>
              <button
                v-else-if="profileForRole(role)"
                @click="handleSwitch(profileForRole(role)!.id)"
                class="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
              >
                Switch
              </button>
              <RouterLink
                v-else
                :to="`/profile/add?role=${role}`"
                class="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
              >
                Add
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
