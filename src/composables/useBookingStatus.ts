import type { BookingStatus } from '../api/types'

// Badge CSS classes — identical across all views.
export const BOOKING_BADGE_CLASS: Record<string, string> = {
  pending:          'bg-amber-100 text-amber-700',
  payment_pending:  'bg-blue-100 text-blue-700',
  awaiting_payment: 'bg-blue-100 text-blue-700',
  payment_review:   'bg-purple-100 text-purple-700',
  confirmed:        'bg-emerald-100 text-emerald-700',
  completed:        'bg-surface-muted text-text-secondary',
  cancelled:        'bg-red-100 text-red-600',
}

// Status labels from the Renter's perspective (badge / list context).
export const RENTER_STATUS_LABEL: Record<string, string> = {
  pending:          'Awaiting Owner',
  payment_pending:  'Pay Now',
  awaiting_payment: 'Upload Payment Slip',
  payment_review:   'Under Review',
  confirmed:        'Confirmed',
  completed:        'Completed',
  cancelled:        'Cancelled',
}

// Status labels from the Owner's perspective (badge / list context).
export const OWNER_STATUS_LABEL: Record<string, string> = {
  pending:          'Pending',
  payment_pending:  'Awaiting Payment',
  awaiting_payment: 'Awaiting Slip',
  payment_review:   'Under Review',
  confirmed:        'Confirmed',
  completed:        'Completed',
  cancelled:        'Cancelled',
}

// Which statuses belong to each tab — Renter view.
export const RENTER_TAB_STATUSES: Record<'active' | 'completed' | 'cancelled', string[]> = {
  active:    ['pending', 'payment_pending', 'awaiting_payment', 'payment_review', 'confirmed'],
  completed: ['completed'],
  cancelled: ['cancelled'],
}

// Which statuses belong to each tab — Owner view.
export const OWNER_TAB_STATUSES: Record<'requests' | 'active' | 'completed' | 'cancelled', string[]> = {
  requests:  ['pending'],
  active:    ['payment_pending', 'awaiting_payment', 'payment_review', 'confirmed'],
  completed: ['completed'],
  cancelled: ['cancelled'],
}

// useBookingStatus returns boolean flags and the badge CSS class for a given status.
// Use this instead of inline switch statements or status string comparisons in views.
export function useBookingStatus(status: BookingStatus | string | undefined) {
  const isPaymentDue  = status === 'awaiting_payment' || status === 'payment_pending'
  const isUnderReview = status === 'payment_review'
  const isCancelled   = status === 'cancelled'
  const isPending     = status === 'pending'
  const isConfirmed   = status === 'confirmed'
  const isCompleted   = status === 'completed'
  const isCancellable = isPending || isPaymentDue

  const badgeClass = BOOKING_BADGE_CLASS[status ?? ''] ?? 'bg-surface-muted text-text-muted'

  return { badgeClass, isPaymentDue, isUnderReview, isCancelled, isPending, isConfirmed, isCompleted, isCancellable }
}
