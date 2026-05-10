<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppToast from './components/AppToast.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import { useToast } from './composables/useToast'
import { useLoading } from './composables/useLoading'

const { toasts, dismiss } = useToast()
const { loading } = useLoading()
</script>

<template>
  <LoadingOverlay v-if="loading" />

  <!-- Toast stack -->
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2">
    <AppToast
      v-for="toast in toasts"
      :key="toast.id"
      :id="toast.id"
      :message="toast.message"
      :type="toast.type"
      @close="dismiss"
    />
  </div>

  <RouterView />
</template>
