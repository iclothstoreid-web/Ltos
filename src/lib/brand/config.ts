import type { BrandConfig } from './types'

export const TARDA_CONFIG: BrandConfig = {
  id: 'tarda',
  name: 'Tarda',
  displayName: 'Tarda',
  footerLabel: 'Tarda, Bogor',
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
  footerLabel: 'Local Tailor',
  canonicalDomain: 'localtailor.id',
  domains: ['localtailor.id', 'ltos.vercel.app'],
  assets: {
    // Local Tailor's own assets, all under public/brand/local-tailor/ +
    // the file-based Next.js icon convention (src/app/icon.svg /
    // favicon.ico / apple-icon.png — the shared, text-free monogram).
    // Tarda's OG image (/brand/og-image.png) and wordmark
    // (/brand/tarda-home.svg) are separate TARDA-only assets and must
    // never be referenced here.
    logoHorizontal: '/brand/local-tailor/horizontal.svg',
    logoMark: '/brand/local-tailor/mark.svg',
    // Points at the file-based icon (not the shared-name /brand/icon-192.png)
    // so nothing about Local Tailor's icon resolution can be confused with
    // Tarda's. Next.js's file-based icon convention overrides metadata.icons
    // anyway; this keeps the config self-consistent for any other reader.
    favicon: '/icon.svg',
    ogImage: '/brand/local-tailor/horizontal-tagline.svg',
    // Was sharing Tarda's own /manifest.json (name/short_name/description
    // still said "Tarda" / "Bogor" live in production) — now points at its
    // own manifest so the two brands stop overwriting each other's PWA
    // identity. Tarda's own TARDA_CONFIG.assets.manifest below is
    // deliberately untouched.
    manifest: '/manifest-local-tailor.json'
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
