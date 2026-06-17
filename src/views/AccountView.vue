<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { user } = useAuth()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
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
        <h1 class="text-2xl font-bold text-text-primary">Account</h1>
        <p class="text-sm text-text-secondary mt-1">Your personal information.</p>
      </div>

      <div class="bg-surface border border-border rounded-2xl divide-y divide-border">

        <!-- Email (read-only) -->
        <div class="p-5">
          <p class="text-xs font-medium text-text-secondary">Email</p>
          <p class="text-sm text-text-primary mt-0.5">{{ user?.email }}</p>
        </div>


        <!-- Member since -->
        <div class="p-5">
          <p class="text-xs font-medium text-text-secondary">Member since</p>
          <p class="text-sm text-text-primary mt-0.5">{{ user?.created_at ? formatDate(user.created_at) : '—' }}</p>
        </div>

      </div>
    </div>
  </div>
</template>
