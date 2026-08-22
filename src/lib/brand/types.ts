export type BrandId = 'tarda' | 'local-tailor'

export interface BrandConfig {
  id: BrandId
  name: string
  displayName: string
  tagline?: string
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
