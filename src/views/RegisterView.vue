<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { useLoading } from '../composables/useLoading'
import { ApiError } from '../api/client'
import AppLogo from '../components/AppLogo.vue'

const router = useRouter()
const { register } = useAuth()
const { show } = useToast()
const { show: showLoading, hide: hideLoading } = useLoading()

// Account fields
const email = ref('')
const password = ref('')
const role = ref<'renter' | 'owner'>('renter')
const passwordTouched = ref(false)
const showPassword = ref(false)

// Profile fields
const profileName = ref('')
const legalNameTh = ref('')
const legalNameEn = ref('')
const lineId = ref('')
const phone = ref('')
const isJuristic = ref(false)
const isVatRegistered = ref(false)
const taxId = ref('')
const branchNumber = ref('')

// Address fields
const addressLine1 = ref('')
const subdistrict = ref('')
const district = ref('')
const province = ref('')
const postalCode = ref('')

const rules = computed(() => ({
  length:    password.value.length >= 8,
  uppercase: /[A-Z]/.test(password.value),
  lowercase: /[a-z]/.test(password.value),
  number:    /[0-9]/.test(password.value),
  special:   /[^A-Za-z0-9]/.test(password.value),
}))

const passwordValid = computed(() => Object.values(rules.value).every(Boolean))

