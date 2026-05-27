<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import BookingPanel from '../components/BookingPanel.vue'
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

import { computed, onUnmounted } from 'vue'

const isRenter = computed(() => activeProfile.value?.role === 'renter')

// Mobile carousel
const carouselRef = ref<HTMLElement | null>(null)
const mobileIndex = ref(0)

function onCarouselScroll() {
  if (!carouselRef.value) return
  const w = carouselRef.value.clientWidth
  if (w) mobileIndex.value = Math.round(carouselRef.value.scrollLeft / w)
}

function scrollToSlide(i: number) {
  if (!carouselRef.value) return
  carouselRef.value.scrollTo({ left: i * carouselRef.value.clientWidth, behavior: 'smooth' })
  mobileIndex.value = i
}

// Lightbox
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

function onKey(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'ArrowLeft')  lightboxPrev()
  if (e.key === 'ArrowRight') lightboxNext()
  if (e.key === 'Escape')     lightboxOpen.value = false
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)
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

onUnmounted(() => window.removeEventListener('keydown', onKey))

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

      <!-- Photo gallery -->
      <div class="mb-8">

        <!-- ── Mobile: horizontal scroll carousel (hidden on lg+) ── -->
        <div class="lg:hidden relative rounded-2xl overflow-hidden aspect-video bg-surface-muted">
          <div
            ref="carouselRef"
            class="flex h-full carousel-scroll overflow-x-auto snap-x snap-mandatory"
            @scroll="onCarouselScroll"
          >
            <div
              v-for="(img, idx) in space.images"
              :key="idx"
              class="flex-shrink-0 w-full h-full snap-start cursor-pointer"
              @click="openLightbox(idx)"
            >
              <img :src="img" :alt="`${space.name} ${idx + 1}`" class="w-full h-full object-cover" />
            </div>
          </div>
          <!-- Dot indicators -->
          <div v-if="space.images.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            <button
              v-for="(_, i) in space.images"
              :key="i"
              class="w-2 h-2 rounded-full transition-colors"
              :class="i === mobileIndex ? 'bg-white' : 'bg-white/40'"
              @click.stop="scrollToSlide(i)"
            />
          </div>
        </div>

        <!-- ── Desktop: hero left + grid right (hidden below lg) ── -->
        <div class="hidden lg:block">
          <!-- Single image -->
          <div
            v-if="space.images.length <= 1"
            class="aspect-video rounded-2xl overflow-hidden bg-surface-muted cursor-pointer"
            @click="openLightbox(0)"
          >
            <img v-if="space.images[0]" :src="space.images[0]" :alt="space.name" class="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300" />
          </div>

          <!-- Multi-image: hero left + 2-cell column right -->
          <div v-else class="rounded-2xl overflow-hidden grid grid-cols-[5fr_1fr] gap-1" style="height: 420px">
            <!-- Hero -->
            <div class="overflow-hidden cursor-pointer group" @click="openLightbox(0)">
              <img :src="space.images[0]" :alt="space.name" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
            </div>

            <!-- Right column -->
            <div class="grid grid-rows-2 gap-1">
              <div class="overflow-hidden cursor-pointer group relative" @click="openLightbox(1)">
                <img :src="space.images[1]" :alt="`${space.name} 2`" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
              </div>
              <div class="overflow-hidden relative bg-surface-muted">
                <template v-if="space.images[2]">
                  <div class="cursor-pointer group w-full h-full" @click="openLightbox(2)">
                    <img :src="space.images[2]" :alt="`${space.name} 3`" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  </div>
                  <div
                    v-if="space.images.length > 3"
                    class="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                    @click="openLightbox(2)"
                  >
                    <span class="text-white text-sm font-semibold">+{{ space.images.length - 3 }} more</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

      </div>

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
              >
                {{ a }}
              </span>
            </div>
          </div>
        </div>

        <!-- Booking panel (renter only) -->
        <div class="lg:col-span-1">
          <BookingPanel
            v-if="isRenter"
            :space="space"
            :availability="availability"
            :submitting="submitting"
            :token="token"
            @book="handleBook"
          />
          <!-- Non-renter placeholder -->
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

  <!-- Lightbox -->
  <Teleport to="body">
    <div
      v-if="lightboxOpen && space"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      @click.self="lightboxOpen = false"
    >
      <!-- Close -->
      <button
        class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        @click="lightboxOpen = false"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Counter -->
      <span class="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium">
        {{ lightboxIndex + 1 }} / {{ space.images.length }}
      </span>

      <!-- Prev -->
      <button
        v-if="space.images.length > 1"
        class="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        @click="lightboxPrev"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Image -->
      <img
        :src="space.images[lightboxIndex]"
        :alt="`${space.name} ${lightboxIndex + 1}`"
        class="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
      />

      <!-- Next -->
      <button
        v-if="space.images.length > 1"
        class="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        @click="lightboxNext"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Dot indicators -->
      <div v-if="space.images.length > 1" class="absolute bottom-4 flex gap-1.5">
        <button
          v-for="(_, i) in space.images"
          :key="i"
          class="w-1.5 h-1.5 rounded-full transition-colors"
          :class="i === lightboxIndex ? 'bg-white' : 'bg-white/40'"
          @click="lightboxIndex = i"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.carousel-scroll::-webkit-scrollbar { display: none; }
.carousel-scroll { -ms-overflow-style: none; scrollbar-width: none; }
</style>
