// Client helper to read the server-injected brand identifier. Falls back
// to a hostname-derived guess when not present (useful for local dev).
export function readClientBrandId(): string | null {
  if (typeof window === 'undefined') return null
  // server injects window.__LTOS_BRAND
  const win = window as any
  if (win && win.__LTOS_BRAND) return String(win.__LTOS_BRAND)

  const hostname = window.location.hostname
  if (!hostname) return null
  if (hostname.includes('tarda')) return 'tarda'
  if (hostname.includes('localtailor') || hostname.includes('ltos')) return 'local-tailor'
  return null
}
