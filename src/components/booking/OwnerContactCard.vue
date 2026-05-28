<script setup lang="ts">
import { formatPhone } from '../../utils/format'

defineProps<{
  ownerProfileName: string
  ownerPhone: string
  ownerLineId?: string | null
}>()
</script>

<template>
  <div class="mt-4 bg-surface border border-border rounded-2xl p-6 space-y-3">
    <p class="text-sm font-medium text-text-primary">Space Owner</p>
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-text-muted">Name</span>
        <span class="text-text-primary">{{ ownerProfileName }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-text-muted">Phone</span>
        <a :href="`tel:${ownerPhone}`" class="font-mono text-brand hover:underline">{{ formatPhone(ownerPhone) }}</a>
      </div>
      <div v-if="ownerLineId" class="flex justify-between items-center">
        <span class="text-text-muted">Line ID</span>
        <span class="font-mono text-text-primary">{{ ownerLineId }}</span>
      </div>
    </div>
  </div>
</template>
