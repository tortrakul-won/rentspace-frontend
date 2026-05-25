<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import AppSpinner from '../components/AppSpinner.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { minDelay } from '../utils/minDelay'
import { listOwnerBookings, updateBookingStatus } from '../api/bookings'
import type { BookingResponse, BookingStatus } from '../api/types'

const { token } = useAuth()
const { show } = useToast()
const route = useRoute()

const bookings = ref<BookingResponse[]>([])
const loading = ref(true)
const fetchError = ref(false)
const actionId = ref<string | null>(null)
const actionStatus = ref<BookingStatus | null>(null)

type OwnerTab = 'requests' | 'active' | 'completed' | 'cancelled'
const activeTab = ref<OwnerTab>('requests')

const TAB_STATUSES: Record<OwnerTab, string[]> = {
  requests:  ['pending'],
  active:    ['payment_pending', 'awaiting_payment', 'payment_review', 'confirmed'],
  completed: ['completed'],
  cancelled: ['cancelled'],
}

const visibleBookings = computed(() =>
  bookings.value.filter((b) => TAB_STATUSES[activeTab.value].includes(b.status))
)

function tabCount(tab: OwnerTab) {
  return bookings.value.filter((b) => TAB_STATUSES[tab].includes(b.status)).length
}

const TABS: { key: OwnerTab; label: string }[] = [
  { key: 'requests',  label: 'Requests' },
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

async function loadBookings() {
  loading.value = true
  fetchError.value = false
  try {
    bookings.value = await listOwnerBookings(token.value!)
  } catch {
    fetchError.value = true
    show('Failed to load bookings', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(loadBookings)
watch(() => route.fullPath, loadBookings)

async function handleAction(id: string, status: BookingStatus) {
  actionId.value = id
  actionStatus.value = status
  try {
    const updated = await minDelay(updateBookingStatus(id, status, token.value!), 500)
    bookings.value = bookings.value.map((b) => b.id === id ? updated : b)
    const label = status === 'awaiting_payment' ? 'Booking accepted — awaiting payment slip' : 'Booking declined'
    show(label, 'success')
  } catch (e: any) {
    show(e?.message ?? 'Action failed', 'error')
  } finally {
    actionId.value = null
    actionStatus.value = null
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
  pending:         { label: 'Pending',          classes: 'bg-amber-100 text-amber-700' },
  payment_pending:  { label: 'Awaiting Payment', classes: 'bg-blue-100 text-blue-700' },
  awaiting_payment: { label: 'Awaiting Slip',    classes: 'bg-blue-100 text-blue-700' },
  payment_review:   { label: 'Under Review',     classes: 'bg-purple-100 text-purple-700' },
  confirmed:       { label: 'Confirmed',        classes: 'bg-emerald-100 text-emerald-700' },
  completed:       { label: 'Completed',        classes: 'bg-surface-muted text-text-secondary' },
  cancelled:       { label: 'Cancelled',        classes: 'bg-red-100 text-red-600' },
}

const TAB_EMPTY: Record<OwnerTab, string> = {
  requests:  'No pending requests',
  active:    'No active bookings',
  completed: 'No completed bookings',
  cancelled: 'No cancelled bookings',
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <h1 class="text-2xl font-bold text-text-primary mb-6">Booking Requests</h1>

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
        <button
          @click="() => { fetchError = false; loading = true; listOwnerBookings(token!).then(b => bookings = b).catch(() => fetchError = true).finally(() => loading = false) }"
          class="text-sm text-brand hover:text-brand-hover font-medium underline underline-offset-2"
        >
          Retry
        </button>
      </div>

      <template v-else>
        <!-- Tabs -->
        <div class="flex gap-1 border-b border-border mb-6">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-brand text-brand'
                : 'border-transparent text-text-muted hover:text-text-primary',
            ]"
          >
            {{ tab.label }}
            <span
              v-if="tabCount(tab.key) > 0"
              :class="[
                'ml-1.5 text-[10px] font-bold rounded-full px-1.5 py-0.5',
                activeTab === tab.key ? 'bg-brand text-text-inverse' : 'bg-surface-muted text-text-muted',
              ]"
            >{{ tabCount(tab.key) }}</span>
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="visibleBookings.length === 0" class="text-center py-24">
          <p class="text-text-primary font-medium mb-1">{{ TAB_EMPTY[activeTab] }}</p>
          <p v-if="activeTab === 'requests'" class="text-text-muted text-sm">New booking requests from renters will appear here</p>
        </div>

        <!-- List -->
        <div v-else class="space-y-4">
          <div
            v-for="booking in visibleBookings"
            :key="booking.id"
            class="bg-surface border border-border rounded-2xl overflow-hidden"
          >
            <div class="flex gap-4 p-5">
              <!-- Space thumbnail -->
              <div class="w-20 h-16 rounded-xl overflow-hidden bg-surface-muted shrink-0">
                <img
                  v-if="booking.space_images?.[0]"
                  :src="booking.space_images[0]"
                  :alt="booking.space_name"
                  class="w-full h-full object-cover"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                  <div class="space-y-0.5 min-w-0">
                    <p v-if="booking.space_name" class="font-medium text-text-primary truncate">{{ booking.space_name }}</p>
                    <p v-if="booking.renter_name" class="text-xs text-text-muted">by {{ booking.renter_name }}</p>
                    <p class="text-sm text-text-muted">{{ formatDateTime(booking.start_time) }} → {{ formatDateTime(booking.end_time) }}</p>
                    <p class="font-mono font-semibold text-text-primary">{{ formatPrice(booking.total_price) }}</p>
                  </div>
                  <span :class="['text-xs font-medium px-2.5 py-1 rounded-full shrink-0', STATUS_META[booking.status]?.classes]">
                    {{ STATUS_META[booking.status]?.label }}
                  </span>
                </div>

                <!-- Actions: Requests tab -->
                <div v-if="activeTab === 'requests'" class="mt-3 flex gap-2 flex-wrap">
                  <button
                    @click="handleAction(booking.id, 'awaiting_payment')"
                    :disabled="actionId === booking.id"
                    class="px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                  >
                    <AppSpinner v-if="actionId === booking.id && actionStatus === 'awaiting_payment'" />
                    <span>{{ actionId === booking.id && actionStatus === 'awaiting_payment' ? 'Processing…' : 'Accept' }}</span>
                  </button>
                  <button
                    @click="handleAction(booking.id, 'cancelled')"
                    :disabled="actionId === booking.id"
                    class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                  >
                    <AppSpinner v-if="actionId === booking.id && actionStatus === 'cancelled'" />
                    <span>{{ actionId === booking.id && actionStatus === 'cancelled' ? 'Processing…' : 'Decline' }}</span>
                  </button>
                </div>

                <!-- Actions: Active tab -->
                <div v-if="activeTab === 'active'" class="mt-3 flex items-center justify-between gap-3">
                  <p v-if="['awaiting_payment', 'payment_pending'].includes(booking.status)" class="text-xs text-text-muted">Awaiting renter payment slip. Admin verifies transfer.</p>
                  <p v-if="booking.status === 'payment_review'" class="text-xs text-text-muted">Payment slip submitted. Under admin review.</p>
                  <p v-if="booking.status === 'confirmed'" class="text-xs text-text-muted">Confirmed. Completes automatically after end time.</p>
                  <button
                    @click="handleAction(booking.id, 'cancelled')"
                    :disabled="actionId === booking.id"
                    class="shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                  >
                    <AppSpinner v-if="actionId === booking.id" />
                    <span>{{ actionId === booking.id ? 'Processing…' : 'Cancel' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
