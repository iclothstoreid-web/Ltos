import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

// Sprint W7-10 — Knowledge Graph & Entity Strategy. This is the single
// registry of the named entities this site is trying to be understood as
// authoritative on, for AI Overview / ChatGPT / Gemini / Claude / Perplexity
// discoverability. It does not replace any existing per-domain SEO module
// (marketing/materials/content/knowledge's own seo.ts files stay as they
// are — this is additive, not a rewrite of stable, already-shipped code).
//
// Every `sameAs`/internal link below points at a route that actually exists
// in this repo today. No social profile URLs are listed — none exist yet
// (grepped for instagram/facebook/tiktok across the marketing lib and found
// nothing); fabricating one would misrepresent the brand's real online
// presence, the same honesty standard prior sprints held for logo/review
// data (see src/lib/marketing/seo.ts, src/lib/knowledge/seo.ts comments).

export const PRIMARY_ENTITY = {
  name: 'Local Tailor',
  alternateName: 'Bespoke Tailor',
  type: 'LocalBusiness' as const,
  url: FABRIC_SITE_ORIGIN,
  description:
    'Local Tailor adalah bespoke tailoring house di Bandung, Indonesia, yang mengkhususkan diri pada custom thobe dan premium Muslim menswear — setiap garmen dibuat dari pola yang diformulasikan dari pengukuran tubuh pelanggan, bukan ukuran standar.',
  addressLocality: 'Bandung',
  addressCountry: 'ID',
}

export interface KnowledgeGraphEntity {
  slug: string
  name: string
  type: 'Thing' | 'Product' | 'Service' | 'Place'
  description: string
  /** Path relative to FABRIC_SITE_ORIGIN where this entity is primarily represented. */
  primaryPath: string
  /** Other internal paths where this entity is discussed, for entity-linking. */
  relatedPaths: string[]
}

