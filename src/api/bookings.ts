import { apiFetch } from './client'
import type { AdminBookingDetailResponse, OwnerBookingDetailResponse, BookingResponse, BookingStatus, CreateBookingRequest } from './types'

export function createBooking(data: CreateBookingRequest, token: string): Promise<BookingResponse> {
  return apiFetch('/api/v1/bookings', { method: 'POST', body: JSON.stringify(data) }, token)
}

export function getBooking(id: string, token: string): Promise<BookingResponse> {
  return apiFetch(`/api/v1/bookings/${id}`, {}, token)
}

export function listMyBookings(token: string): Promise<BookingResponse[]> {
  return apiFetch('/api/v1/bookings/mine', {}, token)
}

export function listOwnerBookings(token: string): Promise<BookingResponse[]> {
  return apiFetch('/api/v1/bookings/owner', {}, token)
}

export function updateBookingStatus(id: string, status: BookingStatus, token: string): Promise<BookingResponse> {
  return apiFetch(`/api/v1/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token)
}

export function listSpaceBookings(spaceId: string, token: string): Promise<BookingResponse[]> {
  return apiFetch(`/api/v1/spaces/${spaceId}/bookings`, {}, token)
}

export function ownerGetBookingDetail(id: string, token: string): Promise<OwnerBookingDetailResponse> {
  return apiFetch(`/api/v1/bookings/owner/${id}`, {}, token)
}

export function adminListPaymentPending(token: string): Promise<BookingResponse[]> {
  return apiFetch('/api/v1/admin/bookings', {}, token)
}

export function adminGetBookingDetail(id: string, token: string): Promise<AdminBookingDetailResponse> {
  return apiFetch(`/api/v1/admin/bookings/${id}`, {}, token)
}

export function adminApproveBooking(id: string, token: string): Promise<BookingResponse> {
  return apiFetch(`/api/v1/admin/bookings/${id}/approve`, { method: 'POST' }, token)
}

export function adminRejectRetryBooking(id: string, token: string): Promise<BookingResponse> {
  return apiFetch(`/api/v1/admin/bookings/${id}/reject-retry`, { method: 'POST' }, token)
}

export function adminRejectPermanentBooking(id: string, token: string): Promise<BookingResponse> {
  return apiFetch(`/api/v1/admin/bookings/${id}/reject-permanent`, { method: 'POST' }, token)
}
