<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import AppSpinner from '../components/AppSpinner.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import BookingPartyCard from '../components/booking/BookingPartyCard.vue'
import BookingSpacePreview from '../components/booking/BookingSpacePreview.vue'
import BookingDatesGrid from '../components/booking/BookingDatesGrid.vue'
import FeeBreakdownCard from '../components/booking/FeeBreakdownCard.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { ownerGetBookingDetail, updateBookingStatus } from '../api/bookings'
import { minDelay } from '../utils/minDelay'
import type { OwnerBookingDetailResponse } from '../api/types'
import { BOOKING_BADGE_CLASS, OWNER_STATUS_LABEL } from '../composables/useBookingStatus'

const route = useRoute()
const router = useRouter()
const { token } = useAuth()
const { show } = useToast()

const booking = ref<OwnerBookingDetailResponse | null>(null)
const loading = ref(true)
const processing = ref(false)

const confirmAction = ref<{ status: 'awaiting_payment' | 'cancelled'; title: string; message: string } | null>(null)

onMounted(async () => {
  try {
    booking.value = await ownerGetBookingDetail(route.params.id as string, token.value!)
  } catch {
    show('Booking not found', 'error')
    router.replace('/owner/bookings')
  } finally {
    loading.value = false
  }
})

function requestAction(status: 'awaiting_payment' | 'cancelled', title: string, message: string) {
  confirmAction.value = { status, title, message }
}

async function handleConfirmedAction() {
  const item = confirmAction.value
  if (!item || !booking.value) return
  confirmAction.value = null
  processing.value = true
  try {
    await minDelay(updateBookingStatus(booking.value.id, item.status, token.value!), 500)
    show(item.status === 'awaiting_payment' ? 'Booking accepted — renter notified' : 'Booking declined', 'success')
    router.replace('/owner/bookings')
  } catch (e: any) {
    show(e?.message ?? 'Action failed', 'error')
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <div class="max-w-2xl mx-auto px-6 py-10">

      <!-- Back -->
      <button
        @click="router.back()"
        class="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to bookings
      </button>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="bg-surface border border-border rounded-2xl p-5 animate-pulse">
          <div class="h-4 bg-surface-muted rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-surface-muted rounded w-2/3"></div>
        </div>
      </div>

      <template v-else-if="booking">
        <!-- Header -->
        <div class="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 class="text-2xl font-bold text-text-primary">Booking Request</h1>
            <p class="text-text-muted text-sm mt-1">Ref <span class="font-mono font-medium text-text-secondary">{{ booking.ref_code }}</span></p>
          </div>
          <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', BOOKING_BADGE_CLASS[booking.status]]">
            {{ OWNER_STATUS_LABEL[booking.status] }}
          </span>
        </div>

        <!-- Renter info -->
        <BookingPartyCard label="Renter" :name="booking.renter_profile_name" :phone="booking.renter_phone" />

        <!-- Space + dates -->
        <div class="bg-surface border border-border rounded-2xl overflow-hidden mb-4">
          <div class="p-5">
            <BookingSpacePreview
              :space-name="booking.space_name"
              :space-location="booking.space_location"
              :space-images="booking.space_images"
            />
          </div>
          <div class="border-t border-border p-5">
            <BookingDatesGrid :start-time="booking.start_time" :end-time="booking.end_time" show-duration />
          </div>
        </div>

        <!-- Fee breakdown -->
        <div class="bg-surface border border-border rounded-2xl p-5 mb-6">
          <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Fee breakdown</p>
          <FeeBreakdownCard :total-price="booking.total_price" :platform-fee="booking.platform_fee" />
        </div>

        <!-- Actions: pending request -->
        <div v-if="booking.status === 'pending'" class="bg-surface border border-border rounded-2xl p-5 flex gap-3">
          <button
            @click="requestAction('awaiting_payment', 'Accept this booking?', 'The renter will be notified and asked to complete payment via PromptPay.')"
            :disabled="processing"
            class="flex-1 border border-emerald-500 text-emerald-700 py-3 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <AppSpinner v-if="processing" />
            {{ processing ? 'Processing…' : 'Accept' }}
          </button>
          <button
            @click="requestAction('cancelled', 'Decline this booking?', 'This will decline the booking request. The renter will be notified.')"
            :disabled="processing"
            class="flex-1 border border-red-300 text-red-600 py-3 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Decline
          </button>
        </div>

        <!-- Actions: active booking (cancel) -->
        <div v-else-if="['awaiting_payment', 'payment_pending', 'payment_review', 'confirmed'].includes(booking.status)"
          class="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between gap-4"
        >
          <p class="text-sm text-text-muted">
            <template v-if="['awaiting_payment', 'payment_pending'].includes(booking.status)">Awaiting renter payment slip.</template>
            <template v-else-if="booking.status === 'payment_review'">Payment slip under admin review.</template>
            <template v-else-if="booking.status === 'confirmed'">Booking confirmed.</template>
          </p>
          <button
            @click="requestAction('cancelled', 'Cancel this booking?', 'This will cancel the booking. This action cannot be undone.')"
            :disabled="processing"
            class="shrink-0 px-4 py-2 border border-border text-error rounded-xl text-sm font-medium bg-surface hover:bg-red-50 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            <AppSpinner v-if="processing" />
            {{ processing ? 'Processing…' : 'Cancel booking' }}
          </button>
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
