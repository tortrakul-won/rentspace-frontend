<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  images: string[]
  name: string
  open: boolean
  index: number
}>()

const emit = defineEmits<{
  close: []
  prev: []
  next: []
  goto: [i: number]
}>()

function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'ArrowLeft')  emit('prev')
  if (e.key === 'ArrowRight') emit('next')
  if (e.key === 'Escape')     emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      @click.self="emit('close')"
    >
      <button
        class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <span class="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium">
        {{ index + 1 }} / {{ images.length }}
      </span>

      <button
        v-if="images.length > 1"
        class="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        @click="emit('prev')"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <img
        :src="images[index]"
        :alt="`${name} ${index + 1}`"
        class="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
      />

      <button
        v-if="images.length > 1"
        class="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        @click="emit('next')"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div v-if="images.length > 1" class="absolute bottom-4 flex gap-1.5">
        <button
          v-for="(_, i) in images"
          :key="i"
          class="w-1.5 h-1.5 rounded-full transition-colors"
          :class="i === index ? 'bg-white' : 'bg-white/40'"
          @click="emit('goto', i)"
        />
      </div>
    </div>
  </Teleport>
</template>
