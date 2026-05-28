<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ images: string[]; name: string }>()
const emit = defineEmits<{ 'open-lightbox': [idx: number] }>()

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
</script>

<template>
  <div class="mb-8">
    <!-- Mobile: horizontal scroll carousel -->
    <div class="lg:hidden relative rounded-2xl overflow-hidden aspect-video bg-surface-muted">
      <div
        ref="carouselRef"
        class="flex h-full carousel-scroll overflow-x-auto snap-x snap-mandatory"
        @scroll="onCarouselScroll"
      >
        <div
          v-for="(img, idx) in images"
          :key="idx"
          class="flex-shrink-0 w-full h-full snap-start cursor-pointer"
          @click="emit('open-lightbox', idx)"
        >
          <img :src="img" :alt="`${name} ${idx + 1}`" class="w-full h-full object-cover" />
        </div>
      </div>
      <div v-if="images.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        <button
          v-for="(_, i) in images"
          :key="i"
          class="w-2 h-2 rounded-full transition-colors"
          :class="i === mobileIndex ? 'bg-white' : 'bg-white/40'"
          @click.stop="scrollToSlide(i)"
        />
      </div>
    </div>

    <!-- Desktop: hero left + grid right -->
    <div class="hidden lg:block">
      <div
        v-if="images.length <= 1"
        class="aspect-video rounded-2xl overflow-hidden bg-surface-muted cursor-pointer"
        @click="emit('open-lightbox', 0)"
      >
        <img v-if="images[0]" :src="images[0]" :alt="name" class="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300" />
      </div>

      <div v-else class="rounded-2xl overflow-hidden grid grid-cols-[5fr_1fr] gap-1" style="height: 420px">
        <!-- Hero -->
        <div class="overflow-hidden cursor-pointer group" @click="emit('open-lightbox', 0)">
          <img :src="images[0]" :alt="name" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        </div>
        <!-- Right column -->
        <div class="grid grid-rows-2 gap-1">
          <div class="overflow-hidden cursor-pointer group relative" @click="emit('open-lightbox', 1)">
            <img :src="images[1]" :alt="`${name} 2`" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
          </div>
          <div class="overflow-hidden relative bg-surface-muted">
            <template v-if="images[2]">
              <div class="cursor-pointer group w-full h-full" @click="emit('open-lightbox', 2)">
                <img :src="images[2]" :alt="`${name} 3`" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
              </div>
              <div
                v-if="images.length > 3"
                class="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                @click="emit('open-lightbox', 2)"
              >
                <span class="text-white text-sm font-semibold">+{{ images.length - 3 }} more</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-scroll::-webkit-scrollbar { display: none; }
.carousel-scroll { -ms-overflow-style: none; scrollbar-width: none; }
</style>
