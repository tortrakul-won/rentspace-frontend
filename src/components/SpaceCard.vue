<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { SpaceResponse } from '../api/types'

defineProps<{ space: SpaceResponse, to?: string }>()

function formatPrice(n: number): string {
  return '฿' + n.toLocaleString('th-TH')
}
</script>

<template>
  <RouterLink :to="to ?? `/spaces/${space.id}`" class="group block">
    <div class="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-muted mb-3">
      <img
        v-if="space.images[0]"
        :src="space.images[0]"
        :alt="space.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />
      <div v-else class="w-full h-full bg-surface-muted" />
      <span class="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm text-text-secondary text-xs font-medium px-2.5 py-1 rounded-full">
        {{ space.category }}
      </span>
    </div>

    <div class="space-y-0.5">
      <h3 class="font-medium text-text-primary leading-snug group-hover:text-brand transition-colors">
        {{ space.name }}
      </h3>
      <p class="text-sm text-text-secondary">{{ space.location }} · up to {{ space.capacity }} pax</p>
      <p class="pt-1 text-sm">
        <span class="font-medium font-mono text-text-primary">{{ formatPrice(space.hourly_rate) }}</span>
        <span class="text-text-muted"> / hr</span>
        <span class="text-text-muted mx-1.5">·</span>
        <span class="font-medium font-mono text-text-primary">{{ formatPrice(space.daily_rate) }}</span>
        <span class="text-text-muted"> / day</span>
      </p>
    </div>
  </RouterLink>
</template>
