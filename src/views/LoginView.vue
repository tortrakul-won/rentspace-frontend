<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { ApiError } from '../api/client'
import AppLogo from '../components/AppLogo.vue'

const router = useRouter()
const { login } = useAuth()
const { show } = useToast()
const { show: showLoading, hide: hideLoading } = useLoading()

onMounted(() => {
  if (sessionStorage.getItem('rs_session_expired')) {
    sessionStorage.removeItem('rs_session_expired')
    show('Session expired. Please sign in again.', 'error')
  }
})

const email = ref('')
const password = ref('')

async function submit() {
  showLoading()
  try {
    await login(email.value, password.value)
    await router.push('/')
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'Something went wrong', 'error')
  } finally {
    hideLoading()
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

      <div class="flex justify-center mb-8">
        <AppLogo size="md" />
      </div>

      <div class="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 class="text-xl font-bold text-text-primary mb-1">Welcome back</h1>
        <p class="text-sm text-text-secondary mb-6">Sign in to your account</p>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1.5">
              Email <span class="text-error">*</span>
            </label>
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
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-sm font-medium text-text-primary">
                Password <span class="text-error">*</span>
              </label>
              <a href="#" class="text-xs text-brand hover:text-brand-hover transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-brand text-text-inverse py-2.5 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors mt-2"
          >
            Sign in
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-text-secondary mt-5">
        Don't have an account?
        <RouterLink to="/register" class="text-brand hover:text-brand-hover font-medium transition-colors">
          Sign up
        </RouterLink>
      </p>

    </div>
  </div>
</template>
