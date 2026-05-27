<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { ApiError } from '../api/client'
import RoleBadge from '../components/RoleBadge.vue'
import { minDelay } from '../utils/minDelay'
import type { ProfileFields } from '../api/auth'

const router = useRouter()
const { profiles, activeProfile, switchProfile, addProfile } = useAuth()
const { show } = useToast()
const { show: showLoading, hide: hideLoading } = useLoading()

const ROLES = ['renter', 'owner'] as const
type Role = typeof ROLES[number]

const ROLE_META: Record<Role, { label: string; description: string; icon: string }> = {
  renter: {
    label: 'Renter',
    description: 'Browse and book spaces for your needs.',
    icon: '🔍',
  },
  owner: {
    label: 'Owner',
    description: 'List and manage your spaces, accept bookings.',
    icon: '🏢',
  },
}

function profileForRole(role: Role) {
  return profiles.value.find((p) => p.role === role) ?? null
}

const addingRole = ref<Role | null>(null)
const addError = ref('')
const newFields = reactive<ProfileFields & { is_juristic: boolean; is_vat_registered: boolean }>({
  profile_name: '',
  legal_name_th: '',
  legal_name_en: '',
  line_id: '',
  phone: '',
  address_line1: '',
  subdistrict: '',
  district: '',
  province: '',
  postal_code: '',
  branch_number: '',
  tax_id: '',
  is_juristic: false,
  is_vat_registered: false,
})

function startAdd(role: Role) {
  addingRole.value = role
  addError.value = ''
  Object.assign(newFields, {
    profile_name: '',
    legal_name_th: '',
    legal_name_en: '',
    line_id: '',
    phone: '',
    address_line1: '',
    subdistrict: '',
    district: '',
    province: '',
    postal_code: '',
    branch_number: '',
    tax_id: '',
    is_juristic: false,
    is_vat_registered: false,
  })
}

function cancelAdd() {
  addingRole.value = null
}

async function handleSwitch(profileId: string) {
  showLoading()
  await minDelay(switchProfile(profileId), 800)
  await router.push('/')
  hideLoading()
}


