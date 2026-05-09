<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SpaceFormData, AvailabilitySlot } from '../api/types'

const props = defineProps<{
  modelValue: SpaceFormData
  availability: AvailabilitySlot[]
  submitting: boolean
  submitLabel: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SpaceFormData]
  'update:availability': [value: AvailabilitySlot[]]
  submit: []
}>()

const CATEGORIES = ['Studio', 'Outdoor', 'Loft', 'Garden', 'Office', 'Café']

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Local availability state: one entry per day, with enabled flag
type DaySchedule = { enabled: boolean; open_time: string; close_time: string }
const schedule = ref<DaySchedule[]>(
  DAYS.map((_, i) => {
    const slot = props.availability.find((s) => s.day_of_week === i)
    return { enabled: !!slot, open_time: slot?.open_time ?? '09:00', close_time: slot?.close_time ?? '18:00' }
  }),
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

// Image URLs — stored as comma-separated in a textarea
const imagesRaw = ref(props.modelValue.images.join('\n'))
watch(imagesRaw, (v) => {
  emit('update:modelValue', {
    ...props.modelValue,
    images: v.split('\n').map((u) => u.trim()).filter(Boolean),
  })
})

// Amenities — comma-separated
const amenitiesRaw = ref(props.modelValue.amenities.join(', '))
watch(amenitiesRaw, (v) => {
  emit('update:modelValue', {
    ...props.modelValue,
    amenities: v.split(',').map((a) => a.trim()).filter(Boolean),
  })
})

function update<K extends keyof SpaceFormData>(key: K, value: SpaceFormData[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <form @submit.prevent="emit('submit')" class="space-y-8">

    <!-- Basic Info -->
    <section class="bg-surface border border-border rounded-2xl p-6 space-y-5">
      <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Basic Info</h2>

      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">Space name</label>
        <input
          :value="modelValue.name"
          @input="update('name', ($event.target as HTMLInputElement).value)"
          type="text"
          required
          placeholder="e.g. The Loft Studio"
          class="w-full px-4 py-2.5 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">Description</label>
        <textarea
          :value="modelValue.description"
          @input="update('description', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          required
          placeholder="Describe your space…"
          class="w-full px-4 py-2.5 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition resize-none"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">Location</label>
          <input
            :value="modelValue.location"
            @input="update('location', ($event.target as HTMLInputElement).value)"
            type="text"
            required
            placeholder="e.g. Sukhumvit, Bangkok"
            class="w-full px-4 py-2.5 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">Category</label>
          <select
            :value="modelValue.category"
            @change="update('category', ($event.target as HTMLSelectElement).value)"
            required
            class="w-full px-4 py-2.5 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          >
            <option value="" disabled>Select a category</option>
            <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Media -->
    <section class="bg-surface border border-border rounded-2xl p-6 space-y-5">
      <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Photos</h2>
      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">Image URLs <span class="text-text-muted font-normal">(one per line)</span></label>
        <textarea
          v-model="imagesRaw"
          rows="3"
          placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
          class="w-full px-4 py-2.5 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition resize-none font-mono"
        />
        <p class="text-xs text-text-muted mt-1">At least 1 photo required. Use 16:9 ratio images for best results.</p>
      </div>
    </section>

    <!-- Capacity & Amenities -->
    <section class="bg-surface border border-border rounded-2xl p-6 space-y-5">
      <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Space Details</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">Capacity <span class="text-text-muted font-normal">(max guests)</span></label>
          <input
            :value="modelValue.capacity"
            @input="update('capacity', parseInt(($event.target as HTMLInputElement).value) || 1)"
            type="number"
            min="1"
            required
            class="w-full px-4 py-2.5 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">Amenities <span class="text-text-muted font-normal">(comma-separated)</span></label>
          <input
            v-model="amenitiesRaw"
            type="text"
            placeholder="WiFi, Projector, Parking"
            class="w-full px-4 py-2.5 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="bg-surface border border-border rounded-2xl p-6 space-y-5">
      <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Pricing</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">Hourly rate <span class="text-text-muted font-normal">(฿)</span></label>
          <input
            :value="modelValue.hourly_rate"
            @input="update('hourly_rate', parseInt(($event.target as HTMLInputElement).value) || 0)"
            type="number"
            min="1"
            required
            class="w-full px-4 py-2.5 text-sm font-mono text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">Daily rate <span class="text-text-muted font-normal">(฿)</span></label>
          <input
            :value="modelValue.daily_rate"
            @input="update('daily_rate', parseInt(($event.target as HTMLInputElement).value) || 0)"
            type="number"
            min="1"
            required
            class="w-full px-4 py-2.5 text-sm font-mono text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">Minimum hours</label>
          <input
            :value="modelValue.min_hours"
            @input="update('min_hours', parseInt(($event.target as HTMLInputElement).value) || 1)"
            type="number"
            min="1"
            required
            class="w-full px-4 py-2.5 text-sm font-mono text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">Weekend surcharge <span class="text-text-muted font-normal">(%)</span></label>
          <input
            :value="modelValue.weekend_surcharge_pct"
            @input="update('weekend_surcharge_pct', parseInt(($event.target as HTMLInputElement).value) || 0)"
            type="number"
            min="0"
            max="100"
            class="w-full px-4 py-2.5 text-sm font-mono text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>
      </div>
    </section>

    <!-- Availability -->
    <section class="bg-surface border border-border rounded-2xl p-6 space-y-4">
      <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Weekly Schedule</h2>
      <p class="text-xs text-text-muted -mt-2">Leave a day unchecked to mark it as closed.</p>
      <div class="space-y-3">
        <div
          v-for="(day, i) in schedule"
          :key="i"
          class="flex items-center gap-4 flex-wrap"
        >
          <label class="flex items-center gap-2 w-28 cursor-pointer">
            <input
              type="checkbox"
              v-model="day.enabled"
              class="w-4 h-4 rounded border-border text-brand focus:ring-brand/30"
            />
            <span class="text-sm text-text-primary">{{ DAYS[i] }}</span>
          </label>
          <template v-if="day.enabled">
            <div class="flex items-center gap-2">
              <input
                type="time"
                v-model="day.open_time"
                class="px-3 py-1.5 text-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
              />
              <span class="text-text-muted text-sm">to</span>
              <input
                type="time"
                v-model="day.close_time"
                class="px-3 py-1.5 text-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
              />
            </div>
          </template>
          <span v-else class="text-sm text-text-muted">Closed</span>
        </div>
      </div>
    </section>

    <!-- Submit -->
    <div class="flex justify-end gap-3">
      <slot name="cancel" />
      <button
        type="submit"
        :disabled="submitting"
        class="px-6 py-2.5 bg-brand text-text-inverse text-sm font-medium rounded-xl hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ submitting ? 'Saving…' : submitLabel }}
      </button>
    </div>

  </form>
</template>
