<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SpaceResponse, AvailabilitySlot, MergedAvailability } from '../api/types'
import { getMergedAvailability } from '../api/spaces'

const props = defineProps<{
  space: SpaceResponse
  availability: AvailabilitySlot[]
  submitting: boolean
  token?: string | null
}>()

const emit = defineEmits<{
  book: [startTime: string, endTime: string]
}>()

// ── Calendar ────────────────────────────────────────────────────────────────

const today = new Date()
today.setHours(0, 0, 0, 0)

const calendarDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDate = ref<Date | null>(null)
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
  getMergedAvailability(props.space.id, from, to, props.token)
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

// Days in the grid (padded to start on Sunday)
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
    // Use merged availability if available, else fall back to weekly schedule
    const merged = mergedAvail.value[dateKey]
    const open = merged ? merged.open : props.availability.some((s) => s.day_of_week === dow)
    const hasBlocks = merged ? merged.blocked_ranges.length > 0 : false
    days.push({ date, open, past, hasBlocks })
  }
  return days
})

const openSlot = computed(() => {
  if (!selectedDate.value) return null
  const dateKey = selectedDate.value.toISOString().slice(0, 10)
  const merged = mergedAvail.value[dateKey]
  if (merged?.open_time && merged?.close_time) {
    return { open_time: merged.open_time, close_time: merged.close_time }
  }
  return props.availability.find((s) => s.day_of_week === selectedDate.value!.getDay()) ?? null
})

function selectDay(date: Date | null, open: boolean, past: boolean) {
  if (!date || !open || past) return
  selectedDate.value = date
  startTime.value = openSlot.value?.open_time ?? '09:00'
  endTime.value = ''
}

function isSelected(date: Date | null) {
  return date && selectedDate.value &&
    date.toDateString() === selectedDate.value.toDateString()
}

// ── Time inputs ──────────────────────────────────────────────────────────────

const startTime = ref('')
const endTime = ref('')

const timeSlots = computed(() => {
  if (!openSlot.value) return []
  const [oh, om] = (openSlot.value.open_time ?? '00:00').split(':').map(Number)
  const [ch, cm] = (openSlot.value.close_time ?? '23:30').split(':').map(Number)
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
    if (!startTime.value) return true
    const [sh, sm] = startTime.value.split(':').map(Number)
    const [th, tm] = t.split(':').map(Number)
    return th * 60 + tm > sh * 60 + sm
  })
)

watch(startTime, () => {
  if (endTime.value) {
    const [sh, sm] = startTime.value.split(':').map(Number)
    const [eh, em] = endTime.value.split(':').map(Number)
    if (eh * 60 + em <= sh * 60 + sm) endTime.value = ''
  }
})

// ── Price preview ────────────────────────────────────────────────────────────

const previewHours = computed(() => {
  if (!startTime.value || !endTime.value) return null
  const [sh, sm] = startTime.value.split(':').map(Number)
  const [eh, em] = endTime.value.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return null
  return mins / 60
})

const previewPrice = computed(() => {
  const h = previewHours.value
  if (h === null) return null
  const { hourly_rate, daily_rate, min_minutes } = props.space
  if (h >= 24) return Math.ceil(h / 24) * daily_rate
  const billable = Math.max(Math.ceil(h), Math.ceil(min_minutes / 60))
  return billable * hourly_rate
})

function formatPrice(n: number) {
  return '฿' + n.toLocaleString('th-TH')
}

function formatHours(h: number) {
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  if (hrs === 0) return `${mins} min`
  if (mins === 0) return `${hrs} hr`
  return `${hrs} hr ${mins} min`
}

// ── Validation & submit ──────────────────────────────────────────────────────

const validationError = computed(() => {
  if (!selectedDate.value) return null
  if (!startTime.value || !endTime.value) return null
  const h = previewHours.value
  if (h === null || h <= 0) return 'End time must be after start time'
  if (h * 60 < props.space.min_minutes) {
    const minLabel = props.space.min_minutes >= 60
      ? `${props.space.min_minutes / 60} hr`
      : `${props.space.min_minutes} min`
    return `Minimum booking is ${minLabel}`
  }
  if (openSlot.value) {
    const [oh, om] = openSlot.value.open_time.split(':').map(Number)
    const [ch, cm] = openSlot.value.close_time.split(':').map(Number)
    const [sh, sm] = startTime.value.split(':').map(Number)
    const [eh, em] = endTime.value.split(':').map(Number)
    if (sh * 60 + sm < oh * 60 + om) return `Space opens at ${openSlot.value.open_time}`
    if (eh * 60 + em > ch * 60 + cm) return `Space closes at ${openSlot.value.close_time}`
  }
  return null
})

const canSubmit = computed(() =>
  selectedDate.value && startTime.value && endTime.value &&
  previewHours.value !== null && previewHours.value > 0 &&
  validationError.value === null,
)

function handleSubmit() {
  if (!canSubmit.value || !selectedDate.value) return
  const d = selectedDate.value
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  emit('book', `${dateStr}T${startTime.value}:00Z`, `${dateStr}T${endTime.value}:00Z`)
}

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
</script>

<template>
  <div class="border border-border rounded-2xl p-6 sticky top-24 space-y-5">

    <!-- Pricing header -->
    <div>
      <p class="text-2xl font-bold font-mono text-text-primary">
        {{ formatPrice(space.hourly_rate) }}<span class="text-base font-normal text-text-muted font-sans"> / hr</span>
      </p>
      <p class="text-text-muted text-sm mt-0.5">
        {{ formatPrice(space.daily_rate) }} / day
        <template v-if="space.weekend_surcharge_pct > 0">
          · +{{ space.weekend_surcharge_pct }}% weekends
        </template>
      </p>
    </div>

    <!-- Calendar -->
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
          <!-- Dot indicates partial bookings on that day -->
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

    <!-- Time inputs -->
    <div v-if="selectedDate" class="space-y-3">
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
            v-model="startTime"
            class="w-full px-3 py-2 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          >
            <option value="" disabled>Select time</option>
            <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">End</label>
          <select
            v-model="endTime"
            class="w-full px-3 py-2 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          >
            <option value="" disabled>Select time</option>
            <option v-for="t in endTimeSlots" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Price preview -->
    <div v-if="previewPrice !== null" class="bg-surface-subtle rounded-xl p-3 space-y-1">
      <div class="flex justify-between text-sm">
        <span class="text-text-secondary">Duration</span>
        <span class="text-text-primary font-medium">{{ formatHours(previewHours!) }}</span>
      </div>
      <div class="flex justify-between text-sm font-semibold">
        <span class="text-text-primary">Total</span>
        <span class="font-mono text-text-primary">{{ formatPrice(previewPrice) }}</span>
      </div>
    </div>

    <!-- Validation error -->
    <p v-if="validationError" class="text-xs text-red-500">{{ validationError }}</p>

    <!-- Submit -->
    <button
      @click="handleSubmit"
      :disabled="!canSubmit || submitting"
      class="w-full bg-brand text-text-inverse py-3 rounded-xl font-medium hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {{ submitting ? 'Requesting…' : 'Request to book' }}
    </button>
    <p class="text-xs text-text-muted text-center">You won't be charged yet</p>
  </div>
</template>
