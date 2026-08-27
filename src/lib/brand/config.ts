import type { BrandConfig } from './types'

// LTOS is a single-brand system: Local Tailor. The former Tarda brand and
// the multi-brand fallback layer were removed in "refactor: remove Tarda
// and restore Local Tailor single brand" — every supported host
// (localtailor.id, www.localtailor.id, ltos.vercel.app, plus dev/preview)
// is Local Tailor. This object is the one source of truth for Local
// Tailor's public identity and asset paths.
//
// Assets live under public/brand/local-tailor/ + the file-based Next.js
// icon convention (src/app/icon.svg / favicon.ico / apple-icon.png — the
// text-free monogram). The PWA manifest is the conventional
// public/manifest.json ("Local Tailor", "…handcrafted in Bandung").
export const LOCAL_TAILOR_CONFIG: BrandConfig = {
  id: 'local-tailor',
  name: 'Local Tailor',
  displayName: 'Local Tailor',
  footerLabel: 'Local Tailor',
  canonicalDomain: 'localtailor.id',
  domains: ['localtailor.id', 'www.localtailor.id', 'ltos.vercel.app'],
  assets: {
    logoHorizontal: '/brand/local-tailor/horizontal.svg',
    logoMark: '/brand/local-tailor/mark.svg',
    favicon: '/icon.svg',
    ogImage: '/brand/local-tailor/horizontal-tagline.svg',
    manifest: '/manifest.json',
  },
  colors: {
    primary: '#221814',
    themeColor: '#6A4A34',
  },
  metadata: {
    title: 'Local Tailor — Bespoke Tailoring',
    description: 'Local Tailor — premium bespoke tailoring.',
  },
}

// The one supported brand. Kept as a named export so call sites read
// intentionally (`BRAND.displayName`) rather than reaching for a config
// whose name still implies a choice between brands.
export const BRAND = LOCAL_TAILOR_CONFIG
