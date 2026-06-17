<script setup lang="ts">
import { ref } from 'vue'
import { downloadDocument } from '../../api/bookings'
import { useToast } from '../../composables/useToast'

interface DocButton {
  slug: string
  labelTH: string
  labelEN: string
}

const props = defineProps<{
  bookingId: string
  token: string
  docs: DocButton[]
}>()

const { show } = useToast()
const downloading = ref<Record<string, boolean>>({})

async function download(slug: string) {
  if (downloading.value[slug]) return
  downloading.value[slug] = true
  try {
    await downloadDocument(props.bookingId, slug, props.token)
  } catch (e: any) {
    if (e?.status === 404) {
      show('Document not available for this booking', 'error')
    } else {
      show(e?.message ?? 'Failed to download document', 'error')
    }
  } finally {
    downloading.value[slug] = false
  }
}
</script>

<template>
  <div class="bg-surface border border-border rounded-2xl p-4 mb-4">
    <p class="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">เอกสาร / Documents</p>
    <div class="flex flex-col gap-2">
      <button
        v-for="doc in docs"
        :key="doc.slug"
        @click="download(doc.slug)"
        :disabled="!!downloading[doc.slug]"
        class="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border bg-surface-subtle hover:bg-surface-hover transition-colors disabled:opacity-50 text-left"
      >
        <span class="flex items-center gap-3">
          <!-- PDF icon -->
          <svg class="w-5 h-5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span>
            <span class="block text-sm font-medium text-text-primary">{{ doc.labelTH }}</span>
            <span class="block text-xs text-text-muted">{{ doc.labelEN }}</span>
          </span>
        </span>
        <!-- Download spinner / icon -->
        <span class="shrink-0 ml-3">
          <svg v-if="downloading[doc.slug]" class="w-4 h-4 text-text-muted animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <svg v-else class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>
