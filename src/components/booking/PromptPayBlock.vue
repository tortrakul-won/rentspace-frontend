<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import ConfirmModal from '../ConfirmModal.vue'
import { formatPrice } from '../../utils/format'
import type { PaymentConfig } from '../../api/config'

const props = defineProps<{
  totalPrice: number
  paymentConfig: PaymentConfig
  submitting: boolean
}>()

const emit = defineEmits<{ submit: [file: File] }>()

const slipFile = ref<File | null>(null)
const slipPreviewUrl = ref<string | null>(null)
const sizeError = ref(false)
const confirmSubmitSlip = ref(false)
const slipInput = ref<HTMLInputElement | null>(null)

function onSlipChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (slipPreviewUrl.value) URL.revokeObjectURL(slipPreviewUrl.value)
  const file = input.files?.[0] ?? null
  if (file && file.size > 5 * 1024 * 1024) {
    sizeError.value = true
    slipFile.value = null
    slipPreviewUrl.value = null
    if (slipInput.value) slipInput.value.value = ''
    return
  }
  sizeError.value = false
  slipFile.value = file
  slipPreviewUrl.value = file ? URL.createObjectURL(file) : null
}

function clearSlip() {
  if (slipPreviewUrl.value) URL.revokeObjectURL(slipPreviewUrl.value)
  slipFile.value = null
  slipPreviewUrl.value = null
  sizeError.value = false
  if (slipInput.value) slipInput.value.value = ''
}

onUnmounted(() => {
  if (slipPreviewUrl.value) URL.revokeObjectURL(slipPreviewUrl.value)
})
</script>

<template>
  <div class="bg-surface border border-border rounded-2xl p-6 mb-6 space-y-5">
    <h2 class="font-semibold text-text-primary text-center">PromptPay Transfer</h2>

    <!-- QR code -->
    <div class="flex justify-center">
      <img
        v-if="paymentConfig.promptpay_qr_url"
        :src="paymentConfig.promptpay_qr_url"
        alt="PromptPay QR"
        class="w-48 h-48 rounded-xl object-contain border border-border"
      />
      <div v-else class="w-48 h-48 rounded-xl bg-surface-muted border-2 border-dashed border-border flex items-center justify-center">
        <div class="text-center text-text-muted">
          <svg class="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <p class="text-xs">PromptPay QR</p>
          <p class="text-xs mt-1">(replace with real QR)</p>
        </div>
      </div>
    </div>

    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-text-muted">PromptPay number</span>
        <span class="font-mono font-medium text-text-primary">{{ paymentConfig.promptpay_number || '—' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-text-muted">Account name</span>
        <span class="text-text-primary">{{ paymentConfig.promptpay_name || '—' }}</span>
      </div>
      <div class="flex justify-between font-semibold border-t border-border pt-3 mt-3">
        <span class="text-text-primary">Amount to transfer</span>
        <span class="font-mono text-brand text-base">{{ formatPrice(totalPrice) }}</span>
      </div>
    </div>

    <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1">
      <p class="font-medium">After transferring:</p>
      <ul class="list-disc list-inside space-y-0.5 text-blue-600">
        <li>Take a screenshot or photo of your transfer slip</li>
        <li>Upload it below — our team verifies within 24 hours</li>
        <li>You'll receive a notification when confirmed</li>
      </ul>
    </div>

    <!-- Slip upload -->
    <div class="border-t border-border pt-5 space-y-3">
      <p class="text-sm font-medium text-text-primary">Upload Transfer Slip</p>
      <div class="relative">
        <label class="block w-full cursor-pointer">
          <input ref="slipInput" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" class="hidden" @change="onSlipChange" />
          <img
            v-if="slipPreviewUrl"
            :src="slipPreviewUrl"
            alt="Transfer slip preview"
            class="w-full rounded-xl object-contain border border-border"
          />
          <div v-else class="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-border rounded-xl hover:border-brand hover:bg-surface-subtle transition-colors">
            <svg class="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span class="text-xs text-text-muted">Click to select image (JPEG, PNG, WebP, HEIC)</span>
          </div>
        </label>
        <button
          v-if="slipPreviewUrl"
          @click.prevent="clearSlip"
          type="button"
          class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          aria-label="Remove slip"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p v-if="sizeError" class="text-xs text-red-600">File exceeds 5MB limit. Please choose a smaller image.</p>
      <button
        @click="confirmSubmitSlip = true"
        :disabled="!slipFile || submitting"
        class="w-full py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 bg-brand text-text-inverse hover:bg-brand-hover"
      >
        {{ submitting ? 'Uploading…' : 'Submit Slip for Review' }}
      </button>
    </div>
  </div>

  <ConfirmModal
    :open="confirmSubmitSlip"
    title="Submit payment slip?"
    message="This will submit your transfer slip for admin review. Make sure the slip shows the correct amount and transfer details."
    confirm-label="Yes, submit"
    @confirm="confirmSubmitSlip = false; emit('submit', slipFile!)"
    @cancel="confirmSubmitSlip = false"
  />
</template>
