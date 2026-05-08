<script setup lang="ts">
import { ref, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import SpaceCard from '../components/SpaceCard.vue'
import { spaces } from '../data/spaces'

const categories = ['All', 'Studio', 'Outdoor', 'Loft', 'Garden', 'Office', 'Café']
const activeCategory = ref('All')
const searchQuery = ref('')

const filteredSpaces = computed(() =>
  spaces.filter((s) => {
    const matchCategory = activeCategory.value === 'All' || s.category === activeCategory.value
    const q = searchQuery.value.toLowerCase().trim()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })
)
</script>

<template>
  <div class="min-h-screen bg-surface">
    <NavBar />

    <!-- Hero -->
    <section class="bg-brand px-6 py-20 md:py-28">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-text-inverse leading-tight tracking-tight mb-4">
          Find spaces for all<br class="hidden sm:block" /> your dreams in Bangkok
        </h1>
        <p class="text-text-inverse-muted text-lg mb-10">
          Studios, rooftops, gardens, and more — book by the hour or by the day
        </p>

        <!-- Search bar -->
        <div class="bg-surface rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or location…"
            class="flex-1 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none rounded-xl"
          />
          <select
            v-model="activeCategory"
            class="px-4 py-3 text-sm text-text-secondary outline-none rounded-xl bg-surface-subtle border border-border cursor-pointer"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat === 'All' ? 'All categories' : cat }}
            </option>
          </select>
          <button
            class="bg-brand text-text-inverse px-7 py-3 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors shrink-0"
          >
            Search
          </button>
        </div>
      </div>
    </section>

    <!-- Listings -->
    <section class="max-w-7xl mx-auto px-6 py-12">

      <!-- Category pills -->
      <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          :class="[
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
            activeCategory === cat
              ? 'bg-brand text-text-inverse'
              : 'bg-surface-muted text-text-secondary hover:bg-surface-hover',
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Result count -->
      <p class="text-sm text-text-muted mb-6">
        {{ filteredSpaces.length }} space{{ filteredSpaces.length !== 1 ? 's' : '' }} available
      </p>

      <!-- Grid -->
      <div
        v-if="filteredSpaces.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10"
      >
        <SpaceCard v-for="space in filteredSpaces" :key="space.id" :space="space" />
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-24">
        <p class="text-2xl mb-2">🔍</p>
        <p class="text-text-primary font-medium mb-1">No spaces found</p>
        <p class="text-text-muted text-sm mb-6">Try a different search or category</p>
        <button
          @click="searchQuery = ''; activeCategory = 'All'"
          class="text-sm text-brand hover:text-brand-hover font-medium underline underline-offset-2"
        >
          Clear filters
        </button>
      </div>

    </section>
  </div>
</template>