async function submit() {
  if (!passwordValid.value) return
  showLoading()
  try {
    await register(email.value, password.value, role.value, {
      profile_name: profileName.value,
      legal_name_th: legalNameTh.value,
      legal_name_en: legalNameEn.value || undefined,
      line_id: lineId.value || undefined,
      phone: phone.value,
      address_line1: addressLine1.value,
      subdistrict: subdistrict.value,
      district: district.value,
      province: province.value,
      postal_code: postalCode.value,
      branch_number: branchNumber.value || '00000',
      tax_id: taxId.value || undefined,
      is_juristic: isJuristic.value,
      is_vat_registered: isVatRegistered.value,
    })
    show('Account created! Welcome to RentSpace.', 'success')
    await router.push('/')
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'Something went wrong', 'error')
  } finally {
    hideLoading()
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md">

      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <AppLogo size="md" />
      </div>

      <!-- Card -->
      <div class="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 class="text-xl font-bold text-text-primary mb-1">Create your account</h1>
        <p class="text-sm text-text-secondary mb-6">Start renting or listing spaces today</p>

        <form @submit.prevent="submit" class="space-y-5">

          <!-- Role picker -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">I want to…</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="role = 'renter'"
                :class="[
                  'flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-colors',
                  role === 'renter'
                    ? 'border-brand bg-brand-light'
                    : 'border-border bg-surface-subtle hover:bg-surface-hover',
                ]"
              >
                <span class="text-base">🔍</span>
                <span :class="['text-sm font-medium', role === 'renter' ? 'text-brand' : 'text-text-primary']">
                  Rent spaces
                </span>
                <span class="text-xs text-text-muted leading-tight">Browse and book</span>
              </button>
              <button
                type="button"
                @click="role = 'owner'"
                :class="[
                  'flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-colors',
                  role === 'owner'
                    ? 'border-brand bg-brand-light'
                    : 'border-border bg-surface-subtle hover:bg-surface-hover',
                ]"
              >
                <span class="text-base">🏢</span>
                <span :class="['text-sm font-medium', role === 'owner' ? 'text-brand' : 'text-text-primary']">
                  List a space
                </span>
                <span class="text-xs text-text-muted leading-tight">Earn from your space</span>
              </button>
            </div>
            <p class="mt-2 text-xs text-text-muted">
              You can add a second profile for the other role after signing up.
            </p>
          </div>

          <!-- Divider: Account -->
          <div class="pt-1">
            <p class="text-xs font-bold text-brand uppercase tracking-wider mb-3">Account</p>

            <div class="space-y-4">
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">
                  Email <span class="text-error">*</span>
                </label>
                <input
                  v-model="email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="you@example.com"
                  class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>

              <!-- Password -->
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">
                  Password <span class="text-error">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    autocomplete="new-password"
                    placeholder="Create a strong password"
                    @input="passwordTouched = true"
                    :class="[
                      'w-full px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted border rounded-xl outline-none focus:ring-2 transition-colors',
                      passwordTouched && !passwordValid
                        ? 'border-error focus:ring-error/20 focus:border-error'
                        : 'border-border focus:ring-brand/20 focus:border-brand',
                    ]"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <svg v-if="showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
                <ul class="mt-2.5 space-y-1">
                  <li
                    v-for="(met, key) in rules"
                    :key="key"
                    :class="['flex items-center gap-1.5 text-xs transition-colors', met ? 'text-success' : 'text-text-muted']"
                  >
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path v-if="met" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" d="M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0" />
                    </svg>
                    <span>{{
                      key === 'length'    ? 'At least 8 characters' :
                      key === 'uppercase' ? 'Uppercase letter (A–Z)' :
                      key === 'lowercase' ? 'Lowercase letter (a–z)' :
                      key === 'number'    ? 'Number (0–9)' :
                                           'Special character (!@#$…)'
                    }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Divider: Profile -->
          <div class="pt-1 border-t border-border">
            <p class="text-xs font-bold text-brand uppercase tracking-wider mb-3 mt-3">Profile</p>

            <div class="space-y-4">
              <!-- Profile name -->
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">
                  Name <span class="text-error">*</span>
                </label>
                <input
                  v-model="profileName"
                  type="text"
                  required
                  placeholder="สมชาย หรือ บริษัท ABC จำกัด"
                  class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
                <p class="mt-1 text-xs text-text-muted">Can be your name, nickname, or company name — used for display and contact</p>
              </div>

              <!-- Legal name (Thai) -->
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">
                  Legal name (Thai) <span class="text-error">*</span>
                  <span class="text-xs text-text-muted font-normal ml-1">— appears on contracts & invoices</span>
                </label>
                <input
                  v-model="legalNameTh"
                  type="text"
                  required
                  placeholder="สมชาย มีสุข หรือ บริษัท ABC จำกัด"
                  class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>

              <!-- Legal name (English) -->
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">
                  Legal name (English)
                  <span class="text-xs text-text-muted font-normal ml-1">— optional, for English documents</span>
                </label>
                <input
                  v-model="legalNameEn"
                  type="text"
                  placeholder="Somchai Meesuk or ABC Company Limited"
                  class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>

              <!-- Line ID -->
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">
                  Line ID
                  <span class="text-xs text-text-muted font-normal ml-1">— optional, for contact</span>
                </label>
                <input
                  v-model="lineId"
                  type="text"
                  placeholder="@yourlineid"
                  class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>

              <!-- Entity type -->
              <div>
                <label class="block text-sm font-medium text-text-primary mb-2">Entity type</label>
                <div class="flex gap-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" :value="false" v-model="isJuristic" class="accent-brand" />
                    <span class="text-sm text-text-primary">Individual</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" :value="true" v-model="isJuristic" class="accent-brand" />
                    <span class="text-sm text-text-primary">Company / Organization</span>
                  </label>
                </div>
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">
                  Phone number <span class="text-error">*</span>
                </label>
                <input
                  v-model="phone"
                  type="tel"
                  required
                  autocomplete="tel"
                  placeholder="081-234-5678"
                  class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>

              <!-- Tax ID -->
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">
                  Tax ID (13-digit)
                  <span v-if="role === 'owner'" class="text-error">*</span>
                  <span v-else class="text-text-muted font-normal ml-1">— optional, for tax invoices</span>
                  <span class="text-xs text-text-muted font-normal ml-1">— appears on tax documents</span>
                </label>
                <input
                  v-model="taxId"
                  type="text"
                  :required="role === 'owner'"
                  maxlength="13"
                  placeholder="1234567890123"
                  class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>

              <!-- VAT registered (company only) -->
              <div v-if="isJuristic" class="space-y-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="isVatRegistered" class="accent-brand rounded" />
                  <span class="text-sm text-text-primary">VAT registered (จดทะเบียนภาษีมูลค่าเพิ่ม)</span>
                </label>

                <!-- Branch number (VAT only) -->
                <div v-if="isVatRegistered">
                  <label class="block text-sm font-medium text-text-primary mb-1.5">
                    Branch number
                    <span class="text-xs text-text-muted font-normal ml-1">— appears on tax invoices (00000 = head office)</span>
                  </label>
                  <input
                    v-model="branchNumber"
                    type="text"
                    maxlength="5"
                    placeholder="00000"
                    class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Divider: Address -->
          <div class="pt-1 border-t border-border">
            <p class="text-xs font-bold text-brand uppercase tracking-wider mb-1 mt-3">Address</p>
            <p class="text-xs text-text-muted mb-3">Appears on rental agreements and tax documents</p>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-text-primary mb-1.5">
                  Address line 1 <span class="text-error">*</span>
                  <span class="text-xs text-text-muted font-normal ml-1">— บ้านเลขที่ / ถนน / ซอย</span>
                </label>
                <input
                  v-model="addressLine1"
                  type="text"
                  required
                  placeholder="123/4 ถนนสุขุมวิท"
                  class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-text-primary mb-1.5">
                    Subdistrict <span class="text-error">*</span>
                    <span class="text-xs text-text-muted font-normal ml-1">ตำบล/แขวง</span>
                  </label>
                  <input
                    v-model="subdistrict"
                    type="text"
                    required
                    placeholder="คลองเตย"
                    class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-primary mb-1.5">
                    District <span class="text-error">*</span>
                    <span class="text-xs text-text-muted font-normal ml-1">อำเภอ/เขต</span>
                  </label>
                  <input
                    v-model="district"
                    type="text"
                    required
                    placeholder="คลองเตย"
                    class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-text-primary mb-1.5">
                    Province <span class="text-error">*</span>
                    <span class="text-xs text-text-muted font-normal ml-1">จังหวัด</span>
                  </label>
                  <input
                    v-model="province"
                    type="text"
                    required
                    placeholder="กรุงเทพมหานคร"
                    class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-primary mb-1.5">
                    Postal code <span class="text-error">*</span>
                  </label>
                  <input
                    v-model="postalCode"
                    type="text"
                    required
                    maxlength="5"
                    placeholder="10110"
                    class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="passwordTouched && !passwordValid"
            class="w-full bg-brand text-text-inverse py-2.5 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            Create account
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-text-secondary mt-5">
        Already have an account?
        <RouterLink to="/login" class="text-brand hover:text-brand-hover font-medium transition-colors">
          Sign in
        </RouterLink>
      </p>

    </div>
  </div>
</template>
