<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { getBooking, updateBookingStatus } from '../api/bookings'
import { getPaymentConfig } from '../api/config'
import type { RenterBookingDetailResponse } from '../api/types'
import type { PaymentConfig } from '../api/config'
import { useBookingStatus, RENTER_STATUS_LABEL } from '../composables/useBookingStatus'
import { formatPhone } from '../utils/format'

const route = useRoute()
const router = useRouter()
const { token } = useAuth()
const { show } = useToast()

const booking = ref<RenterBookingDetailResponse | null>(null)
const loading = ref(true)
const notFound = ref(false)
const paymentConfig = ref<PaymentConfig>({ promptpay_number: '', promptpay_name: '', promptpay_qr_url: '' })

const slipFile = ref<File | null>(null)
const slipPreviewUrl = ref<string | null>(null)
const submittingSlip = ref(false)
const confirmSubmitSlip = ref(false)
const confirmCancel = ref(false)
const cancelling = ref(false)
const slipInput = ref<HTMLInputElement | null>(null)

function onSlipChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (slipPreviewUrl.value) URL.revokeObjectURL(slipPreviewUrl.value)
  const file = input.files?.[0] ?? null
  slipFile.value = file
  slipPreviewUrl.value = file ? URL.createObjectURL(file) : null
}

function clearSlip() {
  if (slipPreviewUrl.value) URL.revokeObjectURL(slipPreviewUrl.value)
  slipFile.value = null
  slipPreviewUrl.value = null
  if (slipInput.value) slipInput.value.value = ''
}

onUnmounted(() => {
  if (slipPreviewUrl.value) URL.revokeObjectURL(slipPreviewUrl.value)
})

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

