<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { ApiError } from '../api/client'

const router = useRouter()
const { user, updateUser } = useAuth()
const { show } = useToast()

// Full name editing
const editingName = ref(false)
const nameInput = ref('')
const nameSaving = ref(false)

function startEditName() {
  nameInput.value = user.value?.full_name ?? ''
  editingName.value = true
}
function cancelEditName() { editingName.value = false }

async function saveName() {
  const trimmed = nameInput.value.trim()
  if (!trimmed) return
  nameSaving.value = true
  try {
    await updateUser({ full_name: trimmed })
    show('Name updated', 'success')
    editingName.value = false
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'Failed to update name', 'error')
  } finally {
    nameSaving.value = false
  }
}

// Phone editing
const editingPhone = ref(false)
const phoneInput = ref('')
const phoneSaving = ref(false)

function startEditPhone() {
  phoneInput.value = user.value?.phone ?? ''
  editingPhone.value = true
}
function cancelEditPhone() { editingPhone.value = false }

async function savePhone() {
  phoneSaving.value = true
  try {
    await updateUser({ phone: phoneInput.value.trim() })
    show('Phone updated', 'success')
    editingPhone.value = false
  } catch (err) {
    show(err instanceof ApiError ? err.message : 'Failed to update phone', 'error')
  } finally {
    phoneSaving.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
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
        <h1 class="text-2xl font-bold text-text-primary">Account</h1>
        <p class="text-sm text-text-secondary mt-1">Your personal information.</p>
      </div>

      <div class="bg-surface border border-border rounded-2xl divide-y divide-border">

        <!-- Full name -->
        <div class="p-5">
          <div v-if="!editingName" class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-medium text-text-secondary">Full name</p>
              <p class="text-sm text-text-primary mt-0.5">{{ user?.full_name || '—' }}</p>
            </div>
            <button
              @click="startEditName"
              class="text-xs font-medium text-brand hover:text-brand-hover transition-colors shrink-0"
            >Edit</button>
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-text-primary mb-1.5">Full name</label>
            <input
              v-model="nameInput"
              type="text"
              autofocus
              class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              @keydown.enter="saveName"
              @keydown.escape="cancelEditName"
            />
            <div class="flex gap-2 mt-3">
              <button
                @click="saveName"
                :disabled="nameSaving"
                class="px-4 py-2 bg-brand text-text-inverse text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50"
              >{{ nameSaving ? 'Saving…' : 'Save' }}</button>
              <button
                @click="cancelEditName"
                class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >Cancel</button>
            </div>
          </div>
        </div>

        <!-- Email (read-only) -->
        <div class="p-5">
          <p class="text-xs font-medium text-text-secondary">Email</p>
          <p class="text-sm text-text-primary mt-0.5">{{ user?.email }}</p>
        </div>

        <!-- Phone -->
        <div class="p-5">
          <div v-if="!editingPhone" class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-medium text-text-secondary">Phone</p>
              <p class="text-sm mt-0.5" :class="user?.phone ? 'text-text-primary' : 'text-text-muted italic'">
                {{ user?.phone || 'Not set' }}
              </p>
            </div>
            <button
              @click="startEditPhone"
              class="text-xs font-medium text-brand hover:text-brand-hover transition-colors shrink-0"
            >{{ user?.phone ? 'Edit' : 'Add' }}</button>
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-text-primary mb-1.5">Phone</label>
            <input
              v-model="phoneInput"
              type="tel"
              placeholder="0812345678"
              autofocus
              class="w-full px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              @keydown.enter="savePhone"
              @keydown.escape="cancelEditPhone"
            />
            <div class="flex gap-2 mt-3">
              <button
                @click="savePhone"
                :disabled="phoneSaving"
                class="px-4 py-2 bg-brand text-text-inverse text-sm font-medium rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50"
              >{{ phoneSaving ? 'Saving…' : 'Save' }}</button>
              <button
                @click="cancelEditPhone"
                class="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >Cancel</button>
            </div>
          </div>
        </div>

        <!-- Member since -->
        <div class="p-5">
          <p class="text-xs font-medium text-text-secondary">Member since</p>
          <p class="text-sm text-text-primary mt-0.5">{{ user?.created_at ? formatDate(user.created_at) : '—' }}</p>
        </div>

      </div>
    </div>
  </div>
</template>
