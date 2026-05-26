<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { getUnreadCount, listNotifications, markAllNotificationsRead } from '../api/notifications'
import { BASE } from '../api/client'
import type { NotificationResponse } from '../api/types'

const emit = defineEmits<{ open: [] }>()

const { token, isAuthenticated } = useAuth()
const router = useRouter()
const route = useRoute()

const notifOpen = ref(false)
const unreadCount = ref(0)
const notifications = ref<NotificationResponse[]>([])

let abortController: AbortController | null = null
let fallbackTimer: ReturnType<typeof setInterval> | null = null
let retryDelay = 3_000

async function fetchUnreadCount() {
  if (!token.value) return
  try {
    const res = await getUnreadCount(token.value)
    unreadCount.value = res.count
  } catch { /* silent */ }
}

function startFallbackPoll() {
  if (fallbackTimer) return
  fetchUnreadCount()
  fallbackTimer = setInterval(fetchUnreadCount, 30_000)
}

function clearFallbackPoll() {
  if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null }
}

// Connect via fetch-based SSE so we can send the Authorization header.
// Retries with exponential backoff on transient errors; falls back to polling only on 401.
async function connectSSE() {
  if (!token.value || !isAuthenticated.value) return
  abortController = new AbortController()

  try {
    const res = await fetch(`${BASE}/api/v1/notifications/stream`, {
      headers: { Authorization: `Bearer ${token.value}` },
      signal: abortController.signal,
    })

    if (res.status === 401) {
      // Auth gone — poll until token watcher reconnects SSE on re-auth
      startFallbackPoll()
      return
    }
    if (!res.ok || !res.body) throw new Error('sse-unavailable')

    clearFallbackPoll()
    retryDelay = 3_000 // reset backoff on successful connection

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const chunks = buf.split('\n\n')
      buf = chunks.pop() ?? ''
      for (const chunk of chunks) {
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            if (evt.type === 'notification') {
              unreadCount.value++
              if (notifOpen.value) {
                notifications.value = [evt.payload as NotificationResponse, ...notifications.value]
              }
            } else if (evt.type === 'payment_review') {
              unreadCount.value++
              if (notifOpen.value) {
                notifications.value = await listNotifications(token.value!)
              }
            }
          } catch { /* malformed event */ }
        }
      }
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') return // intentional cleanup
    // Transient error — retry with exponential backoff (3 s → 6 s → 12 s … max 30 s)
    if (!abortController?.signal.aborted) {
      setTimeout(connectSSE, retryDelay)
      retryDelay = Math.min(retryDelay * 2, 30_000)
    }
    return
  }

  // Server closed stream cleanly — reconnect after 3 s unless we're unmounting
  if (!abortController?.signal.aborted) {
    retryDelay = 3_000
    setTimeout(connectSSE, 3_000)
  }
}

// Reconnect SSE when token changes (re-auth, session restore)
watch(token, (newToken, oldToken) => {
  if (newToken && newToken !== oldToken) {
    abortController?.abort()
    clearFallbackPoll()
    retryDelay = 3_000
    connectSSE()
  } else if (!newToken) {
    abortController?.abort()
    clearFallbackPoll()
    unreadCount.value = 0
  }
})

async function openNotifs() {
  notifOpen.value = !notifOpen.value
  if (notifOpen.value) {
    emit('open')
    if (token.value) {
      try {
        notifications.value = await listNotifications(token.value)
        await markAllNotificationsRead(token.value)
        unreadCount.value = 0
      } catch { /* silent */ }
    }
  }
}

function closeNotifs() { notifOpen.value = false }

function handleNotifClick(n: NotificationResponse) {
  closeNotifs()
  unreadCount.value = 0
  const target = notifLink(n)
  if (route.path === target) {
    router.push({ path: target, query: { _t: Date.now() } })
  } else {
    router.push(target)
  }
}

const NOTIF_LABEL: Record<string, string> = {
  booking_request:             'New booking request',
  payment_required:            'Payment required',
  booking_confirmed:           'Booking confirmed',
  booking_cancelled_by_owner:  'Booking cancelled by owner',
  booking_cancelled_by_renter: 'Booking cancelled by renter',
  backup_booking_cancelled:    'Backup booking cancelled',
  payment_rejected:            'Payment rejected',
  payment_rejected_retry:      'Slip rejected — please resubmit',
  payment_review:              'New payment slip to review',
  booking_confirmed_owner:     'Booking confirmed — payment received',
}

