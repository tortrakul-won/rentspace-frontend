<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { ApiError } from '../api/client'

const router = useRouter()
const { register } = useAuth()

const fullName = ref('')
const email = ref('')
const password = ref('')
const displayName = ref('')
const role = ref<'renter' | 'owner'>('renter')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await register(email.value, password.value, fullName.value, displayName.value, role.value)
    router.push('/')
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <RouterLink to="/" class="flex items-center justify-center gap-2 mb-8">
        <div class="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
          <span class="text-text-inverse text-sm font-bold tracking-tight">RS</span>
        </div>
        <span class="font-semibold text-text-primary text-lg tracking-tight">rentspace</span>
      </RouterLink>

      <!-- Card -->
      <div class="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 class="text-xl font-bold text-text-primary mb-1">Create your account</h1>
        <p class="text-sm text-text-secondary mb-6">Start renting or listing spaces today</p>

        <!-- Error -->
        <div
          v-if="error"
          class="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-error text-sm rounded-xl"
        >
          {{ error }}
        </div>

        <form @submit.prevent="submit" class="space-y-4">

          <!-- Role picker -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">I want to…</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="role = 'renter'"
                :class="[
                  'flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-colors',
                  role === 'renter'
                    ? 'border-brand bg-brand-light'
                    : 'border-border bg-surface-subtle hover:bg-surface-hover',
                ]"
              >
                <span class="text-base">🔍</span>
                <span
                  :class="['text-sm font-medium', role === 'renter' ? 'text-brand' : 'text-text-primary']"
                >
                  Rent spaces
                </span>
                <span class="text-xs text-text-muted leading-tight">Browse and book</span>
              </button>
              <button
                type="button"
                @click="role = 'owner'"
                :class="[
                  'flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-colors',
                  role === 'owner'
                    ? 'border-brand bg-brand-light'
                    : 'border-border bg-surface-subtle hover:bg-surface-hover',
                ]"
              >
                <span class="text-base">🏢</span>
                <span
                  :class="['text-sm font-medium', role === 'owner' ? 'text-brand' : 'text-text-primary']"
                >
                  List a space
                </span>
                <span class="text-xs text-text-muted leading-tight">Earn from your space</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1.5">Full name</label>
            <input
              v-model="fullName"
              type="text"
              required
              autocomplete="name"
              placeholder="Priya Tanakorn"
              class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1.5">
              Display name
              <span class="text-text-muted font-normal ml-1">— shown to other users</span>
            </label>
            <input
              v-model="displayName"
              type="text"
              required
              placeholder="Priya"
              class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1.5">Email</label>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <input
              v-model="password"
              type="password"
              required
              autocomplete="new-password"
              placeholder="At least 8 characters"
              class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-brand text-text-inverse py-2.5 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            <span v-if="loading">Creating account…</span>
            <span v-else>Create account</span>
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-text-secondary mt-5">
        Already have an account?
        <RouterLink to="/login" class="text-brand hover:text-brand-hover font-medium transition-colors">
          Sign in
        </RouterLink>
      </p>

    </div>
  </div>
</template>
