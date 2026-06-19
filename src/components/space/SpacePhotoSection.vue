<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { presignPhotoUpload, deletePhoto } from '../../api/bookings'
import { useAuth } from '../../composables/useAuth'

const props = defineProps<{ images: string[], submitted?: boolean }>()
const emit = defineEmits<{ 'update:images': [value: string[]] }>()

const { token } = useAuth()
const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// Maps public URL → R2 file key for photos uploaded in this session only
const sessionKeys = new Map<string, string>()

const MAX_PHOTOS = 6
const MAX_BYTES = 5 * 1024 * 1024

async function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return
  if (input.value) input.value = ''

  const remaining = MAX_PHOTOS - props.images.length
  if (remaining <= 0) {
    uploadError.value = `Maximum ${MAX_PHOTOS} photos allowed`
    return
  }

  const selected = files.slice(0, remaining)
  uploadError.value = ''

  const oversized = selected.find(f => f.size > MAX_BYTES)
  if (oversized) {
    uploadError.value = `"${oversized.name}" exceeds 5MB limit`
    return
  }

  uploading.value = true
  try {
    const urls: string[] = []
    for (const file of selected) {
      const presign = await presignPhotoUpload(file.size, file.type, token.value!)
      const res = await fetch(presign.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!res.ok) throw new Error(`Upload failed for ${file.name}`)
      sessionKeys.set(presign.public_url, presign.file_key)
      urls.push(presign.public_url)
    }
    emit('update:images', [...props.images, ...urls])
  } catch (e: any) {
    uploadError.value = e?.message ?? 'Upload failed'
  } finally {
    uploading.value = false
  }
}

async function removeImage(idx: number) {
  const url = props.images[idx]
  const key = sessionKeys.get(url)
  if (key && token.value) {
    sessionKeys.delete(url)
    deletePhoto(key, token.value).catch(() => {})
  }
  emit('update:images', props.images.filter((_, i) => i !== idx))
}

// On unmount without submit: delete remaining session-uploaded photos that were never saved
onUnmounted(() => {
  if (props.submitted) return
  if (!token.value) return
  for (const [, key] of sessionKeys) {
    deletePhoto(key, token.value).catch(() => {})
  }
})
</script>

<template>
  <section class="bg-surface border border-border rounded-2xl p-6 space-y-5">
    <h2 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Photos</h2>

    <!-- Thumbnails -->
    <div v-if="images.length" class="flex flex-wrap gap-2">
      <div
        v-for="(url, idx) in images"
        :key="url"
        class="relative w-24 h-16 rounded-xl overflow-hidden bg-surface-muted flex-shrink-0"
        :class="idx === 0 ? 'border-2 border-brand' : 'border border-border'"
      >
        <img :src="url" :alt="`Photo ${idx + 1}`" class="w-full h-full object-cover" />
        <button
          type="button"
          @click="removeImage(idx)"
          class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          aria-label="Remove photo"
        >
          <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span class="absolute bottom-0.5 right-1 text-white text-[10px] font-medium drop-shadow">{{ idx + 1 }}</span>
      </div>
    </div>

    <!-- Upload button -->
    <div v-if="images.length < 6">
      <label class="block cursor-pointer">
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          class="hidden"
          @change="onFilesSelected"
          :disabled="uploading"
        />
        <div
          class="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed rounded-xl transition-colors"
          :class="uploading ? 'border-border opacity-60' : 'border-border hover:border-brand hover:bg-surface-subtle'"
        >
          <svg v-if="!uploading" class="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <svg v-else class="w-5 h-5 text-brand animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <span class="text-xs text-text-muted">
            {{ uploading ? 'Uploading…' : `Add photos (up to ${6 - images.length} more)` }}
          </span>
        </div>
      </label>
    </div>

    <p v-if="uploadError" class="text-xs text-red-600">{{ uploadError }}</p>
    <p class="text-xs text-text-muted">Max 6 photos · 5MB each · JPEG, PNG, WebP, HEIC · 16:9 looks best</p>
  </section>
</template>
