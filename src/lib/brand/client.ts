import { getBrandFromHost } from './resolver'
import type { BrandConfig } from './types'

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

export function getCurrentBrand(): BrandConfig {
  if (typeof window === 'undefined') return getBrandFromHost()

  const brandId = readClientBrandId()
  const hostname = window.location.hostname

  if (brandId === 'tarda') {
    return getBrandFromHost('tarda.vercel.app')
  }

  if (brandId === 'local-tailor') {
    return getBrandFromHost('localtailor.id')
  }

  return getBrandFromHost(hostname)
}

export function getLoginBrandMeta() {
  const brand = getCurrentBrand()
  const isLocalTailor = brand.id === 'local-tailor'

  return {
    brand,
    isLocalTailor,
    footerLabel: `v1.0 · ${brand.footerLabel ?? brand.displayName}`,
    shellClassName: isLocalTailor
      ? 'min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_15%_20%,rgba(200,162,74,0.13),transparent_18%),radial-gradient(circle_at_80%_15%,rgba(91,70,54,0.22),transparent_28%),linear-gradient(135deg,_#151210_0%,_#2A1F1A_40%,_#151210_100%)] px-6 py-10 text-luxury-ivory'
      : 'min-h-screen bg-[radial-gradient(circle_at_top,_rgba(197,160,104,0.18),transparent_30%),linear-gradient(135deg,_#07090d_0%,_#111821_50%,_#07090d_100%)] flex items-center justify-center px-6 py-10 text-luxury-ivory',
  }
}
