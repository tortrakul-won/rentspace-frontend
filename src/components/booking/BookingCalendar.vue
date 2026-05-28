<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AvailabilitySlot, MergedAvailability } from '../../api/types'
import { getMergedAvailability } from '../../api/spaces'

const props = defineProps<{
  spaceId: string
  availability: AvailabilitySlot[]
  token?: string | null
  selectedDate: Date | null
}>()

const emit = defineEmits<{
  'day-select': [{ date: Date; openSlot: AvailabilitySlot | null }]
}>()

const today = new Date()
today.setHours(0, 0, 0, 0)

const calendarDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const mergedAvail = ref<MergedAvailability>({})

const calendarYear = computed(() => calendarDate.value.getFullYear())
const calendarMonth = computed(() => calendarDate.value.getMonth())
const monthLabel = computed(() =>
  calendarDate.value.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
)

function pad(n: number) { return String(n).padStart(2, '0') }

function fetchMergedAvail() {
  const y = calendarYear.value
  const m = calendarMonth.value
  const from = `${y}-${pad(m + 1)}-01`
  const lastDay = new Date(y, m + 1, 0).getDate()
  const to = `${y}-${pad(m + 1)}-${pad(lastDay)}`
  getMergedAvailability(props.spaceId, from, to, props.token)
    .then(data => { mergedAvail.value = data })
    .catch(() => { /* silent — fall back to weekly schedule */ })
}

watch(calendarDate, fetchMergedAvail, { immediate: true })

function prevMonth() {
  calendarDate.value = new Date(calendarYear.value, calendarMonth.value - 1, 1)
}
function nextMonth() {
  calendarDate.value = new Date(calendarYear.value, calendarMonth.value + 1, 1)
}

const calendarDays = computed(() => {
  const first = new Date(calendarYear.value, calendarMonth.value, 1).getDay()
  const daysInMonth = new Date(calendarYear.value, calendarMonth.value + 1, 0).getDate()
  const days: Array<{ date: Date | null; open: boolean; past: boolean; hasBlocks: boolean }> = []
  for (let i = 0; i < first; i++) days.push({ date: null, open: false, past: false, hasBlocks: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calendarYear.value, calendarMonth.value, d)
    const dateKey = `${calendarYear.value}-${pad(calendarMonth.value + 1)}-${pad(d)}`
    const dow = date.getDay()
    const past = date < today
    const merged = mergedAvail.value[dateKey]
    const open = merged ? merged.open : props.availability.some((s) => s.day_of_week === dow)
    const hasBlocks = merged ? merged.blocked_ranges.length > 0 : false
    days.push({ date, open, past, hasBlocks })
  }
  return days
})

function getOpenSlot(date: Date): AvailabilitySlot | null {
  const dateKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const merged = mergedAvail.value[dateKey]
  if (merged?.open_time && merged?.close_time) {
    return { day_of_week: date.getDay(), open_time: merged.open_time, close_time: merged.close_time }
  }
  return props.availability.find((s) => s.day_of_week === date.getDay()) ?? null
}

function selectDay(date: Date | null, open: boolean, past: boolean) {
  if (!date || !open || past) return
  emit('day-select', { date, openSlot: getOpenSlot(date) })
}

function isSelected(date: Date | null) {
  return date && props.selectedDate &&
    date.toDateString() === props.selectedDate.toDateString()
}

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
</script>

<template>
  <div>
    <!-- Month nav -->
    <div class="flex items-center justify-between mb-3">
      <button @click="prevMonth" class="p-1 rounded hover:bg-surface-muted transition-colors">
        <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-sm font-medium text-text-primary">{{ monthLabel }}</span>
      <button @click="nextMonth" class="p-1 rounded hover:bg-surface-muted transition-colors">
        <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Day headers -->
    <div class="grid grid-cols-7 mb-1">
      <span v-for="d in DAYS_SHORT" :key="d" class="text-center text-xs text-text-muted font-medium py-1">{{ d }}</span>
    </div>

    <!-- Day grid -->
    <div class="grid grid-cols-7 gap-y-0.5">
      <button
        v-for="(cell, i) in calendarDays"
        :key="i"
        :disabled="!cell.date || !cell.open || cell.past"
        @click="selectDay(cell.date, cell.open, cell.past)"
        :class="[
          'h-8 w-full text-xs rounded-lg transition-colors relative',
          !cell.date ? 'invisible' : '',
          cell.date && isSelected(cell.date)
            ? 'bg-brand text-text-inverse font-semibold'
            : cell.date && cell.open && !cell.past
              ? 'hover:bg-surface-muted text-text-primary'
              : 'text-text-muted opacity-40 cursor-not-allowed',
        ]"
      >
        {{ cell.date?.getDate() }}
        <span
          v-if="cell.date && cell.open && !cell.past && cell.hasBlocks && !isSelected(cell.date)"
          class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
        />
      </button>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-3 mt-2 text-xs text-text-muted">
      <span>Greyed = closed or past</span>
      <span class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
        partially booked
      </span>
    </div>
  </div>
</template>
