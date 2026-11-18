const TOKEN_KEY = "inventor.token"

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const BASE_URL = (
  configuredBaseUrl || "https://inventory-backend-indol.vercel.app/api"
).replace(/\/+$/, "")

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly retryAfter: number | null

  constructor(message: string, code: string, status: number, retryAfter: number | null = null) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = status
    this.retryAfter = retryAfter
  }
}

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // localStorage bisa diblokir; sesi tetap jalan sampai refresh.
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // abaikan
  }
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return "Terjadi kesalahan. Coba lagi."
}

type QueryValue = string | number | boolean | null | undefined

export function buildQuery(params: Record<string, QueryValue> | object): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  signal?: AbortSignal
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers["Content-Type"] = "application/json"

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError(
      "Tidak bisa terhubung ke server. Periksa koneksi internet lalu coba lagi.",
      "NETWORK_ERROR",
      0,
    )
  }

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const envelope = (payload ?? {}) as ErrorEnvelope
    const retryAfterHeader = response.headers.get("Retry-After")
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : null

    if (response.status === 401 && !path.startsWith("/auth/login")) {
      clearToken()
      unauthorizedHandler?.()
    }

    throw new ApiError(
      envelope.error?.message ?? `Permintaan gagal (HTTP ${response.status}).`,
      envelope.error?.code ?? "UNKNOWN_ERROR",
      response.status,
      Number.isFinite(retryAfter) ? retryAfter : null,
    )
  }

  if (payload === null || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiError("Respons server tidak dikenali.", "INVALID_RESPONSE", response.status)
  }

  return (payload as { data: T }).data
}
