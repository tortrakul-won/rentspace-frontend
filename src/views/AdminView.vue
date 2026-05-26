<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { adminListPaymentPending } from '../api/bookings'
import type { BookingResponse } from '../api/types'

const router = useRouter()
const { token, isAdmin } = useAuth()
const { show } = useToast()

type AdminTab = 'payments'
const activeTab = ref<AdminTab>('payments')

const bookings = ref<BookingResponse[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!isAdmin.value) {
    router.replace('/')
    return
  }
  await load()
})

async function load() {
  try {
    bookings.value = await adminListPaymentPending(token.value!)
  } catch {
    show('Failed to load bookings', 'error')
  } finally {
    loading.value = false
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatPrice(n: number) {
  return '฿' + n.toLocaleString('th-TH')
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <div class="max-w-4xl mx-auto px-6 py-10">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-border mb-8">
        <button
          @click="activeTab = 'payments'"
          :class="[
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'payments'
              ? 'border-brand text-brand'
              : 'border-transparent text-text-muted hover:text-text-primary',
          ]"
        >
          Payments
          <span
            v-if="bookings.length > 0"
            class="ml-1.5 bg-error text-text-inverse text-[10px] font-bold rounded-full px-1.5 py-0.5"
          >{{ bookings.length }}</span>
        </button>
      </div>

      <!-- Payments tab -->
      <template v-if="activeTab === 'payments'">

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-2xl p-5 animate-pulse">
          <div class="h-4 bg-surface-muted rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-surface-muted rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="bookings.length === 0" class="text-center py-20">
        <div class="w-14 h-14 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-text-primary font-medium">All clear</p>
        <p class="text-text-muted text-sm mt-1">No payments awaiting verification</p>
      </div>

      <!-- Booking cards -->
      <div v-else class="space-y-6">
        <div
          v-for="b in bookings"
          :key="b.id"
          class="bg-surface border border-border rounded-2xl overflow-hidden"
        >
          <!-- Header: space info + price -->
          <div class="flex items-start gap-4 p-5">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-surface-muted flex-shrink-0">
              <img
                v-if="b.space_images?.[0]"
                :src="b.space_images[0]"
                class="w-full h-full object-cover"
                :alt="b.space_name"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-semibold text-text-primary">{{ b.space_name ?? 'Space' }}</p>
                  <p v-if="b.space_location" class="text-xs text-text-muted mt-0.5">📍 {{ b.space_location }}</p>
                </div>
                <span class="text-base font-mono font-bold text-brand shrink-0">{{ formatPrice(b.total_price) }}</span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-text-muted">
                <span>Renter: <span class="text-text-secondary font-medium">{{ b.renter_name ?? '—' }}</span></span>
                <span>Ref: <span class="text-text-secondary font-mono font-medium">{{ b.ref_code }}</span></span>
                <span>Submitted: {{ formatDateTime(b.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Fee summary + Review button -->
          <div class="border-t border-border px-5 py-4 flex items-center gap-4">
            <div class="flex gap-6 text-sm flex-1">
              <div>
                <p class="text-xs text-text-muted mb-0.5">Platform fee</p>
                <p class="text-text-primary font-medium">{{ formatPrice(b.platform_fee) }}</p>
              </div>
              <div>
                <p class="text-xs text-text-muted mb-0.5">Net to owner</p>
                <p class="text-text-primary font-medium">{{ formatPrice(b.total_price - b.platform_fee) }}</p>
              </div>
            </div>
            <button
              @click="router.push(`/admin/bookings/${b.id}`)"
              class="shrink-0 bg-brand text-text-inverse px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors"
            >
              Review →
            </button>
          </div>
        </div>
      </div>

      </template><!-- /payments tab -->
    </div>
  </div>
</template>
