import { apiFetch } from './client'
import type {
  AuthResponse,
  LoginResponse,
  SwitchProfileResponse,
  CurrentUserResponse,
  ProfileResponse,
} from './types'

export interface ProfileFields {
  profile_name: string
  legal_name_th: string
  legal_name_en?: string
  phone: string
  address_line1: string
  subdistrict: string
  district: string
  province: string
  postal_code: string
  branch_number?: string
  tax_id?: string
  is_juristic?: boolean
  is_vat_registered?: boolean
  line_id?: string
}

export function register(body: {
  email: string
  password: string
  profile_role: string
} & ProfileFields): Promise<AuthResponse> {
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

export function addProfile(body: { role: string } & ProfileFields, token: string): Promise<ProfileResponse> {
  return apiFetch('/api/v1/auth/profiles', { method: 'POST', body: JSON.stringify(body) }, token)
}

export function updateProfile(body: Partial<ProfileFields> & { line_id?: string }, token: string): Promise<ProfileResponse> {
  return apiFetch('/api/v1/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }, token)
}
