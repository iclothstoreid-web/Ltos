import type { BrandConfig } from './types'

export const TARDA_CONFIG: BrandConfig = {
  id: 'tarda',
  name: 'Tarda',
  displayName: 'Tarda',
  canonicalDomain: 'tarda.vercel.app',
  domains: ['tarda.vercel.app'],
  assets: {
    logoHorizontal: '/brand/tarda-home.svg',
    logoMark: '/brand/tarda-home.svg',
    ogImage: '/brand/og-image.png',
    favicon: '/brand/icon-192.png',
    manifest: '/manifest.json',
  },
  colors: {
    primary: '#0b1012',
    themeColor: '#6A4A34',
  },
  metadata: {
    title: 'Tarda — Bespoke Tailoring',
    description: 'Premium bespoke tailoring for custom thobes.'
  }
}

export const LOCAL_TAILOR_CONFIG: BrandConfig = {
  id: 'local-tailor',
  name: 'Local Tailor',
  displayName: 'Local Tailor',
  canonicalDomain: 'localtailor.id',
  domains: ['localtailor.id', 'ltos.vercel.app'],
  assets: {
    // Use existing public/brand logos (historical Local Tailor assets)
    logoHorizontal: '/brand/logo-horizontal.svg',
    logoMark: '/brand/logo-mark.svg',
    ogImage: '/brand/og-image.png',
    favicon: '/brand/icon-192.png',
    manifest: '/manifest.json'
  },
  colors: {
    primary: '#221814',
    themeColor: '#6A4A34'
  },
  metadata: {
    title: 'Local Tailor — Bespoke Tailoring',
    description: 'Local Tailor — premium bespoke tailoring.'
  }
}

export const ALL_BRANDS = [TARDA_CONFIG, LOCAL_TAILOR_CONFIG]
