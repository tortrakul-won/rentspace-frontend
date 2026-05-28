<script setup lang="ts">
const props = defineProps<{
  startTime: string
  endTime: string
  showDuration?: boolean
}>()

function formatDT(iso: string) {
  return new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

function duration() {
  const diff = (new Date(props.endTime).getTime() - new Date(props.startTime).getTime()) / 60000
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}
</script>

<template>
  <div>
    <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Dates</p>
    <div class="grid grid-cols-2 gap-4 text-sm mb-3">
      <div>
        <p class="text-xs text-text-muted mb-0.5">Check-in</p>
        <p class="text-text-primary font-medium">{{ formatDT(startTime) }}</p>
      </div>
      <div>
        <p class="text-xs text-text-muted mb-0.5">Check-out</p>
        <p class="text-text-primary font-medium">{{ formatDT(endTime) }}</p>
      </div>
    </div>
    <p v-if="showDuration" class="text-xs text-text-muted">
      Duration: <span class="font-medium text-text-secondary">{{ duration() }}</span>
    </p>
  </div>
</template>
