<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { listOwnerBookings } from '../api/bookings'
import type { BookingResponse } from '../api/types'
import { OWNER_TAB_STATUSES } from '../composables/useBookingStatus'

const router = useRouter()
const { token } = useAuth()
const { show } = useToast()

const bookings = ref<BookingResponse[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    bookings.value = await listOwnerBookings(token.value!)
  } catch {
    show('Failed to load bookings', 'error')
  } finally {
    loading.value = false
  }
})

type Period = 'today' | 'week' | 'month' | 'all'
const period = ref<Period>('month')

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week:  'This week',
  month: 'This month',
  all:   'All time',
}

function periodStart(p: Period): Date | null {
  const now = new Date()
  if (p === 'all') return null
  if (p === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (p === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    return d
  }
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function inPeriod(iso: string): boolean {
  const start = periodStart(period.value)
  return !start || new Date(iso) >= start
}

const stats = computed(() => {
  const completed = bookings.value.filter((b) => b.status === 'completed' && inPeriod(b.end_time))
  const active    = bookings.value.filter((b) => OWNER_TAB_STATUSES.active.includes(b.status) && inPeriod(b.start_time))
  const totalEarned    = completed.reduce((s, b) => s + (b.total_price - b.platform_fee), 0)
  const totalGross     = completed.reduce((s, b) => s + b.total_price, 0)
  const totalFees      = completed.reduce((s, b) => s + b.platform_fee, 0)
  const pendingEarnings = active.reduce((s, b) => s + (b.total_price - b.platform_fee), 0)
  return {
    totalEarned,
    totalGross,
    totalFees,
    completedCount: completed.length,
    pendingEarnings,
    activeCount: active.length,
  }
})

function formatPrice(n: number) {
  return '฿' + n.toLocaleString('th-TH')
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <div class="max-w-3xl mx-auto px-6 py-10">
      <button
        @click="router.back()"
        class="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 class="text-2xl font-bold text-text-primary">Earnings</h1>

        <!-- Period picker -->
        <div class="flex gap-1 bg-surface border border-border rounded-xl p-1">
          <button
            v-for="(label, key) in PERIOD_LABELS"
            :key="key"
            @click="period = key as Period"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              period === key
                ? 'bg-brand text-text-inverse'
                : 'text-text-muted hover:text-text-primary',
            ]"
          >{{ label }}</button>
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div v-for="i in 6" :key="i" class="bg-surface border border-border rounded-2xl p-5 animate-pulse">
          <div class="h-3 bg-surface-muted rounded w-1/2 mb-3"></div>
          <div class="h-6 bg-surface-muted rounded w-2/3"></div>
        </div>
      </div>

      <!-- Cards -->
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div class="bg-surface border border-border rounded-2xl p-5">
          <p class="text-xs text-text-muted mb-1.5">Net earned</p>
          <p class="font-mono text-2xl font-bold text-text-primary">{{ formatPrice(stats.totalEarned) }}</p>
          <p class="text-xs text-text-muted mt-1">{{ stats.completedCount }} completed bookings</p>
        </div>

        <div class="bg-surface border border-border rounded-2xl p-5">
          <p class="text-xs text-text-muted mb-1.5">Gross revenue</p>
          <p class="font-mono text-2xl font-bold text-text-primary">{{ formatPrice(stats.totalGross) }}</p>
          <p class="text-xs text-text-muted mt-1">before platform fee</p>
        </div>

        <div class="bg-surface border border-border rounded-2xl p-5">
          <p class="text-xs text-text-muted mb-1.5">Platform fees</p>
          <p class="font-mono text-2xl font-bold text-text-primary">{{ formatPrice(stats.totalFees) }}</p>
          <p class="text-xs text-text-muted mt-1">deducted from gross</p>
        </div>

        <div class="bg-surface border border-border rounded-2xl p-5">
          <p class="text-xs text-text-muted mb-1.5">In progress</p>
          <p class="font-mono text-2xl font-bold text-text-primary">{{ formatPrice(stats.pendingEarnings) }}</p>
          <p class="text-xs text-text-muted mt-1">{{ stats.activeCount }} active bookings</p>
        </div>

        <div class="bg-surface border border-border rounded-2xl p-5">
          <p class="text-xs text-text-muted mb-1.5">Avg per booking</p>
          <p class="font-mono text-2xl font-bold text-text-primary">
            {{ stats.completedCount > 0 ? formatPrice(Math.round(stats.totalEarned / stats.completedCount)) : '฿—' }}
          </p>
          <p class="text-xs text-text-muted mt-1">net, completed only</p>
        </div>

        <div class="bg-surface border border-border rounded-2xl p-5">
          <p class="text-xs text-text-muted mb-1.5">Total bookings</p>
          <p class="text-2xl font-bold text-text-primary">{{ bookings.length }}</p>
          <p class="text-xs text-text-muted mt-1">all time, all statuses</p>
        </div>
      </div>
    </div>
  </div>
</template>
