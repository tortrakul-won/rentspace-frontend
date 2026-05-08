<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="sticky top-0 z-50 bg-surface border-b border-border">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

      <RouterLink to="/" class="flex items-center gap-2 shrink-0">
        <div class="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
          <span class="text-text-inverse text-xs font-bold tracking-tight">RS</span>
        </div>
        <span class="font-semibold text-text-primary text-base tracking-tight">rentspace</span>
      </RouterLink>

      <nav class="hidden md:flex items-center gap-6 text-sm text-text-secondary">
        <RouterLink to="/" class="hover:text-text-primary transition-colors">Browse</RouterLink>
        <a href="#" class="hover:text-text-primary transition-colors">How it works</a>
      </nav>

      <div class="flex items-center gap-3 ml-auto">
        <a href="#" class="hidden md:block text-sm text-text-secondary hover:text-text-primary transition-colors font-medium">
          List your space
        </a>
        <button class="text-sm bg-brand text-text-inverse px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors font-medium">
          Sign in
        </button>
      </div>

    </div>
  </header>
</template>
