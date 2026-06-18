<script setup lang="ts">
import AppSpinner from '../AppSpinner.vue'
import { formatPrice } from '../../utils/format'
import type { SpaceResponse } from '../../api/types'

defineProps<{
  space: SpaceResponse
  deactivating: boolean
  reactivating: boolean
  deleting: boolean
}>()

const emit = defineEmits<{
  edit: []
  'confirm-deactivate': []
  reactivate: []
  'confirm-delete': []
}>()
</script>

<template>
  <div class="bg-surface border border-border rounded-2xl p-5 flex gap-4">
    <!-- Thumbnail -->
    <div class="w-24 h-20 rounded-xl overflow-hidden bg-surface-muted shrink-0">
      <img
        v-if="space.images[0]"
        :src="space.images[0]"
        :alt="space.name"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h2 class="font-semibold text-text-primary leading-snug">{{ space.name }}</h2>
          <p class="text-sm text-text-secondary mt-0.5">{{ space.location }} · {{ space.category }}</p>
          <p class="text-sm mt-1">
            <span class="font-mono font-medium text-text-primary">{{ formatPrice(space.hourly_rate) }}</span>
            <span class="text-text-muted"> / hr</span>
            <span class="text-text-muted mx-1.5">·</span>
            <span class="font-mono font-medium text-text-primary">{{ formatPrice(space.daily_rate) }}</span>
            <span class="text-text-muted"> / day</span>
            <template v-if="space.weekend_surcharge_pct > 0">
              <span class="text-text-muted mx-1.5">·</span>
              <span class="text-text-secondary">+{{ space.weekend_surcharge_pct }}% weekends</span>
            </template>
          </p>
        </div>
        <span
          :class="[
            'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full',
            space.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-muted text-text-muted',
          ]"
        >{{ space.is_active ? 'Active' : 'Inactive' }}</span>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 mt-3 flex-wrap">
        <button
          @click="emit('edit')"
          class="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:border-text-secondary hover:text-text-primary transition-colors"
        >Edit</button>
        <button
          v-if="space.is_active"
          @click="emit('confirm-deactivate')"
          :disabled="deactivating"
          class="px-3 py-1.5 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
        >
          <AppSpinner v-if="deactivating" />
          <span>{{ deactivating ? 'Deactivating…' : 'Deactivate' }}</span>
        </button>
        <button
          v-else
          @click="emit('reactivate')"
          :disabled="reactivating"
          class="px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
        >
          <AppSpinner v-if="reactivating" />
          <span>{{ reactivating ? 'Reactivating…' : 'Reactivate' }}</span>
        </button>
        <button
          @click="emit('confirm-delete')"
          :disabled="deleting"
          class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-400 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
        >
          <AppSpinner v-if="deleting" />
          <span>{{ deleting ? 'Deleting…' : 'Delete' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