async function handleAdd(role: Role) {
  addError.value = ''
  if (!newFields.profile_name.trim() || !newFields.legal_name_th.trim() || !newFields.phone.trim() ||
      !newFields.address_line1.trim() || !newFields.subdistrict.trim() || !newFields.district.trim() ||
      !newFields.province.trim() || !newFields.postal_code.trim()) {
    addError.value = 'All required fields must be filled'
    return
  }
  if (role === 'owner' && !newFields.tax_id?.trim()) {
    addError.value = 'Tax ID is required for owner profiles'
    return
  }
  showLoading()
  try {
    await minDelay(addProfile(role, {
      ...newFields,
      branch_number: newFields.branch_number || '00000',
      tax_id: newFields.tax_id || undefined,
    }), 600)
    show(`${ROLE_META[role].label} profile added!`, 'success')
    addingRole.value = null
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'Something went wrong', 'error')
  } finally {
    hideLoading()
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle">
    <div class="max-w-lg mx-auto px-4 py-12">

      <div class="mb-8">
        <button
          @click="router.back()"
          class="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 class="text-2xl font-bold text-text-primary">Profiles</h1>
        <p class="text-sm text-text-secondary mt-1">Switch between roles or add a new profile.</p>
      </div>

      <div class="space-y-3">
        <div
          v-for="role in ROLES"
          :key="role"
          :class="[
            'bg-surface border rounded-2xl p-5 transition-colors',
            profileForRole(role)?.id === activeProfile?.id
              ? 'border-brand ring-1 ring-brand/20'
              : 'border-border',
          ]"
        >
          <div class="flex items-start gap-4">
            <span class="text-2xl mt-0.5">{{ ROLE_META[role].icon }}</span>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-base font-semibold text-text-primary">{{ ROLE_META[role].label }}</span>
                <RoleBadge :role="role" />
                <span
                  v-if="profileForRole(role)?.id === activeProfile?.id"
                  class="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-emerald-100 text-emerald-700"
                >
                  Active
                </span>
              </div>

              <p class="text-sm text-text-secondary mt-0.5">{{ ROLE_META[role].description }}</p>

              <p
                v-if="profileForRole(role) && profileForRole(role)!.id !== activeProfile?.id"
                class="text-xs text-text-muted mt-1"
              >
                {{ profileForRole(role)!.profile_name }}
              </p>
              <p
                v-else-if="profileForRole(role)?.id === activeProfile?.id"
                class="text-xs text-text-muted mt-1"
              >
                {{ activeProfile?.profile_name }}
              </p>
            </div>

            <!-- Action -->
            <div class="shrink-0">
              <span
                v-if="profileForRole(role)?.id === activeProfile?.id"
                class="text-xs text-text-muted"
              >
                Current
              </span>
              <button
                v-else-if="profileForRole(role)"
                @click="handleSwitch(profileForRole(role)!.id)"
                class="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
              >
                Switch
              </button>
              <button
                v-else-if="addingRole !== role"
                @click="startAdd(role)"
                class="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
              >
                Add
              </button>
            </div>
          </div>


          <!-- Inline add form -->
          <div v-if="addingRole === role" class="mt-4 pt-4 border-t border-border space-y-4">
            <p class="text-xs font-semibold text-text-muted uppercase tracking-wider">New {{ ROLE_META[role].label }} Profile</p>

            <div>
              <label class="block text-xs font-medium text-text-primary mb-1">
                Name <span class="text-error">*</span>
              </label>
              <input v-model="newFields.profile_name" type="text" placeholder="สมชาย หรือ บริษัท ABC จำกัด" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
              <p class="mt-1 text-xs text-text-muted">Can be your name, nickname, or company name — used for display and contact</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-text-primary mb-1">
                Legal name (Thai) <span class="text-error">*</span>
                <span class="text-text-muted font-normal ml-1">— on contracts & invoices</span>
              </label>
              <input v-model="newFields.legal_name_th" type="text" placeholder="สมชาย มีสุข" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
            </div>

            <div>
              <label class="block text-xs font-medium text-text-primary mb-1">
                Legal name (English)
                <span class="text-text-muted font-normal ml-1">— optional, for English documents</span>
              </label>
              <input v-model="newFields.legal_name_en" type="text" placeholder="Somchai Meesuk" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
            </div>

            <div>
              <label class="block text-xs font-medium text-text-primary mb-1">
                Line ID
                <span class="text-text-muted font-normal ml-1">— optional</span>
              </label>
              <input v-model="newFields.line_id" type="text" placeholder="@yourlineid" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
            </div>

            <div>
              <label class="block text-xs font-medium text-text-primary mb-1">Entity type</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" :value="false" v-model="newFields.is_juristic" class="accent-brand" />
                  <span class="text-sm text-text-primary">Individual</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" :value="true" v-model="newFields.is_juristic" class="accent-brand" />
                  <span class="text-sm text-text-primary">Company</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-text-primary mb-1">
                Phone <span class="text-error">*</span>
              </label>
              <input v-model="newFields.phone" type="tel" placeholder="081-234-5678" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
            </div>

            <div>
              <label class="block text-xs font-medium text-text-primary mb-1">
                Tax ID
                <span v-if="role === 'owner'" class="text-error">*</span>
                <span v-else class="text-text-muted font-normal ml-1">— optional</span>
                <span class="text-text-muted font-normal ml-1">— on tax documents</span>
              </label>
              <input v-model="newFields.tax_id" type="text" maxlength="13" placeholder="1234567890123" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
            </div>

            <div v-if="newFields.is_juristic">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="newFields.is_vat_registered" class="accent-brand" />
                <span class="text-sm text-text-primary">VAT registered</span>
              </label>
              <div v-if="newFields.is_vat_registered" class="mt-2">
                <label class="block text-xs font-medium text-text-primary mb-1">
                  Branch number <span class="text-text-muted font-normal">(on tax invoices)</span>
                </label>
                <input v-model="newFields.branch_number" type="text" maxlength="5" placeholder="00000" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Address — on contracts & invoices</label>
              <div class="space-y-2">
                <input v-model="newFields.address_line1" type="text" placeholder="Address line 1 (บ้านเลขที่/ถนน/ซอย) *" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="newFields.subdistrict" type="text" placeholder="Subdistrict (ตำบล/แขวง) *" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
                  <input v-model="newFields.district" type="text" placeholder="District (อำเภอ/เขต) *" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="newFields.province" type="text" placeholder="Province (จังหวัด) *" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
                  <input v-model="newFields.postal_code" type="text" maxlength="5" placeholder="Postal code *" class="w-full px-3 py-2 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" />
                </div>
              </div>
            </div>

            <p v-if="addError" class="text-xs text-error">{{ addError }}</p>
            <div class="flex gap-2">
              <button
                @click="handleAdd(role)"
                class="px-4 py-2 bg-brand text-text-inverse text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors"
              >
                Add profile
              </button>
              <button
                @click="cancelAdd"
                class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
