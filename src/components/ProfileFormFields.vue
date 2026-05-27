<script setup lang="ts">
defineProps<{
  form: {
    profile_name: string
    legal_name_th: string
    legal_name_en: string
    line_id: string
    phone: string
    tax_id: string
    is_juristic: boolean
    is_vat_registered: boolean
    branch_number: string
    address_line1: string
    subdistrict: string
    district: string
    province: string
    postal_code: string
  }
  role: 'owner' | 'renter'
}>()
</script>

<template>
  <!-- Identity -->
  <div>
    <p class="text-xs font-bold text-brand uppercase tracking-wider mb-4">Identity</p>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">
          Name <span class="text-error">*</span>
        </label>
        <input v-model="form.profile_name" type="text" required
          placeholder="สมชาย หรือ บริษัท ABC จำกัด"
          class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
        />
        <p class="mt-1 text-xs text-text-muted">Can be your name, nickname, or company name — used for display and contact</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">
          Legal name (Thai) <span class="text-error">*</span>
          <span class="text-xs text-text-muted font-normal ml-1">— contracts & invoices</span>
        </label>
        <input v-model="form.legal_name_th" type="text" required
          placeholder="สมชาย มีสุข หรือ บริษัท ABC จำกัด"
          class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">
          Legal name (English)
          <span class="text-xs text-text-muted font-normal ml-1">— optional</span>
        </label>
        <input v-model="form.legal_name_en" type="text"
          placeholder="Somchai Meesuk or ABC Company Limited"
          class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">
          Line ID
          <span class="text-xs text-text-muted font-normal ml-1">— optional</span>
        </label>
        <input v-model="form.line_id" type="text" placeholder="@yourlineid"
          class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">
          Phone <span class="text-error">*</span>
        </label>
        <input v-model="form.phone" type="tel" required placeholder="081-234-5678"
          autocomplete="tel"
          class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
        />
      </div>
    </div>
  </div>

  <!-- Tax -->
  <div>
    <p class="text-xs font-bold text-brand uppercase tracking-wider mb-4">Tax</p>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-text-primary mb-2">Entity type</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" :value="false" v-model="form.is_juristic" class="accent-brand" />
            <span class="text-sm text-text-primary">Individual</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" :value="true" v-model="form.is_juristic" class="accent-brand" />
            <span class="text-sm text-text-primary">Company / Organization</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">
          Tax ID (13-digit)
          <span v-if="role === 'owner'" class="text-error">*</span>
          <span v-else class="text-xs text-text-muted font-normal ml-1">— optional</span>
        </label>
        <input v-model="form.tax_id" type="text" maxlength="13" placeholder="1234567890123"
          :required="role === 'owner'"
          class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
        />
      </div>

      <div v-if="form.is_juristic" class="space-y-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="form.is_vat_registered" class="accent-brand" />
          <span class="text-sm text-text-primary">VAT registered (จดทะเบียนภาษีมูลค่าเพิ่ม)</span>
        </label>
        <div v-if="form.is_vat_registered">
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Branch number
            <span class="text-xs text-text-muted font-normal ml-1">— 00000 = head office</span>
          </label>
          <input v-model="form.branch_number" type="text" maxlength="5" placeholder="00000"
            class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Address -->
  <div>
    <p class="text-xs font-bold text-brand uppercase tracking-wider mb-1">Address</p>
    <p class="text-xs text-text-muted mb-4">Appears on rental agreements and tax documents</p>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">
          Address line 1 <span class="text-error">*</span>
          <span class="text-xs text-text-muted font-normal ml-1">— บ้านเลขที่ / ถนน / ซอย</span>
        </label>
        <input v-model="form.address_line1" type="text" required
          class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Subdistrict <span class="text-error">*</span>
            <span class="text-xs text-text-muted font-normal ml-1">ตำบล/แขวง</span>
          </label>
          <input v-model="form.subdistrict" type="text" required
            class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            District <span class="text-error">*</span>
            <span class="text-xs text-text-muted font-normal ml-1">อำเภอ/เขต</span>
          </label>
          <input v-model="form.district" type="text" required
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
          <input v-model="form.province" type="text" required
            class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">
            Postal code <span class="text-error">*</span>
          </label>
          <input v-model="form.postal_code" type="text" required maxlength="5"
            class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
        </div>
      </div>
    </div>
  </div>
</template>
