<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{ images: string[] }>()
const emit = defineEmits<{ 'update:images': [value: string[]] }>()

const imagesRaw = ref(props.images.join('\n'))
const imageList = computed(() => imagesRaw.value.split('\n').map((u) => u.trim()).filter(Boolean))

watch(imagesRaw, (v) => {
  emit('update:images', v.split('\n').map((u) => u.trim()).filter(Boolean))
})
</script>

<template>
  <section class="bg-surface border border-border rounded-2xl p-6 space-y-5">
    <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Photos</h2>
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="block text-sm font-medium text-text-primary">
          Image URLs <span class="text-text-muted font-normal">(one per line)</span>
        </label>
        <span class="text-xs text-text-muted">{{ imageList.length }} image{{ imageList.length !== 1 ? 's' : '' }}</span>
      </div>
      <textarea
        v-model="imagesRaw"
        rows="3"
        spellcheck="false"
        placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
        class="w-full px-4 py-2.5 text-sm text-text-primary bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition resize-none font-mono"
      />
      <p class="text-xs text-text-muted mt-1.5">Add at least 1 photo. 16:9 ratio images look best.</p>
      <!-- TODO R2: when Cloudflare R2 upload is added, replace the textarea above with a
           file picker. This thumbnail strip stays as-is — just feed it uploaded object URLs. -->
      <div v-if="imageList.length" class="mt-3 flex flex-wrap gap-2">
        <div
          v-for="(url, idx) in imageList"
          :key="idx"
          class="relative w-24 h-16 rounded-xl overflow-hidden bg-surface-muted flex-shrink-0"
          :class="idx === 0 ? 'border-2 border-brand' : 'border border-border'"
        >
          <img
            :src="url"
            :alt="`Preview ${idx + 1}`"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).style.display='none'"
          />
          <span class="absolute bottom-0.5 right-1 text-white text-[10px] font-medium drop-shadow">{{ idx + 1 }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
