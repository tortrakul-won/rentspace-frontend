<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' }>(), { size: 'sm' })
</script>

<template>
  <RouterLink to="/" class="flex items-center gap-2 shrink-0">
    <div
      :class="[
        'bg-brand rounded-lg flex items-center justify-center',
        size === 'md' ? 'w-8 h-8' : 'w-7 h-7',
      ]"
    >
      <span
        :class="[
          'text-text-inverse font-bold tracking-tight',
          size === 'md' ? 'text-sm' : 'text-xs',
        ]"
      >RS</span>
    </div>
    <span
      :class="[
        'font-semibold text-text-primary tracking-tight',
        size === 'md' ? 'text-lg' : 'text-base',
      ]"
    >rentspace</span>
  </RouterLink>
</template>
