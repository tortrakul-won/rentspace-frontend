<script setup lang="ts">
import { ref, watch } from 'vue'
import NavBar from '../components/NavBar.vue'
import SpaceCard from '../components/SpaceCard.vue'
import { useToast } from '../composables/useToast'
import { listSpaces } from '../api/spaces'
import type { SpaceResponse } from '../api/types'

const { show } = useToast()

const categories = ['All', 'Studio', 'Outdoor', 'Loft', 'Garden', 'Office', 'Café']
const activeCategory = ref('All')
const searchQuery = ref('')
const pendingSearch = ref('')

const spaces = ref<SpaceResponse[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const fetchError = ref(false)
const page = ref(1)
const hasMore = ref(false)
const total = ref(0)

async function fetchSpaces(reset: boolean) {
  const p = reset ? 1 : page.value + 1
  if (reset) { loading.value = true; fetchError.value = false }
  else loadingMore.value = true

  try {
    const cat = activeCategory.value === 'All' ? undefined : activeCategory.value
    const res = await listSpaces(p, 20, cat, searchQuery.value.trim() || undefined)
    spaces.value = reset ? res.data : [...spaces.value, ...res.data]
    hasMore.value = res.has_more
    total.value = res.total
    page.value = p
  } catch {
    fetchError.value = true
    show('Failed to load spaces', 'error')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function handleSearch() {
  searchQuery.value = pendingSearch.value
}

watch(activeCategory, () => fetchSpaces(true))
watch(searchQuery, () => fetchSpaces(true))

fetchSpaces(true)
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
            v-model="pendingSearch"
            type="text"
            placeholder="Search by name or location…"
            class="flex-1 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none rounded-xl"
            @keydown.enter="handleSearch"
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
            @click="handleSearch"
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

      <!-- Skeleton loader -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="aspect-[4/3] rounded-xl bg-surface-muted mb-3"></div>
          <div class="h-4 bg-surface-muted rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-surface-muted rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-surface-muted rounded w-1/3"></div>
        </div>
      </div>

      <template v-else>
        <!-- Error state -->
        <div v-if="fetchError" class="text-center py-24">
          <p class="text-text-muted mb-4">Could not load spaces. Please try again.</p>
          <button
            @click="fetchSpaces(true)"
            class="text-sm text-brand hover:text-brand-hover font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </div>

        <template v-else>
          <!-- Result count -->
          <p class="text-sm text-text-muted mb-6">
            {{ total }} space{{ total !== 1 ? 's' : '' }} available
          </p>

          <!-- Grid -->
          <div
            v-if="spaces.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10"
          >
            <SpaceCard v-for="space in spaces" :key="space.id" :space="space" />
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-24">
            <p class="text-text-primary font-medium mb-1">No spaces available yet</p>
            <p class="text-text-muted text-sm">Check back soon</p>
          </div>

          <!-- Load more -->
          <div v-if="hasMore" class="pt-10 text-center">
            <button
              @click="fetchSpaces(false)"
              :disabled="loadingMore"
              class="px-8 py-3 text-sm font-medium text-text-secondary border border-border rounded-xl hover:border-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
            >
              {{ loadingMore ? 'Loading…' : 'Load more' }}
            </button>
          </div>
        </template>
      </template>

    </section>
  </div>
</template>
