// LTOS is a single-brand system: Local Tailor. `BrandId` is intentionally a
// single-member union — the multi-brand (Tarda + Local Tailor) layer was
// removed in "refactor: remove Tarda and restore Local Tailor single brand".
// BrandConfig stays as the one centralized place Local Tailor's public
// identity (name, canonical domain, logo/OG/manifest asset paths, theme
// colours, default metadata) is defined.
export type BrandId = 'local-tailor'

export interface BrandConfig {
  id: BrandId
  name: string
  displayName: string
  tagline?: string
  footerLabel?: string
  canonicalDomain: string
  domains: string[]
  assets: {
    logoHorizontal?: string // path to svg or special identifier
    logoMark?: string
    ogImage?: string
    favicon?: string
    manifest?: string
  }
  colors?: {
    primary?: string
    themeColor?: string
  }
  metadata?: {
    title?: string
    description?: string
  }
}
