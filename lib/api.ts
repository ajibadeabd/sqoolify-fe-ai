const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

interface ApiOptions {
  headers?: Record<string, string>
  token?: string
  skipAuth?: boolean
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('sqoolify_refresh_token')
  const userStr = localStorage.getItem('sqoolify_user')

  if (!refreshToken || !userStr) return null

  try {
    const user = JSON.parse(userStr)
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, refreshToken }),
    })

    if (!res.ok) return null

    const data = await res.json()
    localStorage.setItem('sqoolify_token', data.data.accessToken)
    localStorage.setItem('sqoolify_refresh_token', data.data.refreshToken)
    return data.data.accessToken
  } catch {
    return null
  }
}

async function getValidToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }
  return localStorage.getItem('sqoolify_token')
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Auto-attach token unless skipAuth is true
  const token = options.token || (!options.skipAuth ? localStorage.getItem('sqoolify_token') : null)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Handle 401 - try to refresh token
  if (res.status === 401 && !options.skipAuth && !path.includes('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken()
    }

    const newToken = await refreshPromise
    isRefreshing = false
    refreshPromise = null

    if (newToken) {
      // Retry with new token
      headers['Authorization'] = `Bearer ${newToken}`
      const retryRes = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!retryRes.ok) {
        const error = await retryRes.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(error.message || `HTTP ${retryRes.status}`)
      }

      return retryRes.json()
    } else {
      // Refresh failed - clear auth and redirect to login
      localStorage.removeItem('sqoolify_token')
      localStorage.removeItem('sqoolify_refresh_token')
      localStorage.removeItem('sqoolify_user')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Session expired. Please login again.')
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) =>
    request<T>('GET', path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>('POST', path, body, options),

  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>('PATCH', path, body, options),

  delete: <T>(path: string, options?: ApiOptions) =>
    request<T>('DELETE', path, undefined, options),
}
