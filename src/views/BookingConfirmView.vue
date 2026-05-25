<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { getBooking, updateBookingStatus } from '../api/bookings'
import { getPaymentConfig } from '../api/config'
import type { BookingResponse } from '../api/types'
import type { PaymentConfig } from '../api/config'
import { useBookingStatus, RENTER_STATUS_LABEL } from '../composables/useBookingStatus'

const route = useRoute()
const router = useRouter()
const { token } = useAuth()
const { show } = useToast()

const booking = ref<BookingResponse | null>(null)
const loading = ref(true)
const notFound = ref(false)
const paymentConfig = ref<PaymentConfig>({ promptpay_number: '', promptpay_name: '', promptpay_qr_url: '' })

const slipFile = ref<File | null>(null)
const submittingSlip = ref(false)

function onSlipChange(e: Event) {
  const input = e.target as HTMLInputElement
  slipFile.value = input.files?.[0] ?? null
}

async function submitSlip() {
  if (!booking.value || !token.value) return
  submittingSlip.value = true
  try {
    await updateBookingStatus(booking.value.id, 'payment_review', token.value)
    show('Slip submitted — awaiting admin review', 'success')
    await loadBooking(booking.value.id)
  } catch (e: any) {
    show(e?.message ?? 'Failed to submit slip', 'error')
  } finally {
    submittingSlip.value = false
  }
}

async function loadBooking(id: string) {
  loading.value = true
  notFound.value = false
  booking.value = null
  const [bookingResult] = await Promise.allSettled([
    getBooking(id, token.value!),
    getPaymentConfig().then((cfg) => { paymentConfig.value = cfg }).catch(() => {}),
  ])
  if (bookingResult.status === 'fulfilled') {
    booking.value = bookingResult.value
    const b = booking.value
    const expected =
      b.status === 'awaiting_payment' ? `/bookings/${b.id}/payment` :
      b.status === 'payment_review'   ? `/bookings/${b.id}/review` :
      b.status === 'cancelled'        ? `/bookings/${b.id}/cancelled` :
                                        `/bookings/${b.id}/confirm`
    if (route.path !== expected) router.replace(expected)
  } else {
    const e = bookingResult.reason
    if (e?.status === 404) notFound.value = true
    else show('Failed to load booking', 'error')
  }
  loading.value = false
}

onMounted(() => loadBooking(route.params.id as string))
watch(() => route.fullPath, () => { loadBooking(route.params.id as string) })

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(n: number) {
  return '฿' + n.toLocaleString('th-TH')
}

const bookingStatus = computed(() => useBookingStatus(booking.value?.status))
const statusLabel    = computed(() => RENTER_STATUS_LABEL[booking.value?.status ?? ''] ?? booking.value?.status ?? '')
const statusClass    = computed(() => bookingStatus.value.badgeClass)
const isPaymentPending = computed(() => bookingStatus.value.isPaymentDue)
const isPaymentReview  = computed(() => bookingStatus.value.isUnderReview)
const isCancelled      = computed(() => bookingStatus.value.isCancelled)
const isPending        = computed(() => bookingStatus.value.isPending)

