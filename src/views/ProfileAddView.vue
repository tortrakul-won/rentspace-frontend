<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import ProfileFormFields from '../components/ProfileFormFields.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { ApiError } from '../api/client'
import { minDelay } from '../utils/minDelay'

const router = useRouter()
const route = useRoute()
const { addProfile, profiles } = useAuth()
const { show } = useToast()
const { show: showLoading, hide: hideLoading } = useLoading()

const role = computed(() => {
  const r = route.query.role
  return r === 'owner' || r === 'renter' ? r : null
})

const ROLE_META = {
  owner:  { label: 'Owner',  description: 'List and manage your spaces, accept bookings.' },
  renter: { label: 'Renter', description: 'Browse and book spaces for your needs.' },
}

const form = reactive({
  profile_name:      '',
  legal_name_th:     '',
  legal_name_en:     '',
  line_id:           '',
  phone:             '',
  tax_id:            '',
  is_juristic:       false,
  is_vat_registered: false,
  branch_number:     '',
  address_line1:     '',
  subdistrict:       '',
  district:          '',
  province:          '',
  postal_code:       '',
})

const saving = reactive({ form: false })

async function handleSave() {
  if (!role.value) return
  if (!form.profile_name.trim() || !form.legal_name_th.trim() || !form.phone.trim() ||
      !form.address_line1.trim() || !form.subdistrict.trim() || !form.district.trim() ||
      !form.province.trim() || !form.postal_code.trim()) {
    show('Please fill in all required fields', 'error')
    return
  }
  if (role.value === 'owner' && !form.tax_id.trim()) {
    show('Tax ID is required for owner profiles', 'error')
    return
  }
  showLoading()
  saving.form = true
  try {
    await minDelay(addProfile(role.value, {
      ...form,
      branch_number: form.branch_number || '00000',
      tax_id: form.tax_id || undefined,
      legal_name_en: form.legal_name_en || undefined,
      line_id: form.line_id || undefined,
    }), 600)
    show(`${ROLE_META[role.value].label} profile added!`, 'success')
    router.replace('/profiles')
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'Something went wrong', 'error')
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
        class="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div v-if="!role" class="text-center py-24">
        <p class="text-text-muted">Invalid role. <RouterLink to="/profiles" class="text-brand hover:text-brand-hover">Go back</RouterLink></p>
      </div>

      <div v-else-if="profiles.some((p) => p.role === role)" class="text-center py-24">
        <p class="text-text-muted">You already have a {{ ROLE_META[role].label.toLowerCase() }} profile. <RouterLink to="/profiles" class="text-brand hover:text-brand-hover">Go back</RouterLink></p>
      </div>

      <div v-else class="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 class="text-xl font-bold text-text-primary mb-1">Add {{ ROLE_META[role].label }} profile</h1>
        <p class="text-sm text-text-secondary mb-6">{{ ROLE_META[role].description }}</p>

        <form @submit.prevent="handleSave" class="space-y-6">

          <ProfileFormFields :form="form" :role="role" />

          <button
            type="submit"
            :disabled="saving.form"
            class="w-full bg-brand text-text-inverse py-2.5 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ saving.form ? 'Adding…' : `Add ${ROLE_META[role].label} profile` }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
