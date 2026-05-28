<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import OwnerSpaceCard from '../components/space/OwnerSpaceCard.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { minDelay } from '../utils/minDelay'
import { listMySpaces, deactivateSpace, reactivateSpace, deleteSpacePermanent } from '../api/spaces'
import type { SpaceResponse } from '../api/types'

const router = useRouter()
const { token } = useAuth()
const { show } = useToast()

const spaces = ref<SpaceResponse[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const fetchError = ref(false)
const page = ref(1)
const hasMore = ref(false)
const confirmDeactivateId = ref<string | null>(null)
const confirmDeleteId = ref<string | null>(null)
const deactivatingId = ref<string | null>(null)
const reactivatingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

async function fetchPage(p: number) {
  const res = await listMySpaces(token.value!, p)
  const data = res.data ?? []
  spaces.value = p === 1 ? data : [...spaces.value, ...data]
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
  deactivatingId.value = id
  try {
    await minDelay(deactivateSpace(id, token.value!), 500)
    spaces.value = spaces.value.map((s) => s.id === id ? { ...s, is_active: false } : s)
    show('Space deactivated', 'success')
  } catch (e: any) {
    show(e?.message ?? 'Failed to deactivate', 'error')
  } finally {
    deactivatingId.value = null
  }
}

async function handleReactivate(id: string) {
  reactivatingId.value = id
  try {
    await minDelay(reactivateSpace(id, token.value!), 500)
    spaces.value = spaces.value.map((s) => s.id === id ? { ...s, is_active: true } : s)
    show('Space reactivated', 'success')
  } catch (e: any) {
    show(e?.message ?? 'Failed to reactivate', 'error')
  } finally {
    reactivatingId.value = null
  }
}

async function handleDelete(id: string) {
  confirmDeleteId.value = null
  deletingId.value = id
  try {
    await minDelay(deleteSpacePermanent(id, token.value!), 500)
    spaces.value = spaces.value.filter((s) => s.id !== id)
    show('Space deleted', 'success')
  } catch (e: any) {
    show(e?.message ?? 'Failed to delete', 'error')
  } finally {
    deletingId.value = null
  }
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
        >+ Add space</button>
      </div>

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-2xl p-5 animate-pulse">
          <div class="h-4 bg-surface-muted rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-surface-muted rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-surface-muted rounded w-1/4"></div>
        </div>
      </div>

      <div v-else-if="fetchError" class="text-center py-24">
        <p class="text-text-muted mb-4">Could not load your spaces. Please try again.</p>
        <button @click="retryLoad" class="text-sm text-brand hover:text-brand-hover font-medium underline underline-offset-2">Retry</button>
      </div>

      <div v-else-if="spaces.length === 0" class="text-center py-24">
        <p class="text-4xl mb-4">🏢</p>
        <p class="text-text-primary font-medium mb-1">No spaces yet</p>
        <p class="text-text-muted text-sm mb-6">Create your first listing to start accepting bookings</p>
        <button @click="router.push('/spaces/new')" class="px-6 py-2.5 bg-brand text-text-inverse text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors">Create a space</button>
      </div>

      <div v-else class="space-y-4">
        <OwnerSpaceCard
          v-for="space in spaces"
          :key="space.id"
          :space="space"
          :deactivating="deactivatingId === space.id"
          :reactivating="reactivatingId === space.id"
          :deleting="deletingId === space.id"
          @edit="router.push(`/spaces/${space.id}/edit`)"
          @confirm-deactivate="confirmDeactivateId = space.id"
          @reactivate="handleReactivate(space.id)"
          @confirm-delete="confirmDeleteId = space.id"
        />
        <div v-if="hasMore" class="pt-2 text-center">
          <button
            @click="loadMore"
            :disabled="loadingMore"
            class="px-6 py-2.5 text-sm font-medium text-text-secondary border border-border rounded-xl hover:border-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
          >{{ loadingMore ? 'Loading…' : 'Load more' }}</button>
        </div>
      </div>
    </div>
  </div>

  <ConfirmModal
    :open="!!confirmDeactivateId"
    title="Deactivate space?"
    message="The listing will be hidden from search. Existing confirmed bookings are not affected."
    confirm-label="Deactivate"
    @confirm="handleDeactivate(confirmDeactivateId!)"
    @cancel="confirmDeactivateId = null"
  />

  <ConfirmModal
    :open="!!confirmDeleteId"
    title="Delete space permanently?"
    message="This cannot be undone. The listing and all its availability data will be removed."
    confirm-label="Delete permanently"
    destructive
    @confirm="handleDelete(confirmDeleteId!)"
    @cancel="confirmDeleteId = null"
  />
</template>
