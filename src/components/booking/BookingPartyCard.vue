<script setup lang="ts">
import { formatPhone } from '../../utils/format'

defineProps<{
  label: string
  name: string
  phone?: string | null
}>()
</script>

<template>
  <div class="bg-surface border border-border rounded-2xl p-5 mb-4">
    <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">{{ label }}</p>
    <p class="font-semibold text-text-primary">{{ name }}</p>
    <p v-if="phone" class="text-sm text-text-muted mt-0.5 font-mono">{{ formatPhone(phone) }}</p>
  </div>
</template>
