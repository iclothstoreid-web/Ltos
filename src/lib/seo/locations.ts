import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

// Sprint W8-1 — Location SEO Foundation. City configuration registry for
// /locations and /locations/[city].
//
// Domain note: business data below was given with "Website:
// https://localtailor.id" — that domain is a real, separately-hosted
// WordPress site for the same business, not this Next.js/Vercel project
// (confirmed: it isn't in this project's Vercel domain list, which is only
// the *.vercel.app aliases). Per explicit decision with the user, every
// canonical/OG/schema URL in this module uses FABRIC_SITE_ORIGIN (the
// domain this app actually deploys to) instead — pointing canonical tags at
// a domain serving different content would suppress indexing of these
// pages entirely, not help them.
export const LOCATION_SITE_ORIGIN = FABRIC_SITE_ORIGIN

// Business Data (LOCKED, per Sprint W8-1 brief). This is the one real,
// physical business location — Local Tailor operates a single workshop in
// Bandung. The other 4 city routes below are service-area landing pages
// for a Bandung-based business that consults/measures remotely and ships
// nationwide, NOT separate branches — see buildLocationLocalBusinessSchema
// in localBusiness.ts for why that distinction matters for the schema.
export const LOCATION_BUSINESS = {
  name: 'Local Tailor Bandung',
  streetAddress: 'Jl. Gamelan No.10, Buah Batu, Bandung, Jawa Barat, Indonesia',
  addressLocality: 'Bandung',
  addressRegion: 'Jawa Barat',
  // Real postal code for Jl. Gamelan (Turangga, Lengkong, Kota Bandung),
  // looked up via OpenStreetMap Nominatim — not invented.
  postalCode: '40264',
  addressCountry: 'ID',
  website: 'https://localtailor.id',
  // WhatsApp number as given, "085173334251" (local-dial format), converted
  // to the country-code format wa.me requires (drop leading 0, prepend 62)
  // — src/lib/content/whatsapp.ts's buildContentWhatsAppUrl only strips
  // non-digit characters, it doesn't do this conversion, so an unconverted
  // local-format number here would silently produce a broken wa.me link.
  whatsappLocal: '085173334251',
  whatsappInternational: '6285173334251',
} as const

// Real street-level geocode for Jalan Gamelan, Turangga, Lengkong, Kota
// Bandung (OpenStreetMap Nominatim, queried this sprint) — street-level
// accuracy, not verified down to house number 10. Used only for coarse geo
// meta tags / schema.org `geo`, never presented as a precise pin. No
// coordinates exist or are invented for Jakarta/Bekasi/Tangerang/Surabaya —
// there is no second physical location to geocode.
export const LOCATION_GEO = {
  latitude: -6.9355653,
  longitude: 107.6305958,
} as const

export interface LocationFaqItem {
  question: string
  answer: string
}

export interface LocationConfig {
  slug: string
  cityName: string
  province: string
  /** ISO 3166-2:ID region code (e.g. "JB" for Jawa Barat) — for the `geo.region` meta tag. */
  provinceIsoCode: string
  /** true only for Bandung — the one real physical workshop/showroom. */
  isPrimary: boolean
  heroEyebrow: string
  heroHeadline: string
  heroSubheadline: string
  /** Short, honest paragraph — no fabricated claims about local presence, order counts, or delivery timing this business can't back up. */
  intro: string
  trustStatement: string
  faq: LocationFaqItem[]
  relatedGuides: { category: string; slug: string }[]
}

