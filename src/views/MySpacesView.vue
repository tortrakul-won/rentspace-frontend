<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { listMySpaces, deactivateSpace } from '../api/spaces'
import type { SpaceResponse } from '../api/types'

const router = useRouter()
const { token } = useAuth()
const { show } = useToast()
const { show: showLoading, hide: hideLoading } = useLoading()

const spaces = ref<SpaceResponse[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const fetchError = ref(false)
const page = ref(1)
const hasMore = ref(false)
const confirmDeactivateId = ref<string | null>(null)

async function fetchPage(p: number) {
  const res = await listMySpaces(token.value!, p)
  spaces.value = p === 1 ? res.data : [...spaces.value, ...res.data]
  hasMore.value = res.has_more
  page.value = p
}

async function loadMore() {
  loadingMore.value = true
  try {
    await fetchPage(page.value + 1)
  } catch {
    show('Failed to load more spaces', 'error')
  } finally {
    loadingMore.value = false
  }
}

onMounted(async () => {
  try {
    await fetchPage(1)
  } catch {
    fetchError.value = true
    show('Failed to load your spaces', 'error')
  } finally {
    loading.value = false
  }
})

async function handleDeactivate(id: string) {
  confirmDeactivateId.value = null
  showLoading()
  try {
    await deactivateSpace(id, token.value!)
    spaces.value = spaces.value.map((s) => s.id === id ? { ...s, is_active: false } : s)
    show('Space deactivated', 'success')
  } catch (e: any) {
    show(e?.message ?? 'Failed to deactivate', 'error')
  } finally {
    hideLoading()
  }
}

async function retryLoad() {
  fetchError.value = false
  loading.value = true
  try {
    await fetchPage(1)
  } catch {
    fetchError.value = true
    show('Failed to load your spaces', 'error')
  } finally {
    loading.value = false
  }
}

function formatPrice(n: number): string {
  return '฿' + n.toLocaleString('th-TH')
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <div class="max-w-5xl mx-auto px-6 py-10">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">My Spaces</h1>
          <p class="text-sm text-text-secondary mt-1">Manage your listings</p>
        </div>
        <button
          @click="router.push('/spaces/new')"
          class="px-4 py-2 bg-brand text-text-inverse text-sm font-medium rounded-xl hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
        >
          + Add space
        </button>
      </div>

      <!-- Skeleton loader -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-2xl p-5 animate-pulse">
          <div class="h-4 bg-surface-muted rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-surface-muted rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-surface-muted rounded w-1/4"></div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="fetchError" class="text-center py-24">
        <p class="text-text-muted mb-4">Could not load your spaces. Please try again.</p>
        <button
          @click="retryLoad"
          class="text-sm text-brand hover:text-brand-hover font-medium underline underline-offset-2"
        >
          Retry
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="spaces.length === 0" class="text-center py-24">
        <p class="text-4xl mb-4">🏢</p>
        <p class="text-text-primary font-medium mb-1">No spaces yet</p>
        <p class="text-text-muted text-sm mb-6">Create your first listing to start accepting bookings</p>
        <button
          @click="router.push('/spaces/new')"
          class="px-6 py-2.5 bg-brand text-text-inverse text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors"
        >
          Create a space
        </button>
      </div>

      <!-- Space list -->
      <div v-else class="space-y-4">
        <div
          v-for="space in spaces"
          :key="space.id"
          class="bg-surface border border-border rounded-2xl p-5 flex gap-4"
        >
          <!-- Thumbnail -->
          <div class="w-24 h-20 rounded-xl overflow-hidden bg-surface-muted shrink-0">
            <img
              v-if="space.images[0]"
              :src="space.images[0]"
              :alt="space.name"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 class="font-semibold text-text-primary leading-snug">{{ space.name }}</h2>
                <p class="text-sm text-text-secondary mt-0.5">{{ space.location }} · {{ space.category }}</p>
                <p class="text-sm mt-1">
                  <span class="font-mono font-medium text-text-primary">{{ formatPrice(space.hourly_rate) }}</span>
                  <span class="text-text-muted"> / hr</span>
                  <span class="text-text-muted mx-1.5">·</span>
                  <span class="font-mono font-medium text-text-primary">{{ formatPrice(space.daily_rate) }}</span>
                  <span class="text-text-muted"> / day</span>
                  <template v-if="space.weekend_surcharge_pct > 0">
                    <span class="text-text-muted mx-1.5">·</span>
                    <span class="text-text-secondary">+{{ space.weekend_surcharge_pct }}% weekends</span>
                  </template>
                </p>
              </div>

              <!-- Status badge -->
              <span
                :class="[
                  'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full',
                  space.is_active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-surface-muted text-text-muted',
                ]"
              >
                {{ space.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 mt-3">
              <button
                @click="router.push(`/spaces/${space.id}/edit`)"
                class="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:border-text-secondary hover:text-text-primary transition-colors"
              >
                Edit
              </button>
              <button
                v-if="space.is_active"
                @click="confirmDeactivateId = space.id"
                class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
        <!-- Load more -->
        <div v-if="hasMore" class="pt-2 text-center">
          <button
            @click="loadMore"
            :disabled="loadingMore"
            class="px-6 py-2.5 text-sm font-medium text-text-secondary border border-border rounded-xl hover:border-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
          >
            {{ loadingMore ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm deactivate dialog -->
    <Teleport to="body">
      <div
        v-if="confirmDeactivateId"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        @click.self="confirmDeactivateId = null"
      >
        <div class="bg-surface rounded-2xl shadow-xl p-6 max-w-sm w-full">
          <h3 class="text-base font-semibold text-text-primary mb-1">Deactivate space?</h3>
          <p class="text-sm text-text-secondary mb-5">
            The listing will be hidden from search. Existing confirmed bookings are not affected.
          </p>
          <div class="flex gap-2 justify-end">
            <button
              @click="confirmDeactivateId = null"
              class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleDeactivate(confirmDeactivateId!)"
              class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
