export const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  status: number
  code: string
  details: Record<string, string>
  constructor(status: number, message: string, code = '', details: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'ApiError'
    this.details = details
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const method = options.method?.toUpperCase() ?? 'GET'
  const headers: Record<string, string> = {}
  if (method !== 'GET' && method !== 'HEAD') headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError(0, 'Network error — is the server running?')
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      ;['rs_token', 'rs_user', 'rs_profiles', 'rs_active_profile'].forEach(k => localStorage.removeItem(k))
      sessionStorage.setItem('rs_session_expired', '1')
      window.location.replace('/login')
      throw new ApiError(401, 'Session expired')
    }
    let message = `Request failed (${res.status})`
    let code = ''
    let details: Record<string, string> = {}
    try {
      const body = await res.json()
      if (body.message) message = body.message
      else if (body.error) message = body.error
      if (body.code) code = body.code
      if (body.details && typeof body.details === 'object') details = body.details
    } catch {}
    throw new ApiError(res.status, message, code, details)
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T
  return res.json() as Promise<T>
}
