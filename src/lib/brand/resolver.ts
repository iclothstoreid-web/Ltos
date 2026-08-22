import { TARDA_CONFIG, LOCAL_TAILOR_CONFIG } from './config'
import type { BrandConfig } from './types'

// Lightweight host -> brand resolution. Pure function so it can be used
// in both server and client contexts where a host string is available.
export function getBrandFromHost(host?: string): BrandConfig {
  if (!host) return TARDA_CONFIG // default to TARDA for safety in dev
  const hostname = host.split(':')[0].toLowerCase()

  // Exact matches first
  if (TARDA_CONFIG.domains.includes(hostname) || hostname === TARDA_CONFIG.canonicalDomain) return TARDA_CONFIG
  if (LOCAL_TAILOR_CONFIG.domains.includes(hostname) || hostname === LOCAL_TAILOR_CONFIG.canonicalDomain) return LOCAL_TAILOR_CONFIG

  // Common Vercel preview branches or alias forms — prefer local-tailor when known
  if (hostname.endsWith('.vercel.app')) {
    // if the hostname contains 'tarda' pick TARDA, otherwise fallback to LOCAL_TAILOR
    if (hostname.startsWith('tarda') || hostname.includes('tarda')) return TARDA_CONFIG
    if (hostname.startsWith('ltos') || hostname.includes('localtailor') || hostname.includes('local-tailor')) return LOCAL_TAILOR_CONFIG
  }

  // default: prefer local-tailor (historical production) if the repository is legacy
  return LOCAL_TAILOR_CONFIG
}

export function getBrandForRequestHost(hostHeader?: string | null): BrandConfig {
  return getBrandFromHost(hostHeader ?? undefined)
}
