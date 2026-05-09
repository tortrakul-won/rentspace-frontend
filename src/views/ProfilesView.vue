<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { ApiError } from '../api/client'
import RoleBadge from '../components/RoleBadge.vue'
import { minDelay } from '../utils/minDelay'

const router = useRouter()
const { profiles, activeProfile, switchProfile, addProfile } = useAuth()
const { show } = useToast()
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

const addingRole = ref<Role | null>(null)
const newDisplayName = ref('')
const addError = ref('')

function startAdd(role: Role) {
  addingRole.value = role
  newDisplayName.value = ''
  addError.value = ''
}

function cancelAdd() {
  addingRole.value = null
}

async function handleSwitch(profileId: string) {
  showLoading()
  await minDelay(switchProfile(profileId), 800)
  await router.push('/')
  hideLoading()
}

async function handleAdd(role: Role) {
  if (!newDisplayName.value.trim()) {
    addError.value = 'Display name is required'
    return
  }
  showLoading()
  try {
    await minDelay(addProfile(role, newDisplayName.value.trim()), 600)
    show(`${ROLE_META[role].label} profile added!`, 'success')
    addingRole.value = null
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'Something went wrong', 'error')
  } finally {
    hideLoading()
  }
}

</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <div class="max-w-lg mx-auto px-4 py-12">

      <div class="mb-8">
        <button
          @click="router.back()"
          class="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
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
                <span class="text-base font-semibold text-text-primary">{{ ROLE_META[role].label }}</span>
                <RoleBadge :role="role" />
                <span
                  v-if="profileForRole(role)?.id === activeProfile?.id"
                  class="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-emerald-100 text-emerald-700"
                >
                  Active
                </span>
              </div>

              <p class="text-sm text-text-secondary mt-0.5">{{ ROLE_META[role].description }}</p>

              <p
                v-if="profileForRole(role) && profileForRole(role)!.id !== activeProfile?.id"
                class="text-xs text-text-muted mt-1"
              >
                {{ profileForRole(role)!.display_name }}
              </p>
              <p
                v-else-if="profileForRole(role)?.id === activeProfile?.id"
                class="text-xs text-text-muted mt-1"
              >
                {{ activeProfile?.display_name }}
              </p>
            </div>

            <!-- Action -->
            <div class="shrink-0">
              <!-- Active — no action -->
              <span
                v-if="profileForRole(role)?.id === activeProfile?.id"
                class="text-xs text-text-muted"
              >
                Current
              </span>

              <!-- Registered, not active — switch -->
              <button
                v-else-if="profileForRole(role)"
                @click="handleSwitch(profileForRole(role)!.id)"
                class="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
              >
                Switch
              </button>

              <!-- Not registered — add -->
              <button
                v-else-if="addingRole !== role"
                @click="startAdd(role)"
                class="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <!-- Inline add form -->
          <div v-if="addingRole === role" class="mt-4 pt-4 border-t border-border">
            <label class="block text-sm font-medium text-text-primary mb-1.5">
              Display name <span class="text-error">*</span>
              <span class="text-text-muted font-normal ml-1">— shown to other users</span>
            </label>
            <input
              v-model="newDisplayName"
              type="text"
              placeholder="John"
              autofocus
              class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              @keydown.enter="handleAdd(role)"
              @keydown.escape="cancelAdd"
            />
            <p v-if="addError" class="text-xs text-error mt-1">{{ addError }}</p>
            <div class="flex gap-2 mt-3">
              <button
                @click="handleAdd(role)"
                class="px-4 py-2 bg-brand text-text-inverse text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors"
              >
                Add profile
              </button>
              <button
                @click="cancelAdd"
                class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
