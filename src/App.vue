<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppToast from './components/AppToast.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import { useToast } from './composables/useToast'
import { useLoading } from './composables/useLoading'

const { current, dismiss } = useToast()
const { loading } = useLoading()
</script>

<template>
  <LoadingOverlay v-if="loading" />
  <AppToast
    v-if="current"
    :message="current.message"
    :type="current.type"
    @close="dismiss"
  />
  <RouterView />
</template>
