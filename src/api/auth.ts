import { apiFetch } from './client'
import type {
  AuthResponse,
  LoginResponse,
  SwitchProfileResponse,
  CurrentUserResponse,
} from './types'

export function register(body: {
  email: string
  password: string
  full_name: string
  phone?: string
  profile_role: string
  display_name: string
}): Promise<AuthResponse> {
  return apiFetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) })
}

export function login(body: {
  email: string
  password: string
}): Promise<LoginResponse> {
  return apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) })
}

export function switchProfile(profileId: string, token: string): Promise<SwitchProfileResponse> {
  return apiFetch(
    '/api/v1/auth/switch-profile',
    { method: 'POST', body: JSON.stringify({ profile_id: profileId }) },
    token,
  )
}

export function currentUser(token: string): Promise<CurrentUserResponse> {
  return apiFetch('/api/v1/auth/me', {}, token)
}

export function addProfile(body: { role: string; display_name: string }, token: string): Promise<import('./types').ProfileResponse> {
  return apiFetch('/api/v1/auth/profiles', { method: 'POST', body: JSON.stringify(body) }, token)
}
