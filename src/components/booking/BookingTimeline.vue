<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()

const STEPS = [
  { key: 'pending',          label: 'Requested' },
  { key: 'awaiting_payment', label: 'Pay' },
  { key: 'payment_review',   label: 'Review' },
  { key: 'confirmed',        label: 'Confirmed' },
  { key: 'completed',        label: 'Completed' },
]

const currentStepIndex = computed(() => {
  const s = props.status
  if (s === 'pending')          return 0
  if (s === 'awaiting_payment' || s === 'payment_pending') return 1
  if (s === 'payment_review')   return 2
  if (s === 'confirmed')        return 3
  if (s === 'completed')        return 4
  return -1
})

function stepState(idx: number): 'done' | 'current' | 'upcoming' {
  const cur = currentStepIndex.value
  if (idx < cur)   return 'done'
  if (idx === cur) return 'current'
  return 'upcoming'
}
</script>

<template>
  <div class="flex items-center">
    <template v-for="(step, idx) in STEPS" :key="step.key">
      <div class="flex flex-col items-center shrink-0">
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
          :class="{
            'bg-success text-white':           stepState(idx) === 'done',
            'bg-brand text-white':             stepState(idx) === 'current',
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
            'text-success':           stepState(idx) === 'done',
            'text-brand font-medium': stepState(idx) === 'current',
            'text-text-muted':        stepState(idx) === 'upcoming',
          }"
        >{{ step.label }}</span>
      </div>
      <div
        v-if="idx < STEPS.length - 1"
        class="flex-1 h-px mx-1 mb-4 transition-colors"
        :class="stepState(idx) === 'done' ? 'bg-success' : 'bg-border'"
      ></div>
    </template>
  </div>
</template>
