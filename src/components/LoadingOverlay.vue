<script setup lang="ts">
import AppLogo from "./AppLogo.vue";
</script>

<template>
  <Transition name="fade">
    <div
      class="fixed inset-0 z-200 bg-surface flex flex-col items-center justify-center gap-5"
    >
      <AppLogo size="md" />
      <svg
        class="w-5 h-5 text-brand animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
