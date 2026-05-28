<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SpaceResponse, AvailabilitySlot } from '../api/types'
import BookingCalendar from './booking/BookingCalendar.vue'
import BookingTimeSelector from './booking/BookingTimeSelector.vue'
import BookingPricePreview from './booking/BookingPricePreview.vue'
import { formatPrice } from '../utils/format'

const props = defineProps<{
  space: SpaceResponse
  availability: AvailabilitySlot[]
  submitting: boolean
  token?: string | null
}>()

const emit = defineEmits<{
  book: [startTime: string, endTime: string]
}>()

const selectedDate = ref<Date | null>(null)
const openSlotData = ref<AvailabilitySlot | null>(null)
const startTime = ref('')
const endTime = ref('')

function onDaySelect({ date, openSlot }: { date: Date; openSlot: AvailabilitySlot | null }) {
  selectedDate.value = date
  openSlotData.value = openSlot
  startTime.value = openSlot?.open_time ?? '09:00'
  endTime.value = ''
}

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
  if (openSlotData.value) {
    const [oh, om] = openSlotData.value.open_time.split(':').map(Number)
    const [ch, cm] = openSlotData.value.close_time.split(':').map(Number)
    const [sh, sm] = startTime.value.split(':').map(Number)
    const [eh, em] = endTime.value.split(':').map(Number)
    if (sh * 60 + sm < oh * 60 + om) return `Space opens at ${openSlotData.value.open_time}`
    if (eh * 60 + em > ch * 60 + cm) return `Space closes at ${openSlotData.value.close_time}`
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

    <BookingCalendar
      :space-id="space.id"
      :availability="availability"
      :token="token"
      :selected-date="selectedDate"
      @day-select="onDaySelect"
    />

    <BookingTimeSelector
      v-if="selectedDate"
      :selected-date="selectedDate"
      :open-slot="openSlotData"
      :start-time="startTime"
      :end-time="endTime"
      @update:start-time="startTime = $event"
      @update:end-time="endTime = $event"
    />

    <BookingPricePreview v-if="previewPrice !== null" :hours="previewHours!" :price="previewPrice" />

    <p v-if="validationError" class="text-xs text-red-500">{{ validationError }}</p>

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
