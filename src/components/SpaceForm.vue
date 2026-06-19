<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SpaceFormData, AvailabilitySlot } from '../api/types'
import SpacePhotoSection from './space/SpacePhotoSection.vue'
import SpaceScheduleSection from './space/SpaceScheduleSection.vue'

const props = defineProps<{
  modelValue: SpaceFormData
  availability: AvailabilitySlot[]
  submitting: boolean
  submitLabel: string
  submitted?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SpaceFormData]
  'update:availability': [value: AvailabilitySlot[]]
  submit: []
}>()

const CATEGORIES = ['Studio', 'Outdoor', 'Loft', 'Garden', 'Office', 'Café', 'Other']

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
      <div class="flex items-baseline justify-between">
        <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Basic Info</h2>
        <p class="text-xs text-text-muted"><span class="text-red-500 font-medium">*</span> Required fields</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">
          Space name <span class="text-red-500">*</span>
        </label>
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
        <label class="block text-sm font-medium text-text-primary mb-1.5">
          Description <span class="text-red-500">*</span>
        </label>
        <textarea
          :value="modelValue.description"
          @input="update('description', ($event.target as HTMLTextAreaElement).value)"
          rows="4"
          required
          placeholder="Describe your space — what makes it unique, what it's best suited for…"
          class="w-full px-4 py-2.5 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition resize-none"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Location <span class="text-red-500">*</span>
          </label>
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
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Category <span class="text-red-500">*</span>
          </label>
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

    <!-- Photos -->
    <SpacePhotoSection :images="modelValue.images" :submitted="submitted" @update:images="update('images', $event)" />

    <!-- Capacity & Amenities -->
    <section class="bg-surface border border-border rounded-2xl p-6 space-y-5">
      <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Space Details</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Capacity <span class="text-red-500">*</span> <span class="text-text-muted font-normal">(max guests)</span>
          </label>
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
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Amenities <span class="text-text-muted font-normal">(optional, comma-separated)</span>
          </label>
          <input
            v-model="amenitiesRaw"
            type="text"
            placeholder="WiFi, Projector, Parking, Air con"
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
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Hourly rate <span class="text-red-500">*</span> <span class="text-text-muted font-normal">(฿)</span>
          </label>
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
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Daily rate <span class="text-red-500">*</span> <span class="text-text-muted font-normal">(฿)</span>
          </label>
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
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Minimum booking <span class="text-red-500">*</span> <span class="text-text-muted font-normal">(minutes)</span>
          </label>
          <input
            :value="modelValue.min_minutes"
            @input="update('min_minutes', parseInt(($event.target as HTMLInputElement).value) || 30)"
            type="number"
            min="30"
            step="30"
            required
            class="w-full px-4 py-2.5 text-sm font-mono text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Weekend surcharge <span class="text-text-muted font-normal">(%)</span>
          </label>
          <input
            :value="modelValue.weekend_surcharge_pct"
            @input="update('weekend_surcharge_pct', parseInt(($event.target as HTMLInputElement).value) || 0)"
            type="number"
            min="0"
            max="100"
            class="w-full px-4 py-2.5 text-sm font-mono text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
          <p class="text-xs text-text-muted mt-1.5">0 = no weekend surcharge</p>
        </div>
      </div>
    </section>

    <!-- Weekly Schedule -->
    <SpaceScheduleSection :availability="availability" @update:availability="emit('update:availability', $event)" />

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
