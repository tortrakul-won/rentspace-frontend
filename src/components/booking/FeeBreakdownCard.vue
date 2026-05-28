<script setup lang="ts">
import { computed } from 'vue'
import { formatPrice } from '../../utils/format'

const props = defineProps<{
  totalPrice: number
  platformFee: number
  totalLabel?: string
  netLabel?: string
  netClass?: string
}>()

const net = computed(() => props.totalPrice - props.platformFee)
</script>

<template>
  <div class="space-y-2 text-sm">
    <div class="flex justify-between">
      <span class="text-text-muted">{{ totalLabel ?? 'Total charged to renter' }}</span>
      <span class="font-semibold text-text-primary">{{ formatPrice(totalPrice) }}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-text-muted">Platform fee</span>
      <span class="text-text-secondary">{{ formatPrice(platformFee) }}</span>
    </div>
    <div class="flex justify-between border-t border-border pt-2 mt-2">
      <span class="text-text-muted font-medium">{{ netLabel ?? 'You receive' }}</span>
      <span class="font-semibold" :class="netClass ?? 'text-brand'">{{ formatPrice(net) }}</span>
    </div>
  </div>
</template>
