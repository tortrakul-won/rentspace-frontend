export interface UserResponse {
  id: string
  email: string
  full_name: string
  phone?: string
  created_at: string
}

export interface ProfileResponse {
  id: string
  user_id: string
  role: 'owner' | 'renter'
  display_name: string
  tax_id?: string
  is_juristic: boolean
  is_vat_registered: boolean
  created_at: string
}

export interface AuthResponse {
  token: string
  user: UserResponse
  profile: ProfileResponse
}

export interface LoginResponse {
  token: string
  user: UserResponse
  profiles: ProfileResponse[]
  active_profile_id: string
}

export interface SwitchProfileResponse {
  token: string
  profile: ProfileResponse
}

export interface CurrentUserResponse {
  user: UserResponse
  profiles: ProfileResponse[]
  active_profile_id: string
}
