<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AvailabilitySlot } from '../../api/types'

const props = defineProps<{ availability: AvailabilitySlot[] }>()
const emit = defineEmits<{ 'update:availability': [value: AvailabilitySlot[]] }>()

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS = [1, 2, 3, 4, 5]

type DaySchedule = { enabled: boolean; open_time: string; close_time: string }
const schedule = ref<DaySchedule[]>(
  DAYS.map((_, i) => {
    const slot = props.availability.find((s) => s.day_of_week === i)
    return { enabled: !!slot, open_time: slot?.open_time ?? '09:00', close_time: slot?.close_time ?? '18:00' }
  })
)

watch(
  schedule,
  (val) => {
    emit(
      'update:availability',
      val
        .map((d, i) => ({ day_of_week: i, open_time: d.open_time, close_time: d.close_time }))
        .filter((_, i) => val[i].enabled),
    )
  },
  { deep: true },
)

function selectAllWeekdays() {
  WEEKDAYS.forEach((i) => { schedule.value[i].enabled = true })
}

function clearAll() {
  schedule.value.forEach((d) => { d.enabled = false })
}
</script>

<template>
  <section class="bg-surface border border-border rounded-2xl p-6 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Weekly Schedule</h2>
        <p class="text-xs text-text-muted mt-0.5">Unchecked days are shown as closed.</p>
      </div>
      <div class="flex gap-2">
        <button type="button" @click="selectAllWeekdays" class="text-xs text-brand hover:text-brand-hover font-medium underline underline-offset-2">Weekdays</button>
        <span class="text-text-muted text-xs">·</span>
        <button type="button" @click="clearAll" class="text-xs text-text-muted hover:text-text-primary underline underline-offset-2">Clear all</button>
      </div>
    </div>
    <div class="space-y-3">
      <div v-for="(day, i) in schedule" :key="i" class="flex items-center gap-4 flex-wrap">
        <label class="flex items-center gap-2 w-28 cursor-pointer">
          <input
            type="checkbox"
            v-model="day.enabled"
            class="w-4 h-4 rounded border-border focus:ring-brand/30"
            style="accent-color: var(--color-brand)"
          />
          <span :class="['text-sm text-text-primary', day.enabled ? 'font-medium' : '']">{{ DAYS[i] }}</span>
        </label>
        <div class="flex items-center gap-2" :class="day.enabled ? 'visible' : 'invisible'">
          <input type="time" v-model="day.open_time" class="px-3 py-1.5 text-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition" />
          <span class="text-text-muted text-sm">to</span>
          <input type="time" v-model="day.close_time" class="px-3 py-1.5 text-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition" />
        </div>
      </div>
    </div>
  </section>
</template>
