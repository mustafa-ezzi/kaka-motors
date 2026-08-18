import { API_BASE_URL, ApiError } from '../lib/api'
const TOKEN_KEY = 'kaka-studio-token'

export function getStudioToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStudioToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function readError(response: Response) {
  try {
    const body = (await response.json()) as Record<string, unknown>
    if (typeof body.detail === 'string') return body.detail
    const first = Object.values(body)[0]
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
    if (typeof first === 'string') return first
    return JSON.stringify(body)
  } catch {
    return `Request failed: ${response.status}`
  }
}

async function studioFetch(path: string, init: RequestInit = {}) {
  const token = getStudioToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Token ${token}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (!response.ok) {
    throw new ApiError(response.status, await readError(response))
  }
  if (response.status === 204) return null
  return response.json()
}

export function studioGet<T>(path: string) {
  return studioFetch(path) as Promise<T>
}

export function studioSend<T>(path: string, method: string, body?: unknown) {
  return studioFetch(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as Promise<T>
}

export function studioUpload<T>(path: string, file: File, extra: Record<string, string> = {}) {
  const data = new FormData()
  data.append('file', file)
  Object.entries(extra).forEach(([key, value]) => data.append(key, value))
  return studioFetch(path, { method: 'POST', body: data }) as Promise<T>
}

export { TOKEN_KEY }
