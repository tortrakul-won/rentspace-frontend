<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ProfileFormFields from '../components/ProfileFormFields.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { ApiError } from '../api/client'
import { updateProfile } from '../api/auth'

const router = useRouter()
const { activeProfile, profiles, token } = useAuth()
const { show } = useToast()
const { show: showLoading, hide: hideLoading } = useLoading()

const form = reactive({
  profile_name:     '',
  legal_name_th:    '',
  legal_name_en:    '',
  line_id:          '',
  phone:            '',
  tax_id:           '',
  is_juristic:      false,
  is_vat_registered: false,
  branch_number:    '',
  address_line1:    '',
  subdistrict:      '',
  district:         '',
  province:         '',
  postal_code:      '',
})

// Pre-fill from active profile
function syncForm() {
  const p = activeProfile.value
  if (!p) return
  form.profile_name      = p.profile_name
  form.legal_name_th     = p.legal_name_th
  form.legal_name_en     = p.legal_name_en ?? ''
  form.line_id           = p.line_id ?? ''
  form.phone             = p.phone
  form.tax_id            = p.tax_id ?? ''
  form.is_juristic       = p.is_juristic
  form.is_vat_registered = p.is_vat_registered
  form.branch_number     = p.branch_number ?? ''
  form.address_line1     = p.address_line1
  form.subdistrict       = p.subdistrict
  form.district          = p.district
  form.province          = p.province
  form.postal_code       = p.postal_code
}

syncForm()
watch(() => activeProfile.value?.id, syncForm)

const saving = reactive({ form: false })

async function handleSave() {
  if (!form.profile_name.trim() || !form.legal_name_th.trim() || !form.phone.trim() ||
      !form.address_line1.trim() || !form.subdistrict.trim() || !form.district.trim() ||
      !form.province.trim() || !form.postal_code.trim()) {
    show('Please fill in all required fields', 'error')
    return
  }
  if (activeProfile.value?.role === 'owner' && !form.tax_id.trim()) {
    show('Tax ID is required for owner profiles', 'error')
    return
  }
  showLoading()
  saving.form = true
  try {
    const updated = await updateProfile({
      ...form,
      branch_number: form.branch_number || '00000',
      tax_id: form.tax_id || undefined,
      legal_name_en: form.legal_name_en || undefined,
      line_id: form.line_id || undefined,
    }, token.value!)
    // Update reactive profiles array
    const idx = profiles.value.findIndex((p) => p.id === updated.id)
    if (idx !== -1) profiles.value[idx] = updated
    show('Profile updated', 'success')
    router.back()
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'Failed to save', 'error')
  } finally {
    saving.form = false
    hideLoading()
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <NavBar />

    <div class="max-w-lg mx-auto px-4 py-10">
      <button
        @click="router.back()"
        class="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div class="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 class="text-xl font-bold text-text-primary mb-1">Edit profile</h1>
        <p class="text-sm text-text-secondary mb-6">
          {{ activeProfile?.role === 'owner' ? 'Owner' : 'Renter' }} profile
        </p>

        <form @submit.prevent="handleSave" class="space-y-6">

          <ProfileFormFields :form="form" :role="activeProfile?.role ?? 'renter'" />

          <button
            type="submit"
            :disabled="saving.form"
            class="w-full bg-brand text-text-inverse py-2.5 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ saving.form ? 'Saving…' : 'Save changes' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
