<script setup lang="ts">
defineProps<{
  status: string
  cancelledMessage: string
}>()
</script>

<template>
  <!-- Icon circle -->
  <div
    class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
    :class="{
      'bg-blue-100':      status === 'awaiting_payment' || status === 'payment_pending',
      'bg-purple-100':    status === 'payment_review',
      'bg-red-100':       status === 'cancelled',
      'bg-surface-muted': status === 'completed',
      'bg-success-light': status !== 'awaiting_payment' && status !== 'payment_pending' && status !== 'payment_review' && status !== 'cancelled' && status !== 'completed',
    }"
  >
    <svg v-if="status === 'awaiting_payment' || status === 'payment_pending'" class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
    <svg v-else-if="status === 'payment_review'" class="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <svg v-else-if="status === 'cancelled'" class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <svg v-else-if="status === 'completed'" class="w-7 h-7 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <svg v-else class="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>

  <!-- Heading + subtitle -->
  <div class="text-center mb-6">
    <h1 class="text-2xl font-bold mb-2" :class="status === 'cancelled' ? 'text-red-600' : 'text-text-primary'">
      <template v-if="status === 'awaiting_payment' || status === 'payment_pending'">Complete Your Payment</template>
      <template v-else-if="status === 'payment_review'">Payment Under Review</template>
      <template v-else-if="status === 'cancelled'">Booking Cancelled</template>
      <template v-else-if="status === 'confirmed'">Booking Confirmed</template>
      <template v-else-if="status === 'completed'">Booking Completed</template>
      <template v-else>Booking Requested</template>
    </h1>
    <p class="text-text-secondary text-sm">
      <template v-if="status === 'awaiting_payment' || status === 'payment_pending'">The owner has accepted your booking. Please transfer the amount below to confirm your slot.</template>
      <template v-else-if="status === 'payment_review'">Your payment slip has been submitted. Our team will verify and confirm within 24 hours.</template>
      <template v-else-if="status === 'cancelled'">{{ cancelledMessage }}</template>
      <template v-else-if="status === 'confirmed'">Your booking is confirmed. See below for check-in details and owner contact.</template>
      <template v-else-if="status === 'completed'">This booking has been completed. Thanks for using RentSpace.</template>
      <template v-else>Your request has been sent. The owner will confirm or decline shortly.</template>
    </p>
  </div>
</template>
