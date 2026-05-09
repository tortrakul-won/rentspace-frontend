import { apiFetch } from './client'
import type { SpaceResponse, AvailabilitySlot, SpaceFormData } from './types'

export function listSpaces(token: string): Promise<SpaceResponse[]> {
  return apiFetch('/api/v1/spaces', {}, token)
}

export function getSpace(id: string, token: string): Promise<SpaceResponse> {
  return apiFetch(`/api/v1/spaces/${id}`, {}, token)
}

export function listMySpaces(token: string): Promise<SpaceResponse[]> {
  return apiFetch('/api/v1/spaces/mine', {}, token)
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
