<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import SpaceCard from '../components/SpaceCard.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { listSpaces, listMySpaces } from '../api/spaces'
import type { SpaceResponse } from '../api/types'

const { token, activeProfile } = useAuth()
const { show } = useToast()

const isOwner = computed(() => activeProfile.value?.role === 'owner')

// ── Renter / guest browse ──────────────────────────────────────────────
const categories = ['All', 'Studio', 'Outdoor', 'Loft', 'Garden', 'Office', 'Café', 'Other']
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
    const res = await listSpaces(p, 20, cat, searchQuery.value.trim() || undefined, token.value)
    const data = res.data ?? []
    spaces.value = reset ? data : [...spaces.value, ...data]
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

watch(activeCategory, () => { if (!isOwner.value) fetchSpaces(true) })
watch(searchQuery,    () => { if (!isOwner.value) fetchSpaces(true) })

// ── Owner home ────────────────────────────────────────────────────────
const ownerSpaces = ref<SpaceResponse[]>([])
const ownerLoading = ref(true)
const ownerLoadingMore = ref(false)
const ownerHasMore = ref(false)
const ownerPage = ref(1)

async function fetchOwnerSpaces(reset: boolean) {
  const p = reset ? 1 : ownerPage.value + 1
  if (reset) ownerLoading.value = true
  else ownerLoadingMore.value = true
  try {
    const res = await listMySpaces(token.value!, p, 20)
    ownerSpaces.value = reset ? (res.data ?? []) : [...ownerSpaces.value, ...(res.data ?? [])]
    ownerHasMore.value = res.has_more
    ownerPage.value = p
  } catch {
    show('Failed to load your spaces', 'error')
  } finally {
    ownerLoading.value = false
    ownerLoadingMore.value = false
  }
}

onMounted(() => {
  if (isOwner.value) {
    fetchOwnerSpaces(true)
  } else {
    fetchSpaces(true)
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface">
    <NavBar />

    <!-- ── Owner home ── -->
    <template v-if="isOwner">
      <!-- Owner hero -->
      <section class="bg-brand px-6 py-16 md:py-20">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-inverse leading-tight tracking-tight mb-4">
            Great spaces deserve great renters
          </h1>
          <p class="text-text-inverse-muted text-lg mb-8">
            List yours and connect with Bangkok's best.
          </p>
          <RouterLink
            to="/spaces/new"
            class="inline-flex items-center gap-2 bg-surface text-brand px-8 py-3.5 rounded-2xl text-base font-semibold hover:bg-surface-muted transition-colors shadow-lg"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create a space
          </RouterLink>
        </div>
      </section>

      <!-- Owner spaces list -->
      <section class="max-w-5xl mx-auto px-6 py-10">

        <h1 class="text-2xl font-bold text-text-primary mb-6">Your spaces</h1>

        <!-- Skeleton -->
        <div v-if="ownerLoading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-2xl p-5 animate-pulse">
            <div class="h-4 bg-surface-muted rounded w-1/3 mb-3"></div>
            <div class="h-3 bg-surface-muted rounded w-2/3"></div>
          </div>
        </div>

        <template v-else>
          <!-- Empty state -->
          <div v-if="!ownerSpaces.length" class="text-center py-24">
            <p class="text-text-primary font-medium mb-2">No spaces yet</p>
            <p class="text-text-muted text-sm mb-6">Create your first listing to start accepting bookings</p>
            <RouterLink
              to="/spaces/new"
              class="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-text-inverse text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors"
            >
              Create a space
            </RouterLink>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            <SpaceCard
              v-for="space in ownerSpaces"
              :key="space.id"
              :space="space"
              :to="`/spaces/${space.id}`"
            />
          </div>

          <div v-if="ownerHasMore" class="pt-8 text-center">
            <button
              @click="fetchOwnerSpaces(false)"
              :disabled="ownerLoadingMore"
              class="px-8 py-3 text-sm font-medium text-text-secondary border border-border rounded-xl hover:border-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
            >
              {{ ownerLoadingMore ? 'Loading…' : 'Load more' }}
            </button>
          </div>
        </template>
      </section>

    </template>

    <!-- ── Renter / guest browse ── -->
    <template v-else>
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
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer',
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
          <div v-if="fetchError" class="text-center py-24">
            <p class="text-text-muted mb-4">Could not load spaces. Please try again.</p>
            <button @click="fetchSpaces(true)" class="text-sm text-brand hover:text-brand-hover font-medium underline underline-offset-2">Retry</button>
          </div>

          <template v-else>
            <p class="text-sm text-text-muted mb-6">{{ total }} space{{ total !== 1 ? 's' : '' }} available</p>

            <div v-if="spaces.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              <SpaceCard v-for="space in spaces" :key="space.id" :space="space" />
            </div>

            <div v-else class="text-center py-24">
              <p class="text-text-primary font-medium mb-1">No spaces available yet</p>
              <p class="text-text-muted text-sm">Check back soon</p>
            </div>

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
    </template>
  </div>
</template>
