<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppSpinner from '../AppSpinner.vue'
import { formatDateTimeShort, formatPrice } from '../../utils/format'
import { BOOKING_BADGE_CLASS, RENTER_STATUS_LABEL } from '../../composables/useBookingStatus'
import type { BookingResponse } from '../../api/types'

defineProps<{
  booking: BookingResponse
  cancellingId: string | null
}>()

const emit = defineEmits<{
  cancel: [id: string, status: string]
}>()
</script>

<template>
  <div class="bg-surface border border-border rounded-2xl overflow-hidden">
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
            <p class="text-sm text-text-muted">{{ formatDateTimeShort(booking.start_time) }} → {{ formatDateTimeShort(booking.end_time) }}</p>
            <p class="font-mono font-semibold text-text-primary">{{ formatPrice(booking.total_price) }}</p>
            <p v-if="booking.ref_code" class="text-xs text-text-muted font-mono">Ref: {{ booking.ref_code }}</p>
          </div>
          <span :class="['text-xs font-medium px-2.5 py-1 rounded-full shrink-0', BOOKING_BADGE_CLASS[booking.status]]">
            {{ RENTER_STATUS_LABEL[booking.status] }}
          </span>
        </div>

        <!-- Actions -->
        <div class="mt-3 flex gap-2 flex-wrap items-center">
          <RouterLink
            v-if="booking.status === 'pending' || booking.status === 'confirmed'"
            :to="`/bookings/${booking.id}/confirm`"
            class="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-muted transition-colors"
          >View Details</RouterLink>
          <RouterLink
            v-if="booking.status === 'awaiting_payment' || booking.status === 'payment_pending'"
            :to="`/bookings/${booking.id}/payment`"
            class="px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >View Payment Details</RouterLink>
          <RouterLink
            v-if="booking.status === 'payment_review'"
            :to="`/bookings/${booking.id}/review`"
            class="px-3 py-1.5 text-xs font-medium text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >View Review Status</RouterLink>
          <RouterLink
            v-if="booking.status === 'completed'"
            :to="`/bookings/${booking.id}/confirm`"
            class="px-3 py-1.5 text-xs font-medium text-text-muted border border-border rounded-lg hover:bg-surface-muted transition-colors"
          >View Details</RouterLink>
          <RouterLink
            v-if="booking.status === 'cancelled'"
            :to="`/bookings/${booking.id}/cancelled`"
            class="px-3 py-1.5 text-xs font-medium text-text-muted border border-border rounded-lg hover:bg-surface-muted transition-colors"
          >View Details</RouterLink>
          <button
            v-if="['pending', 'payment_pending', 'awaiting_payment', 'payment_review', 'confirmed'].includes(booking.status)"
            @click="emit('cancel', booking.id, booking.status)"
            :disabled="cancellingId === booking.id"
            class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 bg-surface rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
          >
            <AppSpinner v-if="cancellingId === booking.id" />
            <span>{{ cancellingId === booking.id ? 'Cancelling…' : 'Cancel booking' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
