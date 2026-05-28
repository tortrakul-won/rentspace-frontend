<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppSpinner from '../AppSpinner.vue'
import { formatDateTimeShort, formatPrice } from '../../utils/format'
import { BOOKING_BADGE_CLASS, OWNER_STATUS_LABEL } from '../../composables/useBookingStatus'
import type { BookingResponse, BookingStatus } from '../../api/types'

defineProps<{
  booking: BookingResponse
  tab: 'requests' | 'active' | 'completed' | 'cancelled'
  actionId: string | null
}>()

const emit = defineEmits<{
  action: [id: string, status: BookingStatus, title: string, message: string]
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
            <p v-if="booking.renter_name" class="text-xs text-text-muted">by {{ booking.renter_name }}</p>
            <p class="text-sm text-text-muted">{{ formatDateTimeShort(booking.start_time) }} → {{ formatDateTimeShort(booking.end_time) }}</p>
            <p class="font-mono font-semibold text-text-primary">{{ formatPrice(booking.total_price) }}</p>
          </div>
          <span :class="['text-xs font-medium px-2.5 py-1 rounded-full shrink-0', BOOKING_BADGE_CLASS[booking.status]]">
            {{ OWNER_STATUS_LABEL[booking.status] }}
          </span>
        </div>

        <!-- Requests tab: Review link -->
        <div v-if="tab === 'requests'" class="mt-3">
          <RouterLink
            :to="`/owner/bookings/${booking.id}`"
            class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand border border-brand/30 rounded-lg hover:bg-brand/5 transition-colors"
          >
            Review →
          </RouterLink>
        </div>

        <!-- Active tab: details + cancel -->
        <div v-if="tab === 'active'" class="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <RouterLink
            :to="`/owner/bookings/${booking.id}`"
            class="text-xs text-brand hover:underline"
          >View details</RouterLink>
          <button
            @click="emit('action', booking.id, 'cancelled', 'Cancel this booking?', 'This will cancel the booking. This action cannot be undone.')"
            :disabled="actionId === booking.id"
            class="shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
          >
            <AppSpinner v-if="actionId === booking.id" />
            <span>{{ actionId === booking.id ? 'Processing…' : 'Cancel' }}</span>
          </button>
        </div>

        <!-- Completed/Cancelled tabs: view details -->
        <div v-if="tab === 'completed' || tab === 'cancelled'" class="mt-3">
          <RouterLink
            :to="`/owner/bookings/${booking.id}`"
            class="text-xs text-text-muted hover:text-brand transition-colors"
          >View details →</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
