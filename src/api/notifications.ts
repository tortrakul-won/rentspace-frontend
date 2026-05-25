import { apiFetch } from './client'
import type { NotificationResponse } from './types'

export function listNotifications(token: string, limit = 50): Promise<NotificationResponse[]> {
  return apiFetch(`/api/v1/notifications?limit=${limit}`, {}, token)
}

export function getUnreadCount(token: string): Promise<{ count: number }> {
  return apiFetch('/api/v1/notifications/unread-count', {}, token)
}

export function markNotificationRead(id: string, token: string): Promise<void> {
  return apiFetch(`/api/v1/notifications/${id}/read`, { method: 'POST' }, token)
}

export function markAllNotificationsRead(token: string): Promise<void> {
  return apiFetch('/api/v1/notifications/read-all', { method: 'POST' }, token)
}
