<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import {
  adminGetBookingDetail,
  adminApproveBooking,
  adminRejectRetryBooking,
  adminRejectPermanentBooking,
} from '../api/bookings'
import type { AdminBookingDetailResponse } from '../api/types'

const route = useRoute()
const router = useRouter()
const { token, isAdmin } = useAuth()
const { show } = useToast()

const booking = ref<AdminBookingDetailResponse | null>(null)
const loading = ref(true)
const processing = ref(false)
const confirmApprove = ref(false)
const confirmRejectRetry = ref(false)
const confirmRejectPermanent = ref(false)

onMounted(async () => {
  if (!isAdmin.value) {
    router.replace('/')
    return
  }
  try {
    booking.value = await adminGetBookingDetail(route.params.id as string, token.value!)
  } catch {
    show('Failed to load booking', 'error')
    router.replace('/admin')
  } finally {
    loading.value = false
  }
})

async function approve() {
  if (!booking.value) return
  processing.value = true
  try {
    await adminApproveBooking(booking.value.id, token.value!)
    show('Booking confirmed', 'success')
    router.replace('/admin')
  } catch (e: any) {
    show(e?.message ?? 'Failed to approve', 'error')
  } finally {
    processing.value = false
  }
}

async function rejectRetry() {
  if (!booking.value) return
  processing.value = true
  try {
    await adminRejectRetryBooking(booking.value.id, token.value!)
    show('Slip rejected — renter can retry', 'success')
    router.replace('/admin')
  } catch (e: any) {
    show(e?.message ?? 'Failed to reject', 'error')
  } finally {
    processing.value = false
  }
}

async function rejectPermanent() {
  if (!booking.value) return
  processing.value = true
  try {
    await adminRejectPermanentBooking(booking.value.id, token.value!)
    show('Booking rejected permanently', 'success')
    router.replace('/admin')
  } catch (e: any) {
    show(e?.message ?? 'Failed to reject', 'error')
  } finally {
    processing.value = false
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatPrice(n: number) {
  return '฿' + n.toLocaleString('th-TH')
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
        Back to dashboard
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
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-text-primary">Payment Review</h1>
          <p class="text-text-muted text-sm mt-1">Ref <span class="font-mono font-medium text-text-secondary">{{ booking.ref_code }}</span> · Submitted {{ formatDateTime(booking.created_at) }}</p>
        </div>

        <!-- Renter info -->
        <div class="bg-surface border border-border rounded-2xl p-5 mb-4">
          <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Renter</p>
          <p class="font-semibold text-text-primary">{{ booking.renter_profile_name }}</p>
          <p v-if="booking.renter_phone" class="text-sm text-text-muted mt-0.5">{{ booking.renter_phone }}</p>
        </div>

        <!-- Property + Owner info -->
        <div class="bg-surface border border-border rounded-2xl overflow-hidden mb-4">
          <div class="p-5">
            <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Property</p>
            <div class="flex items-start gap-3">
              <div class="w-14 h-14 rounded-xl overflow-hidden bg-surface-muted flex-shrink-0">
                <img
                  v-if="booking.space_images?.[0]"
                  :src="booking.space_images[0]"
                  class="w-full h-full object-cover"
                  :alt="booking.space_name"
                />
              </div>
              <div>
                <p class="font-semibold text-text-primary">{{ booking.space_name }}</p>
                <p class="text-sm text-text-muted mt-0.5">📍 {{ booking.space_location }}</p>
              </div>
            </div>
          </div>
          <div class="border-t border-border px-5 py-4">
            <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Owner</p>
            <p class="font-medium text-text-primary">{{ booking.owner_profile_name }}</p>
          </div>
        </div>

        <!-- Booking dates -->
        <div class="bg-surface border border-border rounded-2xl p-5 mb-4">
          <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Booking dates</p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-xs text-text-muted mb-0.5">Check-in</p>
              <p class="text-text-primary font-medium">{{ formatDateTime(booking.start_time) }}</p>
            </div>
            <div>
              <p class="text-xs text-text-muted mb-0.5">Check-out</p>
              <p class="text-text-primary font-medium">{{ formatDateTime(booking.end_time) }}</p>
            </div>
          </div>
        </div>

        <!-- Fee breakdown -->
        <div class="bg-surface border border-border rounded-2xl p-5 mb-4">
          <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Fee breakdown</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-text-muted">Total charged</span>
              <span class="font-semibold text-text-primary">{{ formatPrice(booking.total_price) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-muted">Platform fee</span>
              <span class="text-text-secondary">{{ formatPrice(booking.platform_fee) }}</span>
            </div>
            <div class="flex justify-between border-t border-border pt-2 mt-2">
              <span class="text-text-muted">Net to owner</span>
              <span class="font-semibold text-text-primary">{{ formatPrice(booking.total_price - booking.platform_fee) }}</span>
            </div>
          </div>
        </div>

        <!-- Transfer slip -->
        <div class="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          <p class="px-5 pt-5 pb-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Transfer slip</p>
          <div class="px-5 pb-5">
            <div v-if="booking.slip_url" class="rounded-xl overflow-hidden border border-border">
              <img :src="booking.slip_url" alt="Transfer slip" class="w-full object-contain max-h-[480px]" />
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center gap-2 h-40 rounded-xl border-2 border-dashed border-border bg-surface-subtle"
            >
              <svg class="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 9.75h.008v.008H3V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p class="text-sm text-text-muted">No slip uploaded yet</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-surface border border-border rounded-2xl p-5 flex gap-3">
          <button
            @click="confirmApprove = true"
            :disabled="processing"
            class="flex-1 bg-brand text-text-inverse py-3 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {{ processing ? 'Processing…' : 'Confirm Payment' }}
          </button>
          <button
            @click="confirmRejectRetry = true"
            :disabled="processing"
            class="flex-1 border border-amber-300 text-amber-700 py-3 rounded-xl text-sm font-medium hover:bg-amber-50 transition-colors disabled:opacity-50"
          >
            Reject — retry
          </button>
          <button
            @click="confirmRejectPermanent = true"
            :disabled="processing"
            class="flex-1 border border-border text-error py-3 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Reject permanently
          </button>
        </div>

      </template>
    </div>
  </div>

  <ConfirmModal
    :open="confirmApprove"
    title="Confirm this payment?"
    message="This will confirm the booking. The renter and owner will be notified."
    confirm-label="Yes, confirm"
    @confirm="confirmApprove = false; approve()"
    @cancel="confirmApprove = false"
  />
  <ConfirmModal
    :open="confirmRejectRetry"
    title="Reject slip and allow retry?"
    message="The renter will be notified and can resubmit their payment slip."
    confirm-label="Yes, reject"
    @confirm="confirmRejectRetry = false; rejectRetry()"
    @cancel="confirmRejectRetry = false"
  />
  <ConfirmModal
    :open="confirmRejectPermanent"
    title="Reject permanently?"
    message="This will cancel the booking. The renter will be notified. This action cannot be undone."
    confirm-label="Yes, reject"
    destructive
    @confirm="confirmRejectPermanent = false; rejectPermanent()"
    @cancel="confirmRejectPermanent = false"
  />
</template>
