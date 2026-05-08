import { ref, computed } from 'vue'
import * as authApi from '../api/auth'
import type { UserResponse, ProfileResponse } from '../api/types'

// Module-level singleton — all components share the same reactive state
const token = ref<string | null>(localStorage.getItem('rs_token'))
const user = ref<UserResponse | null>(JSON.parse(localStorage.getItem('rs_user') ?? 'null'))
const profiles = ref<ProfileResponse[]>(JSON.parse(localStorage.getItem('rs_profiles') ?? '[]'))
const activeProfileId = ref<string | null>(localStorage.getItem('rs_active_profile'))

function persist() {
  token.value
    ? localStorage.setItem('rs_token', token.value)
    : localStorage.removeItem('rs_token')
  user.value
    ? localStorage.setItem('rs_user', JSON.stringify(user.value))
    : localStorage.removeItem('rs_user')
  localStorage.setItem('rs_profiles', JSON.stringify(profiles.value))
  activeProfileId.value
    ? localStorage.setItem('rs_active_profile', activeProfileId.value)
    : localStorage.removeItem('rs_active_profile')
}

export function useAuth() {
  const isAuthenticated = computed(() => token.value !== null)
  const activeProfile = computed(
    () => profiles.value.find((p) => p.id === activeProfileId.value) ?? null,
  )

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    token.value = res.token
    user.value = res.user
    profiles.value = res.profiles
    activeProfileId.value = res.active_profile_id
    persist()
  }

  async function register(
    email: string,
    password: string,
    fullName: string,
    displayName: string,
    profileRole: 'owner' | 'renter',
    phone?: string,
  ) {
    const res = await authApi.register({
      email,
      password,
      full_name: fullName,
      display_name: displayName,
      profile_role: profileRole,
      ...(phone ? { phone } : {}),
    })
    token.value = res.token
    user.value = res.user
    profiles.value = [res.profile]
    activeProfileId.value = res.profile.id
    persist()
  }

  async function switchProfile(profileId: string) {
    if (!token.value) return
    const res = await authApi.switchProfile(profileId, token.value)
    token.value = res.token
    activeProfileId.value = res.profile.id
    const idx = profiles.value.findIndex((p) => p.id === res.profile.id)
    if (idx !== -1) profiles.value[idx] = res.profile
    persist()
  }

  function logout() {
    token.value = null
    user.value = null
    profiles.value = []
    activeProfileId.value = null
    persist()
  }

  return {
    token,
    user,
    profiles,
    activeProfileId,
    isAuthenticated,
    activeProfile,
    login,
    register,
    switchProfile,
    logout,
  }
}
