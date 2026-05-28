<script setup lang="ts">
defineProps<{
  heading?: string
  spaceName: string
  spaceLocation: string
  spaceImages?: string[]
}>()
</script>

<template>
  <div>
    <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">{{ heading ?? 'Space' }}</p>
    <div class="flex items-start gap-3">
      <div class="w-14 h-14 rounded-xl overflow-hidden bg-surface-muted flex-shrink-0">
        <img
          v-if="spaceImages?.[0]"
          :src="spaceImages[0]"
          class="w-full h-full object-cover"
          :alt="spaceName"
        />
      </div>
      <div>
        <p class="font-semibold text-text-primary">{{ spaceName }}</p>
        <p class="text-sm text-text-muted mt-0.5">{{ spaceLocation }}</p>
      </div>
    </div>
    <slot />
  </div>
</template>
