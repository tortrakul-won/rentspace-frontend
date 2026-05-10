<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import SpaceForm from '../components/SpaceForm.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { getSpace, updateSpace, getAvailability, setAvailability } from '../api/spaces'
import type { SpaceFormData, AvailabilitySlot } from '../api/types'

const router = useRouter()
const route = useRoute()
const { token } = useAuth()
const { show } = useToast()

const spaceId = route.params.id as string
const loading = ref(true)
const submitting = ref(false)
const notFound = ref(false)

const form = ref<SpaceFormData>({
  name: '',
  description: '',
  location: '',
  category: '',
  images: [],
  hourly_rate: 0,
  daily_rate: 0,
  min_minutes: 60,
  capacity: 1,
  amenities: [],
  weekend_surcharge_pct: 0,
})

const availability = ref<AvailabilitySlot[]>([])

onMounted(async () => {
  try {
    const [space, avail] = await Promise.all([
      getSpace(spaceId),
      getAvailability(spaceId, token.value!),
    ])
    form.value = {
      name: space.name,
      description: space.description,
      location: space.location,
      category: space.category,
      images: space.images,
      hourly_rate: space.hourly_rate,
      daily_rate: space.daily_rate,
      min_minutes: space.min_minutes,
      capacity: space.capacity,
      amenities: space.amenities,
      weekend_surcharge_pct: space.weekend_surcharge_pct,
    }
    availability.value = avail
  } catch (e: any) {
    if (e?.status === 404) {
      notFound.value = true
    } else {
      show('Failed to load space', 'error')
      router.push('/my-spaces')
    }
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  if (!form.value.images.length) {
    show('At least one photo URL is required', 'error')
    return
  }
  submitting.value = true
  try {
    await updateSpace(spaceId, form.value, token.value!)
    await setAvailability(spaceId, availability.value, token.value!)
    show('Space updated!', 'success')
    router.push('/my-spaces')
  } catch (e: any) {
    show(e?.message ?? 'Failed to update space', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />
    <div class="max-w-2xl mx-auto px-6 py-10">

      <!-- Not found -->
      <div v-if="notFound" class="text-center py-24">
        <p class="text-text-primary font-medium mb-1">Space not found</p>
        <p class="text-text-muted text-sm mb-6">It may have been removed or you don't have access.</p>
        <button
          @click="router.push('/my-spaces')"
          class="text-sm text-brand hover:text-brand-hover font-medium underline underline-offset-2"
        >
          Back to My Spaces
        </button>
      </div>

      <!-- Skeleton loader -->
      <div v-else-if="loading" class="space-y-6">
        <div class="h-6 bg-surface-muted rounded w-1/3 animate-pulse"></div>
        <div class="bg-surface border border-border rounded-2xl p-6 space-y-4 animate-pulse">
          <div class="h-4 bg-surface-muted rounded w-1/4"></div>
          <div class="h-10 bg-surface-muted rounded"></div>
          <div class="h-10 bg-surface-muted rounded"></div>
        </div>
      </div>

      <!-- Form -->
      <div v-else>
        <div class="mb-8">
          <button
            @click="router.push('/my-spaces')"
            class="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            My Spaces
          </button>
          <h1 class="text-2xl font-bold text-text-primary">Edit space</h1>
          <p class="text-sm text-text-secondary mt-1">{{ form.name }}</p>
        </div>

        <SpaceForm
          v-model="form"
          v-model:availability="availability"
          :submitting="submitting"
          submit-label="Save changes"
          @submit="handleSubmit"
        >
          <template #cancel>
            <button
              type="button"
              @click="router.push('/my-spaces')"
              class="px-6 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </template>
        </SpaceForm>
      </div>
    </div>
  </div>
</template>
