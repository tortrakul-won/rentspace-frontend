import { apiFetch } from './client'
import type { SpaceResponse, AvailabilitySlot, SpaceFormData, Page } from './types'

export function listSpaces(
  page = 1,
  limit = 20,
  category?: string,
  q?: string,
  token?: string | null,
): Promise<Page<SpaceResponse>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (category) params.set('category', category)
  if (q) params.set('q', q)
  return apiFetch(`/api/v1/spaces?${params}`, {}, token)
}

export function getSpace(id: string): Promise<SpaceResponse> {
  return apiFetch(`/api/v1/spaces/${id}`)
}

export function listMySpaces(token: string, page = 1, limit = 20): Promise<Page<SpaceResponse>> {
  return apiFetch(`/api/v1/spaces/mine?page=${page}&limit=${limit}`, {}, token)
}

export function createSpace(data: SpaceFormData, token: string): Promise<SpaceResponse> {
  return apiFetch('/api/v1/spaces', { method: 'POST', body: JSON.stringify(data) }, token)
}

export function updateSpace(id: string, data: SpaceFormData, token: string): Promise<SpaceResponse> {
  return apiFetch(`/api/v1/spaces/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token)
}

export function deactivateSpace(id: string, token: string): Promise<SpaceResponse> {
  return apiFetch(`/api/v1/spaces/${id}`, { method: 'DELETE' }, token)
}

export function reactivateSpace(id: string, token: string): Promise<SpaceResponse> {
  return apiFetch(`/api/v1/spaces/${id}/reactivate`, { method: 'POST' }, token)
}

export function deleteSpacePermanent(id: string, token: string): Promise<void> {
  return apiFetch(`/api/v1/spaces/${id}/permanent`, { method: 'DELETE' }, token)
}

export function getAvailability(id: string, token: string): Promise<AvailabilitySlot[]> {
  return apiFetch(`/api/v1/spaces/${id}/availability`, {}, token)
}

export function setAvailability(id: string, schedule: AvailabilitySlot[], token: string): Promise<AvailabilitySlot[]> {
  return apiFetch(
    `/api/v1/spaces/${id}/availability`,
    { method: 'PUT', body: JSON.stringify({ schedule }) },
    token,
  )
}
