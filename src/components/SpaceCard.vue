<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Space } from '../data/types'

defineProps<{ space: Space }>()

function formatPrice(n: number): string {
  return '฿' + n.toLocaleString('th-TH')
}
</script>

<template>
  <RouterLink :to="`/spaces/${space.id}`" class="group block">
    <div class="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-muted mb-3">
      <img
        :src="space.images[0]"
        :alt="space.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />
      <span class="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm text-text-secondary text-xs font-medium px-2.5 py-1 rounded-full">
        {{ space.category }}
      </span>
    </div>

    <div class="space-y-0.5">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-medium text-text-primary leading-snug group-hover:text-brand transition-colors">
          {{ space.name }}
        </h3>
        <div class="flex items-center gap-1 shrink-0 text-sm text-text-secondary">
          <span class="text-accent">★</span>
          <span class="font-medium">{{ space.rating }}</span>
          <span class="text-text-muted">({{ space.reviewCount }})</span>
        </div>
      </div>
      <p class="text-sm text-text-secondary">{{ space.location }} · up to {{ space.capacity }} pax</p>
      <p class="pt-1 text-sm">
        <span class="font-medium font-mono text-text-primary">{{ formatPrice(space.hourlyRate) }}</span>
        <span class="text-text-muted"> / hr</span>
        <span class="text-text-muted mx-1.5">·</span>
        <span class="font-medium font-mono text-text-primary">{{ formatPrice(space.dailyRate) }}</span>
        <span class="text-text-muted"> / day</span>
      </p>
    </div>
  </RouterLink>
</template>
