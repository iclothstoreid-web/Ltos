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

  const baseClass = 'min-h-screen flex items-center justify-center px-6 py-10 text-luxury-ivory'

  const tardaBackground = {
    backgroundImage:
      "radial-gradient(circle at top, rgba(197,160,104,0.18), transparent 30%), linear-gradient(135deg, #07090d 0%, #111821 50%, #07090d 100%)",
    backgroundColor: '#07090d',
  }

  const localTailorBackground = {
    backgroundImage:
      "radial-gradient(circle at 15% 20%, rgba(200,162,74,0.13), transparent 18%), radial-gradient(circle at 80% 15%, rgba(91,70,54,0.22), transparent 28%), linear-gradient(135deg, #151210 0%, #2A1F1A 40%, #151210 100%)",
    backgroundColor: '#151210',
  }

  return {
    brand,
    isLocalTailor,
    footerLabel: `v1.0 · ${brand.footerLabel ?? brand.displayName}`,
    shellBaseClassName: baseClass,
    shellStyle: isLocalTailor ? localTailorBackground : tardaBackground,
  }
}
