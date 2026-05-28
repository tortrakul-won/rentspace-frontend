<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import TabBar from '../components/common/TabBar.vue'
import OwnerBookingCard from '../components/booking/OwnerBookingCard.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { minDelay } from '../utils/minDelay'
import { listOwnerBookings, updateBookingStatus } from '../api/bookings'
import { formatPrice } from '../utils/format'
import type { BookingResponse, BookingStatus } from '../api/types'
import { OWNER_TAB_STATUSES } from '../composables/useBookingStatus'

const { token } = useAuth()
const { show } = useToast()
const route = useRoute()

const bookings = ref<BookingResponse[]>([])
const loading = ref(true)
const fetchError = ref(false)
const actionId = ref<string | null>(null)
const actionStatus = ref<BookingStatus | null>(null)
const confirmAction = ref<{ id: string; status: BookingStatus; title: string; message: string } | null>(null)

type OwnerTab = 'requests' | 'active' | 'completed' | 'cancelled'
const activeTab = ref<OwnerTab>('requests')

const TABS = [
  { key: 'requests',  label: 'Requests' },
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const visibleBookings = computed(() =>
  bookings.value.filter((b) => OWNER_TAB_STATUSES[activeTab.value].includes(b.status))
)

function tabCount(tab: OwnerTab) {
  return bookings.value.filter((b) => OWNER_TAB_STATUSES[tab].includes(b.status)).length
}

const tabCounts = computed(() =>
  Object.fromEntries(TABS.map((t) => [t.key, tabCount(t.key as OwnerTab)]))
)

const TAB_EMPTY: Record<OwnerTab, string> = {
  requests:  'No pending requests',
  active:    'No active bookings',
  completed: 'No completed bookings',
  cancelled: 'No cancelled bookings',
}

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

function syncTabFromQuery() {
  const q = route.query.tab
  if (q === 'requests' || q === 'active' || q === 'completed' || q === 'cancelled') {
    activeTab.value = q
  }
}

onMounted(() => { syncTabFromQuery(); loadBookings() })
watch(() => route.fullPath, () => { syncTabFromQuery(); loadBookings() })

function requestAction(id: string, status: BookingStatus, title: string, message: string) {
  confirmAction.value = { id, status, title, message }
}

async function handleConfirmedAction() {
  const item = confirmAction.value
  if (!item) return
  confirmAction.value = null
  actionId.value = item.id
  actionStatus.value = item.status
  try {
    const updated = await minDelay(updateBookingStatus(item.id, item.status, token.value!), 500)
    bookings.value = bookings.value.map((b) => b.id === item.id ? updated : b)
    const label = item.status === 'awaiting_payment' ? 'Booking accepted — awaiting payment slip' : 'Booking declined'
    show(label, 'success')
  } catch (e: any) {
    show(e?.message ?? 'Action failed', 'error')
  } finally {
    actionId.value = null
    actionStatus.value = null
  }
}

const earnedThisMonth = computed(() => {
  const start = new Date()
  start.setDate(1); start.setHours(0, 0, 0, 0)
  return bookings.value
    .filter((b) => b.status === 'completed' && new Date(b.end_time) >= start)
    .reduce((sum, b) => sum + (b.total_price - b.platform_fee), 0)
})
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <h1 class="text-2xl font-bold text-text-primary mb-6">Bookings</h1>

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
        <!-- Status line -->
        <div class="flex items-center gap-3 mb-6 flex-wrap">
          <span v-if="tabCount('requests') > 0" class="inline-flex items-center gap-1.5 text-xs text-warning font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-warning inline-block"></span>
            {{ tabCount('requests') }} pending {{ tabCount('requests') === 1 ? 'request' : 'requests' }}
          </span>
          <span v-if="tabCount('active') > 0" class="inline-flex items-center gap-1.5 text-xs text-success font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
            {{ tabCount('active') }} active
          </span>
          <RouterLink
            to="/owner/earnings"
            class="inline-flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors ml-auto"
          >
            <span class="font-mono">{{ formatPrice(earnedThisMonth) }}</span>
            <span>this month</span>
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </RouterLink>
        </div>

        <TabBar
          :tabs="TABS"
          :model-value="activeTab"
          :counts="tabCounts"
          @update:model-value="activeTab = $event as OwnerTab"
        />

        <div v-if="visibleBookings.length === 0" class="text-center py-24">
          <p class="text-text-primary font-medium mb-1">{{ TAB_EMPTY[activeTab] }}</p>
          <p v-if="activeTab === 'requests'" class="text-text-muted text-sm">New booking requests from renters will appear here</p>
        </div>

        <div v-else class="space-y-4">
          <OwnerBookingCard
            v-for="booking in visibleBookings"
            :key="booking.id"
            :booking="booking"
            :tab="activeTab"
            :action-id="actionId"
            @action="requestAction"
          />
        </div>
      </template>
    </div>
  </div>

  <ConfirmModal
    :open="!!confirmAction"
    :title="confirmAction?.title ?? ''"
    :message="confirmAction?.message"
    :confirm-label="confirmAction?.status === 'awaiting_payment' ? 'Yes, accept' : 'Yes, confirm'"
    :destructive="confirmAction?.status === 'cancelled'"
    @confirm="handleConfirmedAction"
    @cancel="confirmAction = null"
  />
</template>