// Secondary entities — the vocabulary this site wants search/AI engines to
// associate with Local Tailor. Each maps to real, live content (not
// aspirational pages); `primaryPath`/`relatedPaths` are checked against
// actual routes as of Sprint W7, not invented.
export const SECONDARY_ENTITIES: KnowledgeGraphEntity[] = [
  {
    slug: 'bespoke-thobe',
    name: 'Bespoke Thobe',
    type: 'Service',
    description: 'Thobe yang dibuat dari pola personal, dirancang dan dijahit sesuai ukuran tubuh satu pelanggan.',
    primaryPath: '/design-studio',
    relatedPaths: ['/knowledge/tailoring', '/'],
  },
  {
    slug: 'custom-thobe',
    name: 'Custom Thobe',
    type: 'Product',
    description: 'Thobe custom yang dikonfigurasi dari pilihan model, kerah, manset, material, dan warna.',
    primaryPath: '/design-studio',
    relatedPaths: ['/fabric', '/knowledge/measurements/thobe-size-guide'],
  },
  {
    slug: 'made-to-measure-thobe',
    name: 'Made-to-Measure Thobe',
    type: 'Service',
    description: 'Thobe yang diproduksi berdasarkan Digital Body Profile hasil pengukuran langsung oleh fitter.',
    primaryPath: '/cara-mengukur-thobe',
    relatedPaths: ['/cek-ukuran-thobe', '/knowledge/measurements/how-to-measure-body'],
  },
  {
    slug: 'premium-cotton-thobe',
    name: 'Premium Cotton Thobe',
    type: 'Product',
    description: 'Thobe berbahan katun premium — termasuk Katun Mesir dan Katun Jepang — untuk kenyamanan sehari-hari.',
    primaryPath: '/fabric/cotton',
    relatedPaths: ['/knowledge/fabrics/egyptian-cotton', '/knowledge/fabrics/japanese-cotton', '/knowledge/fabrics/premium-cotton'],
  },
  {
    slug: 'linen-thobe',
    name: 'Linen Thobe',
    type: 'Product',
    description: 'Thobe berbahan linen alami, dipilih untuk sirkulasi udara dan kenyamanan di cuaca panas.',
    primaryPath: '/knowledge/fabrics/linen',
    relatedPaths: ['/fabric'],
  },
  {
    slug: 'wedding-thobe',
    name: 'Wedding Thobe',
    type: 'Product',
    description: 'Thobe custom untuk acara pernikahan, dengan pertimbangan material dan detail formal.',
    primaryPath: '/knowledge/wedding',
    relatedPaths: ['/design-studio', '/book-appointment'],
  },
  {
    slug: 'umrah-thobe',
    name: 'Umrah Thobe',
    type: 'Product',
    description: 'Thobe custom yang dirancang untuk kenyamanan dan kepraktisan selama ibadah umrah.',
    primaryPath: '/knowledge/umrah',
    relatedPaths: ['/design-studio', '/book-appointment'],
  },
  {
    slug: 'bandung-tailor',
    name: 'Bandung Tailor',
    type: 'Place',
    description: 'Local Tailor beroperasi sebagai bespoke tailoring house yang berbasis di Bandung, Indonesia.',
    primaryPath: '/',
    relatedPaths: ['/book-appointment'],
  },
  {
    slug: 'thobe-measurement',
    name: 'Thobe Measurement',
    type: 'Service',
    description: 'Proses pengukuran badan untuk thobe — baik estimasi online maupun pengukuran langsung oleh fitter.',
    primaryPath: '/cara-mengukur-thobe',
    relatedPaths: ['/cek-ukuran-thobe', '/size-chart-thobe', '/knowledge/measurements'],
  },
  {
    slug: 'islamic-menswear',
    name: 'Islamic Menswear',
    type: 'Thing',
    description: 'Kategori busana pria Muslim premium yang menjadi fokus Local Tailor, termasuk thobe untuk umrah dan acara formal.',
    primaryPath: '/',
    relatedPaths: ['/knowledge', '/knowledge/umrah', '/knowledge/wedding'],
  },
  // Sprint Y — Digital Bespoke Tailoring entity cluster. This is the
  // sprint's own "primary entity" for the /design-studio positioning, but
  // it's added here as a secondary entity rather than replacing the
  // sitewide PRIMARY_ENTITY above (Local Tailor) — redefining the whole
  // site's primary entity for one feature would overreach this sprint's
  // scope. `primaryPath` for each points at the real cornerstone or
  // /design-studio itself; `relatedPaths` link into the real 15-article
  // Knowledge cluster built alongside it.
  {
    slug: 'digital-bespoke-tailoring',
    name: 'Digital Bespoke Tailoring',
    type: 'Service',
    description: 'Proses bespoke tailoring yang dijalankan jarak jauh — konsultasi, desain, dan panduan ukur via video call dan Design Studio, dengan opsi home visit untuk sesi tatap muka.',
    primaryPath: '/design-studio',
    relatedPaths: ['/knowledge/design-studio/bespoke-tanpa-harus-datang-ke-bandung', '/knowledge/design-studio'],
  },
  {
    slug: 'design-studio',
    name: 'Design Studio',
    type: 'Service',
    description: 'Konfigurator online Local Tailor untuk memilih Model, Kerah, Manset, Material, dan Warna serta melihat estimasi harga secara real-time.',
    primaryPath: '/design-studio',
    relatedPaths: ['/knowledge/design-studio/apa-itu-design-studio-local-tailor', '/knowledge/design-studio/cara-mendesain-thobe-sebelum-dijahit'],
  },
  {
    slug: 'video-call-fitting',
    name: 'Video Call Fitting',
    type: 'Service',
    description: 'Sesi konsultasi dan panduan pengukuran gratis via video call, untuk pelanggan yang tidak sempat datang ke Bandung.',
    primaryPath: '/design-studio',
    relatedPaths: ['/knowledge/design-studio/fitting-video-call-apakah-akurat', '/knowledge/design-studio/konsultasi-tailor-online-gratis'],
  },
  {
    slug: 'home-visit-tailor',
    name: 'Home Visit Tailor',
    type: 'Service',
    description: 'Layanan kunjungan tim Local Tailor ke lokasi pelanggan, membawa fabric book, sample komponen, tablet Design Studio, dan alat ukur.',
    primaryPath: '/design-studio',
    relatedPaths: ['/knowledge/design-studio/layanan-home-visit-bandung', '/knowledge/design-studio/home-visit-wedding-keluarga'],
  },
  {
    slug: 'custom-thobe-online',
    name: 'Custom Thobe Online',
    type: 'Product',
    description: 'Thobe custom yang dipesan sepenuhnya secara online — desain di Design Studio, konsultasi via video call, produksi tetap di workshop Bandung.',
    primaryPath: '/design-studio',
    relatedPaths: ['/knowledge/design-studio/custom-thobe-online-panduan-lengkap', '/knowledge/design-studio/cara-pesan-custom-thobe-luar-kota'],
  },
]

export function getEntityBySlug(slug: string): KnowledgeGraphEntity | undefined {
  return SECONDARY_ENTITIES.find((entity) => entity.slug === slug)
}
