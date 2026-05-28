<script setup lang="ts">
import { formatPrice } from '../../utils/format'

const props = defineProps<{
  hours: number
  price: number
}>()

function formatHours(h: number) {
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  if (hrs === 0) return `${mins} min`
  if (mins === 0) return `${hrs} hr`
  return `${hrs} hr ${mins} min`
}
</script>

<template>
  <div class="bg-surface-subtle rounded-xl p-3 space-y-1">
    <div class="flex justify-between text-sm">
      <span class="text-text-secondary">Duration</span>
      <span class="text-text-primary font-medium">{{ formatHours(hours) }}</span>
    </div>
    <div class="flex justify-between text-sm font-semibold">
      <span class="text-text-primary">Total</span>
      <span class="font-mono text-text-primary">{{ formatPrice(price) }}</span>
    </div>
  </div>
</template>