async function cancelBooking() {
  if (!booking.value || !token.value) return
  cancelling.value = true
  try {
    await updateBookingStatus(booking.value.id, 'cancelled', token.value)
    show('Booking cancelled', 'success')
    await loadBooking(booking.value.id)
  } catch (e: any) {
    show(e?.message ?? 'Failed to cancel booking', 'error')
  } finally {
    cancelling.value = false
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

const bookingStatus    = computed(() => useBookingStatus(booking.value?.status))
const statusLabel      = computed(() => RENTER_STATUS_LABEL[booking.value?.status ?? ''] ?? booking.value?.status ?? '')
const statusClass      = computed(() => bookingStatus.value.badgeClass)
const isPaymentPending = computed(() => bookingStatus.value.isPaymentDue)
const isPaymentReview  = computed(() => bookingStatus.value.isUnderReview)
const isCancelled      = computed(() => bookingStatus.value.isCancelled)
const isPending        = computed(() => bookingStatus.value.isPending)
const isConfirmed      = computed(() => bookingStatus.value.isConfirmed)
const isCompleted      = computed(() => bookingStatus.value.isCompleted)
const isCancellable    = computed(() => bookingStatus.value.isCancellable)

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

// --- Timeline ---
const TIMELINE_STEPS = [
  { key: 'pending',          label: 'Requested' },
  { key: 'awaiting_payment', label: 'Pay' },
  { key: 'payment_review',   label: 'Review' },
  { key: 'confirmed',        label: 'Confirmed' },
  { key: 'completed',        label: 'Completed' },
]

const currentStepIndex = computed(() => {
  const s = booking.value?.status
  if (s === 'pending')          return 0
  if (s === 'awaiting_payment' || s === 'payment_pending') return 1
  if (s === 'payment_review')   return 2
  if (s === 'confirmed')        return 3
  if (s === 'completed')        return 4
  return -1
})

function stepState(idx: number): 'done' | 'current' | 'upcoming' {
  const cur = currentStepIndex.value
  if (idx < cur)  return 'done'
  if (idx === cur) return 'current'
  return 'upcoming'
}

const spaceThumb = computed(() => booking.value?.space_images?.[0] ?? null)
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

    <!-- Content -->
    <div v-else class="max-w-lg mx-auto px-6 py-10">

      <!-- Status icon + title -->
      <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
           :class="isPaymentPending ? 'bg-blue-100' : isPaymentReview ? 'bg-purple-100' : isCancelled ? 'bg-red-100' : isCompleted ? 'bg-surface-muted' : 'bg-success-light'">
        <svg v-if="isPaymentPending" class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <svg v-else-if="isPaymentReview" class="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="isCancelled" class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else-if="isCompleted" class="w-7 h-7 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold mb-2" :class="isCancelled ? 'text-red-600' : 'text-text-primary'">
          <template v-if="isPaymentPending">Complete Your Payment</template>
          <template v-else-if="isPaymentReview">Payment Under Review</template>
          <template v-else-if="isCancelled">Booking Cancelled</template>
          <template v-else-if="isConfirmed">Booking Confirmed</template>
          <template v-else-if="isCompleted">Booking Completed</template>
          <template v-else>Booking Requested</template>
        </h1>
        <p class="text-text-secondary text-sm">
          <template v-if="isPaymentPending">The owner has accepted your booking. Please transfer the amount below to confirm your slot.</template>
          <template v-else-if="isPaymentReview">Your payment slip has been submitted. Our team will verify and confirm within 24 hours.</template>
          <template v-else-if="isCancelled">{{ cancelledMessage }}</template>
          <template v-else-if="isConfirmed">Your booking is confirmed. See below for check-in details and owner contact.</template>
          <template v-else-if="isCompleted">This booking has been completed. Thanks for using RentSpace.</template>
          <template v-else>Your request has been sent. The owner will confirm or decline shortly.</template>
        </p>
      </div>

      <!-- Status timeline (non-cancelled only) -->
      <div v-if="!isCancelled" class="mb-8">
        <div class="flex items-center">
          <template v-for="(step, idx) in TIMELINE_STEPS" :key="step.key">
            <div class="flex flex-col items-center shrink-0">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                :class="{
                  'bg-success text-white':       stepState(idx) === 'done',
                  'bg-brand text-white':         stepState(idx) === 'current',
                  'bg-surface border border-border': stepState(idx) === 'upcoming',
                }"
              >
                <svg v-if="stepState(idx) === 'done'" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div v-else-if="stepState(idx) === 'current'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <span
                class="text-xs mt-1 text-center leading-tight w-12"
                :class="{
                  'text-success':       stepState(idx) === 'done',
                  'text-brand font-medium': stepState(idx) === 'current',
                  'text-text-muted':    stepState(idx) === 'upcoming',
                }"
              >{{ step.label }}</span>
            </div>
            <div
              v-if="idx < TIMELINE_STEPS.length - 1"
              class="flex-1 h-px mx-1 mb-4 transition-colors"
              :class="stepState(idx) === 'done' ? 'bg-success' : 'bg-border'"
            ></div>
          </template>
        </div>
      </div>

      <!-- Booking summary card -->
      <div class="bg-surface border border-border rounded-2xl p-6 space-y-3 mb-4">
        <!-- Space identity -->
        <div class="flex items-center gap-3 pb-3 border-b border-border">
          <img
            v-if="spaceThumb"
            :src="spaceThumb"
            :alt="booking.space_name"
            class="w-12 h-12 rounded-lg object-cover shrink-0 border border-border"
          />
          <div
            v-else
            class="w-12 h-12 rounded-lg bg-surface-muted border border-border shrink-0 flex items-center justify-center"
          >
            <svg class="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-text-primary text-sm truncate">{{ booking.space_name }}</p>
            <p class="text-xs text-text-muted truncate">{{ booking.space_location }}</p>
          </div>
        </div>
        <div class="flex justify-between items-center py-1">
          <span class="text-sm text-text-muted">Status</span>
          <span class="text-xs font-medium px-2.5 py-1 rounded-full" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <div class="border-t border-border pt-3 space-y-3">
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
          <div class="flex justify-between items-center text-sm border-t border-border pt-3">
            <span class="text-text-muted">Ref</span>
            <span class="font-mono text-text-primary">{{ booking.ref_code }}</span>
          </div>
        </div>
      </div>

      <!-- Cancelled banner -->
      <div v-if="isCancelled" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700 text-center font-medium">
        {{ cancelledMessage }}
      </div>

      <!-- PromptPay payment block (awaiting_payment only) -->
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
          <div class="relative">
            <label class="block w-full cursor-pointer">
              <input ref="slipInput" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" class="hidden" @change="onSlipChange" />
              <img
                v-if="slipPreviewUrl"
                :src="slipPreviewUrl"
                alt="Transfer slip preview"
                class="w-full rounded-xl object-contain border border-border"
              />
              <div v-else class="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-border rounded-xl hover:border-brand hover:bg-surface-subtle transition-colors">
                <svg class="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span class="text-xs text-text-muted">Click to select image (JPEG, PNG, WebP, HEIC)</span>
              </div>
            </label>
            <button
              v-if="slipPreviewUrl"
              @click.prevent="clearSlip"
              type="button"
              class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
              aria-label="Remove slip"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            @click="confirmSubmitSlip = true"
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

      <!-- Owner contact (non-cancelled) -->
      <div v-if="!isCancelled" class="mt-4 bg-surface border border-border rounded-2xl p-6 space-y-3">
        <p class="text-sm font-medium text-text-primary">Space Owner</p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-text-muted">Name</span>
            <span class="text-text-primary">{{ booking.owner_profile_name }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-text-muted">Phone</span>
            <a :href="`tel:${booking.owner_phone}`" class="font-mono text-brand hover:underline">{{ formatPhone(booking.owner_phone) }}</a>
          </div>
          <div v-if="booking.owner_line_id" class="flex justify-between items-center">
            <span class="text-text-muted">Line ID</span>
            <span class="font-mono text-text-primary">{{ booking.owner_line_id }}</span>
          </div>
        </div>
      </div>

      <!-- Next steps (pending only) -->
      <div v-if="isPending" class="mt-4 bg-surface-subtle border border-border rounded-xl p-4 text-sm text-text-secondary space-y-2">
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

      <!-- Cancel booking (cancellable states only) -->
      <div v-if="isCancellable" class="mt-4">
        <button
          @click="confirmCancel = true"
          :disabled="cancelling"
          class="w-full py-3 rounded-xl text-sm font-medium text-red-600 border border-red-200 bg-surface hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {{ cancelling ? 'Cancelling…' : 'Cancel this booking' }}
        </button>
      </div>

    </div>
  </div>

  <ConfirmModal
    :open="confirmSubmitSlip"
    title="Submit payment slip?"
    message="This will submit your transfer slip for admin review. Make sure the slip shows the correct amount and transfer details."
    confirm-label="Yes, submit"
    @confirm="confirmSubmitSlip = false; submitSlip()"
    @cancel="confirmSubmitSlip = false"
  />

  <ConfirmModal
    :open="confirmCancel"
    title="Cancel this booking?"
    :message="(isPaymentReview || isConfirmed)
      ? 'This will cancel your booking. If you have already transferred payment, please contact our admin directly to arrange a refund. This cannot be undone.'
      : 'This will cancel your booking and release the slot. This cannot be undone.'"
    confirm-label="Yes, cancel"
    destructive
    @confirm="confirmCancel = false; cancelBooking()"
    @cancel="confirmCancel = false"
  />
</template>