function notifLabel(type: string) {
  return NOTIF_LABEL[type] ?? type.replace(/_/g, ' ')
}

function notifTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

const OWNER_NOTIF_TYPES = new Set(['booking_request', 'booking_cancelled_by_renter'])
const CANCELLED_NOTIF_TYPES = new Set(['booking_cancelled_by_owner', 'backup_booking_cancelled', 'payment_rejected'])

function notifLink(n: NotificationResponse): string {
  const bookingId = n.booking_id ?? n.payload?.booking_id
  if (n.type === 'payment_review') return bookingId ? `/admin/bookings/${bookingId}` : '/admin'
  if (n.type === 'booking_confirmed_owner') return '/owner/bookings'
  if (OWNER_NOTIF_TYPES.has(n.type)) return '/owner/bookings'
  if (CANCELLED_NOTIF_TYPES.has(n.type)) return bookingId ? `/bookings/${bookingId}/cancelled` : '/my-bookings'
  if (n.type === 'payment_rejected_retry') return bookingId ? `/bookings/${bookingId}/payment` : '/my-bookings'
  if (n.type === 'payment_required') return bookingId ? `/bookings/${bookingId}/payment` : '/my-bookings'
  if (n.type === 'booking_confirmed') return bookingId ? `/bookings/${bookingId}/confirm` : '/my-bookings'
  if (bookingId) return `/bookings/${bookingId}/confirm`
  return '/my-bookings'
}

onMounted(() => {
  if (isAuthenticated.value) {
    fetchUnreadCount()
    connectSSE()
  }
})

onUnmounted(() => {
  abortController?.abort()
  clearFallbackPoll()
})
</script>

<template>
  <div class="relative">
    <button
      @click="openNotifs"
      class="relative p-2 rounded-lg hover:bg-surface-muted transition-colors text-text-muted hover:text-text-primary"
      title="Notifications"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-error text-text-inverse text-[10px] font-bold rounded-full flex items-center justify-center px-1"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="notifOpen"
      class="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden"
    >
      <div class="px-3 py-2.5 border-b border-border">
        <p class="text-sm font-medium text-text-primary">Notifications</p>
      </div>

      <!-- Empty state -->
      <div v-if="notifications.length === 0" class="px-4 py-8 text-center">
        <p class="text-sm text-text-muted">No notifications yet</p>
      </div>

      <!-- List -->
      <ul v-else class="max-h-80 overflow-y-auto divide-y divide-border">
        <template v-for="n in notifications" :key="n.id">
          <!-- Active: clickable -->
          <li
            v-if="!n.superseded_at"
            @click="handleNotifClick(n)"
            class="flex items-start gap-2 px-3 py-3 hover:bg-surface-subtle transition-colors cursor-pointer list-none"
          >
            <span v-if="!n.read_at" class="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0"></span>
            <span v-else class="mt-1.5 w-1.5 h-1.5 shrink-0"></span>
            <div>
              <p v-if="n.payload?.space_name" class="text-xs font-medium text-brand mb-0.5 leading-none">{{ n.payload.space_name }}</p>
              <p class="text-sm font-medium text-text-primary leading-snug">{{ notifLabel(n.type) }}</p>
              <p class="text-xs text-text-muted mt-1">{{ notifTime(n.created_at) }}</p>
            </div>
          </li>
          <!-- Superseded: grayed, not clickable -->
          <div v-else class="flex items-start gap-2 px-3 py-3 opacity-50">
            <span class="mt-1.5 w-1.5 h-1.5 shrink-0"></span>
            <div>
              <p v-if="n.payload?.space_name" class="text-xs font-medium text-text-muted mb-0.5 leading-none">{{ n.payload.space_name }}</p>
              <p class="text-sm text-text-muted leading-snug">{{ notifLabel(n.type) }}</p>
              <p class="text-xs text-text-muted mt-1">{{ notifTime(n.created_at) }}</p>
            </div>
          </div>
        </template>
      </ul>
    </div>

    <!-- Click outside -->
    <div v-if="notifOpen" class="fixed inset-0 z-40" @click="closeNotifs" />
  </div>
</template>
