<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import SpaceForm from '../components/SpaceForm.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { createSpace, setAvailability } from '../api/spaces'
import type { SpaceFormData, AvailabilitySlot } from '../api/types'

const router = useRouter()
const { token } = useAuth()
const { show } = useToast()

const submitting = ref(false)

const form = ref<SpaceFormData>({
  name: '',
  description: '',
  location: '',
  category: '',
  images: [],
  hourly_rate: 0,
  daily_rate: 0,
  min_hours: 1,
  capacity: 1,
  amenities: [],
  weekend_surcharge_pct: 0,
})

const availability = ref<AvailabilitySlot[]>([])

async function handleSubmit() {
  if (!form.value.images.length) {
    show('At least one photo URL is required', 'error')
    return
  }
  submitting.value = true
  try {
    const space = await createSpace(form.value, token.value!)
    if (availability.value.length > 0) {
      await setAvailability(space.id, availability.value, token.value!)
    }
    show('Space created!', 'success')
    router.push('/my-spaces')
  } catch (e: any) {
    show(e?.message ?? 'Failed to create space', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />
    <div class="max-w-2xl mx-auto px-6 py-10">
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
        <h1 class="text-2xl font-bold text-text-primary">Create a space</h1>
        <p class="text-sm text-text-secondary mt-1">Fill in the details to list your space</p>
      </div>

      <SpaceForm
        v-model="form"
        v-model:availability="availability"
        :submitting="submitting"
        submit-label="Create space"
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
</template>
