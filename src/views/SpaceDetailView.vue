<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import BookingPanel from '../components/BookingPanel.vue'
import SpaceGallery from '../components/space/SpaceGallery.vue'
import SpaceLightbox from '../components/space/SpaceLightbox.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { getSpace, getAvailability } from '../api/spaces'
import { createBooking } from '../api/bookings'
import type { SpaceResponse, AvailabilitySlot } from '../api/types'

const route = useRoute()
const router = useRouter()
const { token, activeProfile } = useAuth()
const { show } = useToast()

const space = ref<SpaceResponse | null>(null)
const availability = ref<AvailabilitySlot[]>([])
const loading = ref(true)
const notFound = ref(false)
const submitting = ref(false)

const isRenter = computed(() => activeProfile.value?.role === 'renter')

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(idx: number) {
  lightboxIndex.value = idx
  lightboxOpen.value = true
}

function lightboxPrev() {
  if (!space.value) return
  lightboxIndex.value = (lightboxIndex.value - 1 + space.value.images.length) % space.value.images.length
}

function lightboxNext() {
  if (!space.value) return
  lightboxIndex.value = (lightboxIndex.value + 1) % space.value.images.length
}

onMounted(async () => {
  try {
    const id = route.params.id as string
    const [s, avail] = await Promise.all([
      getSpace(id),
      getAvailability(id, token.value ?? '').catch(() => []),
    ])
    space.value = s
    availability.value = avail
  } catch (e: any) {
    if (e?.status === 404) notFound.value = true
    else show('Failed to load space', 'error')
  } finally {
    loading.value = false
  }
})

async function handleBook(startTime: string, endTime: string) {
  if (!token.value || !space.value) return
  submitting.value = true
  try {
    const booking = await createBooking(
      { space_id: space.value.id, start_time: startTime, end_time: endTime },
      token.value,
    )
    router.push(`/bookings/${booking.id}/confirm`)
  } catch (e: any) {
    const details: Record<string, string> = e?.details ?? {}
    const fieldErrors = Object.entries(details).map(([f, msg]) => `${f}: ${msg}`)
    show(fieldErrors.length ? fieldErrors.join(' · ') : (e?.message ?? 'Failed to create booking'), 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <NavBar />

    <!-- Skeleton -->
    <div v-if="loading" class="max-w-5xl mx-auto px-6 py-10 animate-pulse">
      <div class="h-4 bg-surface-muted rounded w-24 mb-6"></div>
      <div class="aspect-video rounded-2xl bg-surface-muted mb-8"></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2 space-y-4">
          <div class="h-5 bg-surface-muted rounded w-1/4"></div>
          <div class="h-8 bg-surface-muted rounded w-3/4"></div>
          <div class="h-4 bg-surface-muted rounded w-1/3"></div>
          <div class="space-y-2 pt-2">
            <div class="h-3 bg-surface-muted rounded"></div>
            <div class="h-3 bg-surface-muted rounded"></div>
            <div class="h-3 bg-surface-muted rounded w-4/5"></div>
          </div>
        </div>
        <div class="border border-border rounded-2xl p-6 h-48 bg-surface-muted"></div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound || !space" class="max-w-5xl mx-auto px-6 py-20 text-center">
      <p class="text-text-muted mb-4">Space not found</p>
      <RouterLink to="/" class="text-brand text-sm font-medium hover:underline">← Back to listings</RouterLink>
    </div>

    <!-- Content -->
    <div v-else class="max-w-5xl mx-auto px-6 py-10">
      <RouterLink to="/" class="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6">
        ← Back to listings
      </RouterLink>

      <SpaceGallery :images="space.images" :name="space.name" @open-lightbox="openLightbox" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2 space-y-6">
          <div>
            <span class="text-xs font-medium text-brand bg-brand-light px-2.5 py-1 rounded-full">{{ space.category }}</span>
            <h1 class="text-3xl font-bold text-text-primary mt-3 mb-1">{{ space.name }}</h1>
            <p class="text-text-secondary">{{ space.location }} · up to {{ space.capacity }} pax</p>
          </div>
          <p class="text-text-secondary leading-relaxed">{{ space.description }}</p>
          <div v-if="space.amenities.length">
            <h2 class="font-semibold text-text-primary mb-3">Amenities</h2>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="a in space.amenities"
                :key="a"
                class="text-sm bg-surface-muted text-text-secondary px-3 py-1.5 rounded-full"
              >{{ a }}</span>
            </div>
          </div>
        </div>
        <div class="lg:col-span-1">
          <BookingPanel
            v-if="isRenter"
            :space="space"
            :availability="availability"
            :submitting="submitting"
            :token="token"
            @book="handleBook"
          />
          <div v-else class="border border-border rounded-2xl p-6 sticky top-24 text-center space-y-3">
            <p class="text-2xl font-bold font-mono text-text-primary">
              ฿{{ space.hourly_rate.toLocaleString('th-TH') }}<span class="text-base font-normal text-text-muted font-sans"> / hr</span>
            </p>
            <p class="text-sm text-text-muted">Switch to a renter profile to book this space.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <SpaceLightbox
    v-if="space"
    :images="space.images"
    :name="space.name"
    :open="lightboxOpen"
    :index="lightboxIndex"
    @close="lightboxOpen = false"
    @prev="lightboxPrev"
    @next="lightboxNext"
    @goto="lightboxIndex = $event"
  />
</template>
