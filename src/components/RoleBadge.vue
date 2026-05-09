<script setup lang="ts">
defineProps<{ role: string }>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded',
      role === 'owner' ? 'bg-brand-light text-brand' : 'bg-sky-100 text-sky-700',
    ]"
  >
    {{ role }}
  </span>
</template>
