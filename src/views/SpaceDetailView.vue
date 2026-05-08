<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { getSpaceById } from '../data/spaces'

const route = useRoute()
const space = computed(() => getSpaceById(route.params.id as string))

function formatPrice(n: number): string {
  return '฿' + n.toLocaleString('th-TH')
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <NavBar />

    <div v-if="space" class="max-w-5xl mx-auto px-6 py-10">
      <RouterLink to="/" class="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6">
        ← Back to listings
      </RouterLink>

      <div class="aspect-video rounded-2xl overflow-hidden bg-surface-muted mb-8">
        <img :src="space.images[0]" :alt="space.name" class="w-full h-full object-cover" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2 space-y-6">
          <div>
            <span class="text-xs font-medium text-brand bg-brand-light px-2.5 py-1 rounded-full">{{ space.category }}</span>
            <h1 class="text-3xl font-bold text-text-primary mt-3 mb-1">{{ space.name }}</h1>
            <p class="text-text-secondary">{{ space.location }} · up to {{ space.capacity }} pax</p>
          </div>
          <p class="text-text-secondary leading-relaxed">{{ space.description }}</p>
          <div>
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

        <!-- Booking panel (stub) -->
        <div class="lg:col-span-1">
          <div class="border border-border rounded-2xl p-6 sticky top-24">
            <div class="mb-4">
              <p class="text-2xl font-bold font-mono text-text-primary">
                {{ formatPrice(space.hourlyRate) }}<span class="text-base font-normal text-text-muted font-sans"> / hr</span>
              </p>
              <p class="text-text-muted text-sm mt-0.5">{{ formatPrice(space.dailyRate) }} / day · min {{ space.minHours }} hrs</p>
            </div>
            <div class="flex items-center gap-1 text-sm text-text-secondary mb-6">
              <span class="text-accent">★</span>
              <span class="font-medium">{{ space.rating }}</span>
              <span class="text-text-muted">({{ space.reviewCount }} reviews)</span>
            </div>
            <button class="w-full bg-brand text-text-inverse py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors">
              Request to book
            </button>
            <p class="text-xs text-text-muted text-center mt-3">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-5xl mx-auto px-6 py-20 text-center">
      <p class="text-text-muted mb-4">Space not found</p>
      <RouterLink to="/" class="text-brand text-sm font-medium hover:underline">← Back to listings</RouterLink>
    </div>
  </div>
</template>
