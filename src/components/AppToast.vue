<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{ id: number; message: string; type: 'success' | 'error' }>()
const emit = defineEmits<{ close: [id: number] }>()

let timer: ReturnType<typeof setTimeout>
onMounted(() => { timer = setTimeout(() => emit('close', props.id), 6000) })
onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div
    :class="[
      'flex items-start gap-3 shadow-lg rounded-xl px-4 py-3.5 w-80 border animate-slide-in',
      props.type === 'success'
        ? 'bg-surface border-green-200'
        : 'bg-surface border-red-200',
    ]"
  >
    <!-- Icon -->
    <div
      :class="[
        'shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center',
        props.type === 'success' ? 'bg-green-100' : 'bg-red-100',
      ]"
    >
      <svg v-if="props.type === 'success'" class="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else class="w-3 h-3 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>

    <!-- Text -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-text-primary">
        {{ props.type === 'success' ? 'Success' : 'Something went wrong' }}
      </p>
      <p class="text-sm text-text-secondary mt-0.5 break-words">{{ message }}</p>
    </div>

    <!-- Dismiss -->
    <button
      @click="emit('close', props.id)"
      class="shrink-0 text-text-muted hover:text-text-primary transition-colors mt-0.5"
      aria-label="Dismiss"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
@keyframes slide-in {
  from { opacity: 0; transform: translateX(1rem); }
  to   { opacity: 1; transform: translateX(0); }
}
.animate-slide-in { animation: slide-in 0.2s ease-out; }
</style>
