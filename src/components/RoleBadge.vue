<script setup lang="ts">
defineProps<{ role: string }>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded',
      role === 'owner' ? 'bg-brand-light text-brand' : 'bg-emerald-100 text-emerald-700',
    ]"
  >
    {{ role }}
  </span>
</template>
