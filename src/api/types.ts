export interface UserResponse {
  id: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface ProfileResponse {
  id: string
  user_id: string
  role: 'owner' | 'renter'
  profile_name: string
  legal_name_th: string
  legal_name_en: string
  phone: string
  address_line1: string
  subdistrict: string
  district: string
  province: string
  postal_code: string
  branch_number: string
  tax_id?: string
  is_juristic: boolean
  is_vat_registered: boolean
  line_id?: string
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
  min_minutes: number
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

export interface BlockedRange {
  from: string
  to: string
  type: 'booking' | 'block'
}

export interface DayAvailability {
  open: boolean
  open_time?: string
  close_time?: string
  blocked_ranges: BlockedRange[]
}

export type MergedAvailability = Record<string, DayAvailability>

export interface Page<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export type BookingStatus = 'pending' | 'payment_pending' | 'awaiting_payment' | 'payment_review' | 'confirmed' | 'completed' | 'cancelled'

export interface BookingResponse {
  id: string
  ref_code: string
  space_id: string
  renter_id: string
  start_time: string
  end_time: string
  total_price: number
  platform_fee: number
  status: BookingStatus
  cancel_reason?: string | null
  refund_status?: string | null
  process_expires_at?: string | null
  slip_url?: string | null
  created_at: string
  updated_at: string
  // enriched fields (present on list endpoints, absent on single GET)
  space_name?: string
  space_location?: string
  space_images?: string[]
  renter_name?: string
}

export interface RenterBookingDetailResponse {
  id: string
  ref_code: string
  space_id: string
  renter_id: string
  start_time: string
  end_time: string
  total_price: number
  platform_fee: number
  status: BookingStatus
  cancel_reason?: string | null
  refund_status?: string | null
  process_expires_at?: string | null
  slip_url?: string | null
  created_at: string
  updated_at: string
  space_name: string
  space_location: string
  space_images: string[]
  owner_profile_name: string
  owner_phone: string
  owner_line_id: string
}

export interface AdminBookingDetailResponse {
  id: string
  ref_code: string
  space_id: string
  renter_id: string
  start_time: string
  end_time: string
  total_price: number
  platform_fee: number
  status: BookingStatus
  cancel_reason?: string | null
  refund_status?: string | null
  process_expires_at?: string | null
  slip_url?: string | null
  created_at: string
  updated_at: string
  space_name: string
  space_location: string
  space_images: string[]
  renter_profile_name: string
  renter_phone: string
  renter_is_juristic: boolean
  owner_profile_name: string
}

export interface OwnerBookingDetailResponse {
  id: string
  ref_code: string
  space_id: string
  renter_id: string
  start_time: string
  end_time: string
  total_price: number
  platform_fee: number
  status: BookingStatus
  cancel_reason?: string | null
  created_at: string
  space_name: string
  space_location: string
  space_images: string[]
  renter_profile_name: string
  renter_phone: string
  renter_is_juristic: boolean
}

export interface CreateBookingRequest {
  space_id: string
  start_time: string
  end_time: string
}

export interface NotificationResponse {
  id: string
  profile_id: string
  type: string
  payload: Record<string, string>
  booking_id: string | null
  read_at: string | null
  superseded_at: string | null
  created_at: string
}

export interface SpaceFormData {
  name: string
  description: string
  location: string
  category: string
  images: string[]
  hourly_rate: number
  daily_rate: number
  min_minutes: number
  capacity: number
  amenities: string[]
  weekend_surcharge_pct: number
}