// Every FAQ answer below is a generalization of facts already established
// elsewhere in this codebase (WhatsApp booking, made-to-order/no-fixed-price
// per src/lib/materials/seo.ts, Digital Body Profile via fitter measurement,
// nationwide delivery implied by shipping a physical garment) — none of it
// asserts a same-day/local-branch capability this business doesn't have.
const SERVES_REMOTELY_FAQ: LocationFaqItem[] = [
  {
    question: 'Apakah saya harus datang langsung ke Bandung untuk memesan?',
    answer:
      'Tidak wajib untuk memulai. Anda bisa menjelajahi pilihan Model, Kerah, Manset, Material, dan Warna di Design Studio secara online, lalu konsultasi awal dilakukan via WhatsApp sebelum jadwal pengukuran ditentukan.',
  },
  {
    question: 'Bagaimana proses pengukuran jika saya di luar Bandung?',
    answer:
      'Pengukuran final untuk produksi tetap dilakukan langsung oleh fitter kami di workshop Bandung untuk memastikan Digital Body Profile Anda akurat — konsultasi dan koordinasi jadwal dilakukan via WhatsApp terlebih dahulu.',
  },
  {
    question: 'Apakah thobe custom bisa dikirim ke luar Bandung?',
    answer: 'Ya, setiap garmen bespoke yang selesai dikirim ke alamat Anda setelah proses quality control selesai.',
  },
]

