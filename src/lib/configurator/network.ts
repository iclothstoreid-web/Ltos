// Shared network robustness helpers (W2-5) — used by client.ts and
// DesignStudioClient's catalog fetch. Deliberately generic/tiny so it never
// needs to know about the estimate/options contracts themselves.

const DEFAULT_TIMEOUT_MS = 10_000

export class NetworkTimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message)
    this.name = 'NetworkTimeoutError'
  }
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new NetworkTimeoutError()
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine
}
