<script setup lang="ts">
import { computed, watch } from 'vue'
import type { AvailabilitySlot } from '../../api/types'

const props = defineProps<{
  selectedDate: Date
  openSlot: AvailabilitySlot | null
  startTime: string
  endTime: string
}>()

const emit = defineEmits<{
  'update:startTime': [string]
  'update:endTime': [string]
}>()

function pad(n: number) { return String(n).padStart(2, '0') }

const timeSlots = computed(() => {
  if (!props.openSlot) return []
  const [oh, om] = (props.openSlot.open_time ?? '00:00').split(':').map(Number)
  const [ch, cm] = (props.openSlot.close_time ?? '23:30').split(':').map(Number)
  const slots: string[] = []
  let mins = oh * 60 + om
  const endMins = ch * 60 + cm
  while (mins <= endMins) {
    slots.push(`${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`)
    mins += 30
  }
  return slots
})

const endTimeSlots = computed(() =>
  timeSlots.value.filter(t => {
    if (!props.startTime) return true
    const [sh, sm] = props.startTime.split(':').map(Number)
    const [th, tm] = t.split(':').map(Number)
    return th * 60 + tm > sh * 60 + sm
  })
)

watch(() => props.startTime, () => {
  if (props.endTime) {
    const [sh, sm] = props.startTime.split(':').map(Number)
    const [eh, em] = props.endTime.split(':').map(Number)
    if (eh * 60 + em <= sh * 60 + sm) emit('update:endTime', '')
  }
})
</script>

<template>
  <div class="space-y-3">
    <p class="text-xs font-medium text-text-primary">
      {{ selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) }}
      <span v-if="openSlot" class="text-text-muted font-normal ml-1">
        · open {{ openSlot.open_time }}–{{ openSlot.close_time }}
      </span>
    </p>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs text-text-muted mb-1">Start</label>
        <select
          :value="startTime"
          @change="emit('update:startTime', ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
        >
          <option value="" disabled>Select time</option>
          <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-text-muted mb-1">End</label>
        <select
          :value="endTime"
          @change="emit('update:endTime', ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
        >
          <option value="" disabled>Select time</option>
          <option v-for="t in endTimeSlots" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
    </div>
  </div>
</template>