export const LOCATIONS: LocationConfig[] = [
  {
    slug: 'bandung',
    cityName: 'Bandung',
    province: 'Jawa Barat',
    provinceIsoCode: 'JB',
    isPrimary: true,
    heroEyebrow: 'Bespoke Thobe, Bandung',
    heroHeadline: 'Custom Thobe Bandung — Dijahit di Workshop Kami Sendiri',
    heroSubheadline: 'Workshop dan showroom Local Tailor berada di Buah Batu, Bandung — konsultasi, pengukuran, dan produksi dalam satu tempat.',
    intro:
      'Local Tailor Bandung adalah workshop bespoke tailoring yang berlokasi di Jl. Gamelan No.10, Buah Batu, Bandung. Setiap thobe custom dibuat dari pola yang diformulasikan dari pengukuran tubuh Anda sendiri, dikerjakan langsung oleh tailor kami di workshop ini.',
    trustStatement: 'Satu-satunya lokasi fisik Local Tailor — konsultasi, pengukuran, dan produksi berlangsung di workshop yang sama.',
    faq: [
      {
        question: 'Di mana lokasi workshop Local Tailor di Bandung?',
        answer: 'Workshop dan showroom kami berada di Jl. Gamelan No.10, Buah Batu, Bandung, Jawa Barat.',
      },
      {
        question: 'Apakah saya bisa datang langsung tanpa janji temu?',
        answer: 'Kami melayani dengan sistem Private Appointment — booking terlebih dahulu via WhatsApp agar sesi konsultasi Anda tidak terburu-buru.',
      },
      {
        question: 'Berapa lama proses dari konsultasi sampai thobe selesai?',
        answer: 'Waktu produksi tergantung pilihan material dan kapasitas workshop saat itu — estimasi ditampilkan langsung saat Anda mendesain di Design Studio.',
      },
      ...SERVES_REMOTELY_FAQ.slice(1),
    ],
    relatedGuides: [
      { category: 'measurements', slug: 'how-to-measure-body' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'fabrics', slug: 'egyptian-cotton' },
    ],
  },
  {
    slug: 'jakarta',
    cityName: 'Jakarta',
    province: 'DKI Jakarta',
    provinceIsoCode: 'JK',
    isPrimary: false,
    heroEyebrow: 'Bespoke Thobe, Jakarta',
    heroHeadline: 'Custom Thobe Jakarta — Bespoke Tailoring dari Workshop Bandung',
    heroSubheadline: 'Melayani klien di Jakarta secara remote — konsultasi via WhatsApp, pengukuran dijadwalkan, garmen dikirim langsung ke Anda.',
    intro:
      'Local Tailor melayani klien di Jakarta dari workshop kami di Bandung. Konsultasi awal dan pemilihan desain dilakukan online melalui Design Studio dan WhatsApp, dengan pengukuran final oleh fitter kami sebelum produksi dimulai.',
    trustStatement: 'Dipercaya klien di Jakarta untuk acara formal, pernikahan, hingga umrah — lihat ulasan nyata dari klien kami.',
    faq: SERVES_REMOTELY_FAQ,
    relatedGuides: [
      { category: 'wedding', slug: 'akad-pria' },
      { category: 'umrah', slug: 'best-fabric' },
      { category: 'measurements', slug: 'thobe-size-guide' },
    ],
  },
  {
    slug: 'bekasi',
    cityName: 'Bekasi',
    province: 'Jawa Barat',
    provinceIsoCode: 'JB',
    isPrimary: false,
    heroEyebrow: 'Bespoke Thobe, Bekasi',
    heroHeadline: 'Custom Thobe Bekasi — Bespoke Tailoring dari Workshop Bandung',
    heroSubheadline: 'Melayani klien di Bekasi secara remote — konsultasi via WhatsApp, pengukuran dijadwalkan, garmen dikirim langsung ke Anda.',
    intro:
      'Local Tailor melayani klien di Bekasi dari workshop kami di Bandung. Konsultasi awal dan pemilihan desain dilakukan online melalui Design Studio dan WhatsApp, dengan pengukuran final oleh fitter kami sebelum produksi dimulai.',
    trustStatement: 'Dipercaya klien di Bekasi untuk acara formal, pernikahan, hingga umrah — lihat ulasan nyata dari klien kami.',
    faq: SERVES_REMOTELY_FAQ,
    relatedGuides: [
      { category: 'wedding', slug: 'resepsi-pria' },
      { category: 'umrah', slug: 'how-many-thobes' },
      { category: 'measurements', slug: 'thobe-size-guide' },
    ],
  },
  {
    slug: 'tangerang',
    cityName: 'Tangerang',
    province: 'Banten',
    provinceIsoCode: 'BT',
    isPrimary: false,
    heroEyebrow: 'Bespoke Thobe, Tangerang',
    heroHeadline: 'Custom Thobe Tangerang — Bespoke Tailoring dari Workshop Bandung',
    heroSubheadline: 'Melayani klien di Tangerang secara remote — konsultasi via WhatsApp, pengukuran dijadwalkan, garmen dikirim langsung ke Anda.',
    intro:
      'Local Tailor melayani klien di Tangerang dari workshop kami di Bandung. Konsultasi awal dan pemilihan desain dilakukan online melalui Design Studio dan WhatsApp, dengan pengukuran final oleh fitter kami sebelum produksi dimulai.',
    trustStatement: 'Dipercaya klien di Tangerang untuk acara formal, pernikahan, hingga umrah — lihat ulasan nyata dari klien kami.',
    faq: SERVES_REMOTELY_FAQ,
    relatedGuides: [
      { category: 'umrah', slug: 'climate-guide' },
      { category: 'fabrics', slug: 'linen' },
      { category: 'measurements', slug: 'thobe-size-guide' },
    ],
  },
  {
    slug: 'surabaya',
    cityName: 'Surabaya',
    province: 'Jawa Timur',
    provinceIsoCode: 'JI',
    isPrimary: false,
    heroEyebrow: 'Bespoke Thobe, Surabaya',
    heroHeadline: 'Custom Thobe Surabaya — Bespoke Tailoring dari Workshop Bandung',
    heroSubheadline: 'Melayani klien di Surabaya secara remote — konsultasi via WhatsApp, pengukuran dijadwalkan, garmen dikirim langsung ke Anda.',
    intro:
      'Local Tailor melayani klien di Surabaya dari workshop kami di Bandung. Konsultasi awal dan pemilihan desain dilakukan online melalui Design Studio dan WhatsApp, dengan pengukuran final oleh fitter kami sebelum produksi dimulai.',
    trustStatement: 'Dipercaya klien di Surabaya untuk acara formal, pernikahan, hingga umrah — lihat ulasan nyata dari klien kami.',
    faq: SERVES_REMOTELY_FAQ,
    relatedGuides: [
      { category: 'measurements', slug: 'thobe-size-guide' },
      { category: 'tailoring', slug: 'what-is-bespoke' },
      { category: 'fabrics', slug: 'premium-cotton' },
    ],
  },
]

export function getLocationBySlug(slug: string): LocationConfig | undefined {
  return LOCATIONS.find((location) => location.slug === slug)
}

export function getAllLocationSlugs(): string[] {
  return LOCATIONS.map((location) => location.slug)
}

/** Sibling city pages, for the "Nearby Areas / Other Cities We Serve" cross-link section. */
export function getOtherLocations(currentSlug: string): LocationConfig[] {
  return LOCATIONS.filter((location) => location.slug !== currentSlug)
}
