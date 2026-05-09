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

export interface SpaceResponse {
  id: string
  owner_id: string
  name: string
  description: string
  location: string
  category: string
  images: string[]
  hourly_rate: number
  daily_rate: number
  min_hours: number
  capacity: number
  amenities: string[]
  weekend_surcharge_pct: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AvailabilitySlot {
  day_of_week: number
  open_time: string
  close_time: string
}

export interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface SpaceFormData {
  name: string
  description: string
  location: string
  category: string
  images: string[]
  hourly_rate: number
  daily_rate: number
  min_hours: number
  capacity: number
  amenities: string[]
  weekend_surcharge_pct: number
}
