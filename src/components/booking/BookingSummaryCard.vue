<script setup lang="ts">
import { formatDateTime, formatPrice } from '../../utils/format'
import type { RenterBookingDetailResponse } from '../../api/types'

defineProps<{
  booking: RenterBookingDetailResponse
  statusLabel: string
  statusClass: string
}>()
</script>

<template>
  <div class="bg-surface border border-border rounded-2xl p-6 space-y-3 mb-4">
    <!-- Space identity -->
    <div class="flex items-center gap-3 pb-3 border-b border-border">
      <img
        v-if="booking.space_images?.[0]"
        :src="booking.space_images[0]"
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
</template>
