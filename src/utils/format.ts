/**
 * Format a Thai phone number for display.
 * 10 digits → XXX-XXX-XXXX  (e.g. 081-234-5678)
 *  9 digits → XX-XXX-XXXX   (e.g. 02-123-4567)
 * Other     → returned as-is
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const d = phone.replace(/\D/g, '')
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  if (d.length === 9)  return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`
  return phone
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatDateTimeShort(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatPrice(n: number): string {
  return '฿' + n.toLocaleString('th-TH')
}
