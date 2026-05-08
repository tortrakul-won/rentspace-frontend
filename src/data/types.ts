export interface Space {
  id: string
  name: string
  description: string
  location: string
  category: string
  images: string[]
  hourlyRate: number
  dailyRate: number
  minHours: number
  capacity: number
  amenities: string[]
  owner: string
  rating: number
  reviewCount: number
}

export interface Booking {
  id: string
  spaceId: string
  spaceName: string
  spaceLocation: string
  renterName: string
  renterType: 'individual' | 'company'
  date: string
  startTime: string
  endTime: string
  hours: number
  totalPrice: number
  platformFee: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}
