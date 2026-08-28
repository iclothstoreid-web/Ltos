import type { KnowledgeCategorySlug } from './types'

// Sprint W6-10 — Commercial funnel layer. One config per category so
// KnowledgeCTAGroup can lead with the CTA that's actually relevant to
// that cluster (wedding article -> wedding-flavored consultation copy,
// fabric article -> compare/estimate emphasis) without every category
// needing its own bespoke CTA block.

export interface KnowledgeCTAConfig {
  heading: string
  body: string
  consultationLabel: string
  showFabricExplorer: boolean
  showEstimatePrice: boolean
  showBodyProfile: boolean
  // National SEO (P0-3 / Task 14) — optional forward link from this
  // cluster to its commercial "money page" (a Revenue Landing Page or a
  // national pillar). Set on high-relevance clusters only; it is defined
  // here once per category, never per article.
  commercial?: { label: string; href: string }
}

const DEFAULT_CTA_CONFIG: KnowledgeCTAConfig = {
  heading: 'Siap Melanjutkan ke Langkah Berikutnya?',
  body: 'Konsultasikan kebutuhan Anda, jelajahi koleksi bahan, atau cek Digital Body Profile Anda sebelum memesan thobe bespoke.',
  consultationLabel: 'Konsultasi Gratis',
  showFabricExplorer: true,
  showEstimatePrice: false,
  showBodyProfile: true,
}

const CATEGORY_CTA_CONFIG: Partial<Record<KnowledgeCategorySlug, KnowledgeCTAConfig>> = {
  wedding: {
    heading: 'Siap Memulai Thobe Pernikahan Anda?',
    body: 'Konsultasikan warna, bahan, dan timeline pernikahan Anda langsung dengan tailor kami.',
    consultationLabel: 'Konsultasi Pernikahan Gratis',
    showFabricExplorer: true,
    showEstimatePrice: true,
    showBodyProfile: true,
  },
  umrah: {
    heading: 'Siap Menyiapkan Thobe Umrah Anda?',
    body: 'Konsultasikan bahan, jumlah, dan kebutuhan perjalanan ibadah Anda langsung dengan tailor kami.',
    consultationLabel: 'Konsultasi Umrah Gratis',
    showFabricExplorer: true,
    showEstimatePrice: false,
    showBodyProfile: true,
  },
  fabrics: {
    heading: 'Ingin Membandingkan Bahan Lebih Lanjut?',
    body: 'Jelajahi koleksi lengkap kami dan lihat estimasi harga langsung di Design Studio.',
    consultationLabel: 'Konsultasi Gratis',
    showFabricExplorer: true,
    showEstimatePrice: true,
    showBodyProfile: false,
  },
  measurements: {
    heading: 'Siap Memastikan Ukuran Anda?',
    body: 'Cek Digital Body Profile Anda, atau lanjutkan ke konsultasi untuk pengukuran langsung oleh fitter.',
    consultationLabel: 'Konsultasi Gratis',
    showFabricExplorer: false,
    showEstimatePrice: false,
    showBodyProfile: true,
    commercial: { label: 'Custom Thobe Indonesia', href: '/custom-thobe-indonesia' },
  },
  tailoring: {
    heading: 'Siap Memulai Proses Bespoke Anda?',
    body: 'Pelajari lebih lanjut proses bespoke Local Tailor, atau mulai konsultasi untuk thobe custom Anda.',
    consultationLabel: 'Konsultasi Gratis',
    showFabricExplorer: true,
    showEstimatePrice: true,
    showBodyProfile: true,
    commercial: { label: 'Bespoke Tailor Indonesia', href: '/bespoke-tailor-indonesia' },
  },
  bandung: {
    heading: 'Siap Memulai Thobe Bespoke di Bandung?',
    body: 'Booking konsultasi gratis untuk memulai proses bespoke Anda bersama tailor kami di Bandung.',
    consultationLabel: 'Booking Konsultasi Bandung',
    showFabricExplorer: true,
    showEstimatePrice: true,
    showBodyProfile: true,
    commercial: { label: 'Bespoke Tailor Bandung', href: '/bespoke-tailor-bandung' },
  },
  // Sprint Y — every design-studio cluster article must lead back to
  // /design-studio (the brief's own requirement); showEstimatePrice is the
  // existing CTAEstimatePrice component, which already links there.
  'design-studio': {
    heading: 'Siap Memulai Digital Bespoke Tailoring Anda?',
    body: 'Book Free Video Call, atau langsung jelajahi Design Studio untuk melihat kombinasi desain dan estimasi harga.',
    consultationLabel: 'Book Free Video Call',
    showFabricExplorer: false,
    showEstimatePrice: true,
    showBodyProfile: true,
    commercial: { label: 'Custom Thobe Indonesia', href: '/custom-thobe-indonesia' },
  },
}

export function getCTAConfig(category: KnowledgeCategorySlug): KnowledgeCTAConfig {
  return CATEGORY_CTA_CONFIG[category] ?? DEFAULT_CTA_CONFIG
}
