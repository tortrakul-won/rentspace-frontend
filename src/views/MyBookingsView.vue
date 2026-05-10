<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import AppSpinner from '../components/AppSpinner.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { minDelay } from '../utils/minDelay'
import { listMyBookings, updateBookingStatus } from '../api/bookings'
import type { BookingResponse } from '../api/types'

const { token } = useAuth()
const { show } = useToast()

const bookings = ref<BookingResponse[]>([])
const loading = ref(true)
const fetchError = ref(false)
const cancellingId = ref<string | null>(null)

onMounted(async () => {
  try {
    bookings.value = await listMyBookings(token.value!)
  } catch {
    fetchError.value = true
    show('Failed to load bookings', 'error')
  } finally {
    loading.value = false
  }
})

async function handleCancel(id: string) {
  cancellingId.value = id
  try {
    await minDelay(updateBookingStatus(id, 'cancelled', token.value!), 500)
    bookings.value = bookings.value.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b)
    show('Booking cancelled', 'success')
  } catch (e: any) {
    show(e?.message ?? 'Failed to cancel', 'error')
  } finally {
    cancellingId.value = null
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatPrice(n: number) {
  return '฿' + n.toLocaleString('th-TH')
}

const STATUS_META: Record<string, { label: string; classes: string }> = {
  pending:   { label: 'Pending',   classes: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmed', classes: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completed', classes: 'bg-surface-muted text-text-secondary' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-600' },
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <h1 class="text-2xl font-bold text-text-primary mb-8">My Bookings</h1>

      <!-- Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-2xl p-5 animate-pulse">
          <div class="h-4 bg-surface-muted rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-surface-muted rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-surface-muted rounded w-1/4"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="text-center py-24">
        <p class="text-text-muted mb-4">Could not load bookings.</p>
        <button @click="() => { fetchError = false; loading = true; listMyBookings(token!).then(b => bookings = b).catch(() => fetchError = true).finally(() => loading = false) }"
          class="text-sm text-brand hover:text-brand-hover font-medium underline underline-offset-2">
          Retry
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="bookings.length === 0" class="text-center py-24">
        <p class="text-text-primary font-medium mb-1">No bookings yet</p>
        <p class="text-text-muted text-sm">Browse spaces and request your first booking</p>
      </div>

      <!-- List -->
      <div v-else class="space-y-4">
        <div
          v-for="booking in bookings"
          :key="booking.id"
          class="bg-surface border border-border rounded-2xl p-5"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="space-y-1">
              <p class="text-sm text-text-muted">{{ formatDateTime(booking.start_time) }} → {{ formatDateTime(booking.end_time) }}</p>
              <p class="font-mono font-semibold text-text-primary">{{ formatPrice(booking.total_price) }}</p>
              <p class="text-xs text-text-muted">Booking #{{ booking.id.slice(0, 8) }}</p>
            </div>
            <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', STATUS_META[booking.status]?.classes]">
              {{ STATUS_META[booking.status]?.label }}
            </span>
          </div>

          <!-- Cancel (pending only) -->
          <div v-if="booking.status === 'pending'" class="mt-3">
            <button
              @click="handleCancel(booking.id)"
              :disabled="cancellingId === booking.id"
              class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
            >
              <AppSpinner v-if="cancellingId === booking.id" />
              <span>{{ cancellingId === booking.id ? 'Cancelling…' : 'Cancel' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
