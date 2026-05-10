const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
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
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body.error) message = body.error
    } catch {}
    throw new ApiError(res.status, message)
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T
  return res.json() as Promise<T>
}
