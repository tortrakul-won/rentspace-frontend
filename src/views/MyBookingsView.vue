<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import TabBar from '../components/common/TabBar.vue'
import RenterBookingCard from '../components/booking/RenterBookingCard.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { minDelay } from '../utils/minDelay'
import { listMyBookings, updateBookingStatus } from '../api/bookings'
import type { BookingResponse } from '../api/types'
import { RENTER_TAB_STATUSES } from '../composables/useBookingStatus'

const { token } = useAuth()
const { show } = useToast()
const route = useRoute()

const bookings = ref<BookingResponse[]>([])
const loading = ref(true)
const fetchError = ref(false)
const cancellingId = ref<string | null>(null)
const confirmCancelId = ref<string | null>(null)
const confirmCancelStatus = ref<string | null>(null)

type BookingTab = 'active' | 'completed' | 'cancelled'
const activeTab = ref<BookingTab>('active')

const TABS = [
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const visibleBookings = computed(() => {
  const filtered = bookings.value.filter((b) => RENTER_TAB_STATUSES[activeTab.value].includes(b.status))
  return [...filtered].sort((a, b) => {
    const ta = new Date(a.start_time).getTime()
    const tb = new Date(b.start_time).getTime()
    return activeTab.value === 'active' ? ta - tb : tb - ta
  })
})

function tabCount(tab: BookingTab) {
  return bookings.value.filter((b) => RENTER_TAB_STATUSES[tab].includes(b.status)).length
}

const tabCounts = computed(() =>
  Object.fromEntries(TABS.map((t) => [t.key, tabCount(t.key as BookingTab)]))
)

async function loadBookings() {
  loading.value = true
  fetchError.value = false
  try {
    bookings.value = await listMyBookings(token.value!)
  } catch {
    fetchError.value = true
    show('Failed to load bookings', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(loadBookings)
watch(() => route.fullPath, loadBookings)

function requestCancel(id: string, status: string) {
  confirmCancelId.value = id
  confirmCancelStatus.value = status
}

async function handleCancel() {
  const id = confirmCancelId.value
  if (!id) return
  confirmCancelId.value = null
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
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <h1 class="text-2xl font-bold text-text-primary mb-6">My Bookings</h1>

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-2xl p-5 animate-pulse">
          <div class="h-4 bg-surface-muted rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-surface-muted rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-surface-muted rounded w-1/4"></div>
        </div>
      </div>

      <div v-else-if="fetchError" class="text-center py-24">
        <p class="text-text-muted mb-4">Could not load bookings.</p>
        <button @click="loadBookings" class="text-sm text-brand hover:text-brand-hover font-medium underline underline-offset-2">Retry</button>
      </div>

      <template v-else>
        <TabBar
          :tabs="TABS"
          :model-value="activeTab"
          :counts="tabCounts"
          @update:model-value="activeTab = $event as BookingTab"
        />

        <div v-if="visibleBookings.length === 0" class="text-center py-24">
          <p class="text-text-primary font-medium mb-1">
            {{ activeTab === 'active' ? 'No active bookings' : activeTab === 'completed' ? 'No completed bookings' : 'No cancelled bookings' }}
          </p>
          <p v-if="activeTab === 'active'" class="text-text-muted text-sm">Browse spaces and request your first booking</p>
        </div>

        <div v-else class="space-y-4">
          <RenterBookingCard
            v-for="booking in visibleBookings"
            :key="booking.id"
            :booking="booking"
            :cancelling-id="cancellingId"
            @cancel="requestCancel"
          />
        </div>
      </template>
    </div>
  </div>

  <ConfirmModal
    :open="!!confirmCancelId"
    title="Cancel booking?"
    :message="['payment_review', 'confirmed'].includes(confirmCancelStatus ?? '')
      ? 'This will cancel your booking. If you have already transferred payment, please contact our admin directly to arrange a refund. This cannot be undone.'
      : 'This will cancel your booking. This action cannot be undone.'"
    confirm-label="Yes, cancel"
    destructive
    @confirm="handleCancel"
    @cancel="confirmCancelId = null; confirmCancelStatus = null"
  />
</template>
