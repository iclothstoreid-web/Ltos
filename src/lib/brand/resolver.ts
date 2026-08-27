import { TARDA_CONFIG, LOCAL_TAILOR_CONFIG } from './config'
import type { BrandConfig } from './types'

// Lightweight host -> brand resolution. Pure function so it can be used
// in both server and client contexts where a host string is available.
export function getBrandFromHost(host?: string): BrandConfig {
  // No host = an unidentified runtime state (build-time SSG, a server
  // context without request headers, dev). Local Tailor is the ONLY live
  // production brand (tarda.vercel.app alias removed) and is the correct
  // safe default — TARDA must never be the fallback for an unidentified
  // Local Tailor state, or its identity/assets leak onto localtailor.id.
  // TARDA still resolves for its own explicit `tarda.vercel.app` host below.
  if (!host) return LOCAL_TAILOR_CONFIG
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
