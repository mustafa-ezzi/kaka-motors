const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8001/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message = `Request failed: ${status}`) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new ApiError(response.status)
  }
  return response.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    if (!response.ok) {
    let message = `Request failed: ${response.status}`
    if (response.status === 429) message = 'Too many requests. Wait a moment, then try again.'
    try {
      const data = (await response.json()) as Record<string, unknown>
      if (typeof data.detail === 'string') message = data.detail
      else {
        const first = Object.values(data)[0]
        if (Array.isArray(first) && typeof first[0] === 'string') message = first[0]
        else if (typeof first === 'string') message = first
      }
    } catch {
      /* keep default */
    }
    throw new ApiError(response.status, message)
  }
  return response.json() as Promise<T>
}

export { API_BASE_URL }
