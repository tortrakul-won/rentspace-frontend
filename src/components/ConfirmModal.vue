<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('cancel')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="emit('cancel')" />

        <!-- Dialog -->
        <div class="relative bg-surface rounded-2xl shadow-xl w-full max-w-sm p-6">
          <h2 class="text-base font-semibold text-text-primary">{{ title }}</h2>
          <p v-if="message" class="text-sm text-text-muted mt-1.5">{{ message }}</p>

          <div class="flex gap-3 mt-6">
            <button
              @click="emit('cancel')"
              class="flex-1 border border-border text-text-secondary py-2.5 rounded-xl text-sm font-medium hover:bg-surface-muted transition-colors"
            >
              {{ cancelLabel ?? 'Cancel' }}
            </button>
            <button
              @click="emit('confirm')"
              :class="[
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                destructive
                  ? 'bg-error text-text-inverse hover:opacity-90'
                  : 'bg-brand text-text-inverse hover:bg-brand-hover',
              ]"
            >
              {{ confirmLabel ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
