<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import BookingStatusHeader from '../components/booking/BookingStatusHeader.vue'
import BookingTimeline from '../components/booking/BookingTimeline.vue'
import BookingSummaryCard from '../components/booking/BookingSummaryCard.vue'
import PromptPayBlock from '../components/booking/PromptPayBlock.vue'
import PaymentReviewBlock from '../components/booking/PaymentReviewBlock.vue'
import OwnerContactCard from '../components/booking/OwnerContactCard.vue'
import BookingNextSteps from '../components/booking/BookingNextSteps.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { getBooking, updateBookingStatus } from '../api/bookings'
import { getPaymentConfig } from '../api/config'
import type { RenterBookingDetailResponse } from '../api/types'
import type { PaymentConfig } from '../api/config'
import { useBookingStatus, RENTER_STATUS_LABEL } from '../composables/useBookingStatus'

const route = useRoute()
const router = useRouter()
const { token } = useAuth()
const { show } = useToast()

const booking = ref<RenterBookingDetailResponse | null>(null)
const loading = ref(true)
const notFound = ref(false)
const paymentConfig = ref<PaymentConfig>({ promptpay_number: '', promptpay_name: '', promptpay_qr_url: '' })
const submittingSlip = ref(false)
const confirmCancel = ref(false)
const cancelling = ref(false)

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

const bookingStatus    = computed(() => useBookingStatus(booking.value?.status))
const statusLabel      = computed(() => RENTER_STATUS_LABEL[booking.value?.status ?? ''] ?? booking.value?.status ?? '')
const statusClass      = computed(() => bookingStatus.value.badgeClass)
const isPaymentPending = computed(() => bookingStatus.value.isPaymentDue)
const isPaymentReview  = computed(() => bookingStatus.value.isUnderReview)
const isCancelled      = computed(() => bookingStatus.value.isCancelled)
const isPending        = computed(() => bookingStatus.value.isPending)
const isConfirmed      = computed(() => bookingStatus.value.isConfirmed)
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
      <BookingStatusHeader :status="booking.status" :cancelled-message="cancelledMessage" />

      <div v-if="!isCancelled" class="mb-8">
        <BookingTimeline :status="booking.status" />
      </div>

      <BookingSummaryCard :booking="booking" :status-label="statusLabel" :status-class="statusClass" />

      <div v-if="isCancelled" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700 text-center font-medium">
        {{ cancelledMessage }}
      </div>

      <PromptPayBlock
        v-if="isPaymentPending"
        :total-price="booking.total_price"
        :payment-config="paymentConfig"
        :submitting="submittingSlip"
        @submit="submitSlip"
      />

      <PaymentReviewBlock v-if="isPaymentReview" />

      <OwnerContactCard
        v-if="!isCancelled"
        :owner-profile-name="booking.owner_profile_name"
        :owner-phone="booking.owner_phone"
        :owner-line-id="booking.owner_line_id"
      />

      <BookingNextSteps v-if="isPending" />

      <div class="mt-8 flex flex-col sm:flex-row gap-3">
        <RouterLink
          to="/my-bookings"
          class="flex-1 text-center bg-brand text-text-inverse py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors"
        >View my bookings</RouterLink>
        <RouterLink
          to="/"
          class="flex-1 text-center bg-surface border border-border text-text-secondary py-3 rounded-xl font-medium hover:bg-surface-muted transition-colors"
        >Browse more spaces</RouterLink>
      </div>

      <div v-if="isCancellable" class="mt-4">
        <button
          @click="confirmCancel = true"
          :disabled="cancelling"
          class="w-full py-3 rounded-xl text-sm font-medium text-red-600 border border-red-200 bg-surface hover:bg-red-50 transition-colors disabled:opacity-50"
        >{{ cancelling ? 'Cancelling…' : 'Cancel this booking' }}</button>
      </div>
    </div>
  </div>

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
