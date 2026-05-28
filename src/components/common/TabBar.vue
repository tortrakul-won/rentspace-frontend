<script setup lang="ts">
defineProps<{
  tabs: { key: string; label: string }[]
  modelValue: string
  counts?: Record<string, number>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex gap-1 border-b border-border mb-6">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="emit('update:modelValue', tab.key)"
      :class="[
        'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
        modelValue === tab.key
          ? 'border-brand text-brand'
          : 'border-transparent text-text-muted hover:text-text-primary',
      ]"
    >
      {{ tab.label }}
      <span
        v-if="counts?.[tab.key]"
        :class="[
          'ml-1.5 text-[10px] font-bold rounded-full px-1.5 py-0.5',
          modelValue === tab.key ? 'bg-brand text-text-inverse' : 'bg-surface-muted text-text-muted',
        ]"
      >{{ counts[tab.key] }}</span>
    </button>
  </div>
</template>