const cancelledMessage = computed(() => {
  switch (booking.value?.cancel_reason) {
    case 'renter_cancelled':  return 'You cancelled this booking.'
    case 'owner_declined':    return 'The owner declined your booking.'
    case 'payment_rejected':  return 'Your payment was rejected by the admin.'
    case 'auto_cancelled':    return 'This booking was automatically cancelled when another booking was confirmed.'
    case 'expired':           return 'Your booking request expired before the owner responded.'
    default:                  return 'This booking has been cancelled.'
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <!-- Skeleton -->
    <div v-if="loading" class="max-w-lg mx-auto px-6 py-16 animate-pulse">
      <div class="h-12 bg-surface-muted rounded-full w-12 mx-auto mb-6"></div>
      <div class="h-6 bg-surface-muted rounded w-1/2 mx-auto mb-3"></div>
      <div class="h-4 bg-surface-muted rounded w-3/4 mx-auto"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound || !booking" class="max-w-lg mx-auto px-6 py-16 text-center">
      <p class="text-text-muted mb-4">Booking not found.</p>
      <RouterLink to="/my-bookings" class="text-brand text-sm font-medium hover:underline">View my bookings</RouterLink>
    </div>

    <!-- Confirmation -->
    <div v-else class="max-w-lg mx-auto px-6 py-16">
      <!-- Icon -->
      <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
           :class="isPaymentPending ? 'bg-blue-100' : isPaymentReview ? 'bg-purple-100' : isCancelled ? 'bg-red-100' : 'bg-success-light'">
        <svg v-if="isPaymentPending" class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <svg v-else-if="isPaymentReview" class="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="isCancelled" class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else class="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mb-2" :class="isCancelled ? 'text-red-600' : 'text-text-primary'">
          <template v-if="isPaymentPending">Complete Your Payment</template>
          <template v-else-if="isPaymentReview">Payment Under Review</template>
          <template v-else-if="isCancelled">Booking Cancelled</template>
          <template v-else>Booking Requested</template>
        </h1>
        <p class="text-text-secondary">
          <template v-if="isPaymentPending">The owner has accepted your booking. Please transfer the amount below to confirm your slot.</template>
          <template v-else-if="isPaymentReview">Your payment slip has been submitted. Our team will verify and confirm within 24 hours.</template>
          <template v-else-if="isCancelled">{{ cancelledMessage }}</template>
          <template v-else>Your request has been sent. The owner will confirm or decline shortly.</template>
        </p>
      </div>

      <!-- Cancelled banner -->
      <div v-if="isCancelled" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700 text-center font-medium">
        {{ cancelledMessage }}
      </div>

      <!-- PromptPay payment block (payment_pending only) -->
      <div v-if="isPaymentPending" class="bg-surface border border-border rounded-2xl p-6 mb-6 space-y-5">
        <h2 class="font-semibold text-text-primary text-center">PromptPay Transfer</h2>

        <!-- QR code -->
        <div class="flex justify-center">
          <img
            v-if="paymentConfig.promptpay_qr_url"
            :src="paymentConfig.promptpay_qr_url"
            alt="PromptPay QR"
            class="w-48 h-48 rounded-xl object-contain border border-border"
          />
          <div v-else class="w-48 h-48 rounded-xl bg-surface-muted border-2 border-dashed border-border flex items-center justify-center">
            <div class="text-center text-text-muted">
              <svg class="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <p class="text-xs">PromptPay QR</p>
              <p class="text-xs mt-1">(replace with real QR)</p>
            </div>
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-text-muted">PromptPay number</span>
            <span class="font-mono font-medium text-text-primary">{{ paymentConfig.promptpay_number || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">Account name</span>
            <span class="text-text-primary">{{ paymentConfig.promptpay_name || '—' }}</span>
          </div>
          <div class="flex justify-between font-semibold border-t border-border pt-3 mt-3">
            <span class="text-text-primary">Amount to transfer</span>
            <span class="font-mono text-brand text-base">{{ formatPrice(booking.total_price) }}</span>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1">
          <p class="font-medium">After transferring:</p>
          <ul class="list-disc list-inside space-y-0.5 text-blue-600">
            <li>Take a screenshot or photo of your transfer slip</li>
            <li>Upload it below — our team verifies within 24 hours</li>
            <li>You'll receive a notification when confirmed</li>
          </ul>
        </div>

        <!-- Slip upload -->
        <div class="border-t border-border pt-5 space-y-3">
          <p class="text-sm font-medium text-text-primary">Upload Transfer Slip</p>
          <label class="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand hover:bg-surface-subtle transition-colors">
            <svg class="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span class="text-xs text-text-muted">{{ slipFile ? slipFile.name : 'Click to select image or PDF' }}</span>
            <input type="file" accept="image/*,application/pdf" class="hidden" @change="onSlipChange" />
          </label>
          <button
            @click="submitSlip"
            :disabled="!slipFile || submittingSlip"
            class="w-full py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 bg-brand text-text-inverse hover:bg-brand-hover"
          >
            {{ submittingSlip ? 'Submitting…' : 'Submit Slip for Review' }}
          </button>
        </div>
      </div>

      <!-- Payment review block -->
      <div v-if="isPaymentReview" class="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6 space-y-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-semibold text-purple-800">Slip submitted — awaiting verification</p>
        </div>
        <p class="text-sm text-purple-700">Our admin team will review your transfer and confirm the booking within 24 hours. You'll receive a notification once it's done.</p>
      </div>

      <!-- Booking summary card -->
      <div class="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-sm text-text-muted">Status</span>
          <span class="text-xs font-medium px-2.5 py-1 rounded-full" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <div class="border-t border-border pt-4 space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-text-muted">Check-in</span>
            <span class="text-text-primary font-medium">{{ formatDateTime(booking.start_time) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-text-muted">Check-out</span>
            <span class="text-text-primary font-medium">{{ formatDateTime(booking.end_time) }}</span>
          </div>
          <div class="flex justify-between text-sm font-semibold border-t border-border pt-3">
            <span class="text-text-primary">Total</span>
            <span class="font-mono text-text-primary">{{ formatPrice(booking.total_price) }}</span>
          </div>
        </div>
        <p class="text-xs text-text-muted text-center pt-1">Booking reference: {{ booking.id.slice(0, 8).toUpperCase() }}</p>
      </div>

      <!-- Next steps (pending only) -->
      <div v-if="isPending" class="mt-6 bg-surface-subtle border border-border rounded-xl p-4 text-sm text-text-secondary space-y-2">
        <p class="font-medium text-text-primary">What happens next?</p>
        <ul class="space-y-1 list-disc list-inside text-text-muted">
          <li>The owner has been notified of your request</li>
          <li>Once accepted, you'll be prompted to complete payment via PromptPay</li>
          <li>Our team verifies the transfer and confirms your booking</li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="mt-8 flex flex-col sm:flex-row gap-3">
        <RouterLink
          to="/my-bookings"
          class="flex-1 text-center bg-brand text-text-inverse py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors"
        >
          View my bookings
        </RouterLink>
        <RouterLink
          to="/"
          class="flex-1 text-center bg-surface border border-border text-text-secondary py-3 rounded-xl font-medium hover:bg-surface-muted transition-colors"
        >
          Browse more spaces
        </RouterLink>
      </div>
    </div>
  </div>
</template>
