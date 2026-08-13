import { CITY_BUSINESS, CITY_GEO_BANDUNG, CITY_MAPS_URL } from '@/lib/seo/cityConfig'

// Sprint W8-B §4 — Local Citation Infrastructure. A structured NAP+profile
// object shaped for the fields real citation platforms (Google Business
// Profile, Apple Maps Connect, Bing Places, Yellow Pages, and similar
// directories) all ask for, so submitting to any of them later is a
// copy/paste from one place rather than re-typing the address by hand each
// time. Every field pulls from CITY_BUSINESS/CITY_GEO_BANDUNG in
// cityConfig.ts — the same single source of truth every location page's
// schema, metadata, and CTAs already use (Sprint W8-1/8-2/8-3) — except
// `hoursOfOperation`, which is explicitly a placeholder (see comment below)
// and `socialProfiles`, which is genuinely empty (no social presence exists
// yet — see src/lib/seo/entities.ts's identical reasoning).

export interface CitationHours {
  day: string
  hours: string
}

export interface CitationData {
  businessName: string
  legalName: string
  description: string
  /** Business category strings, matching common directory taxonomies (Google Business "primary/secondary category", Bing Places "business category"). */
  categories: string[]
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  phoneInternational: string
  website: string
  hoursOfOperation: CitationHours[]
  geo: { latitude: number; longitude: number }
  mapsUrl: string
  socialProfiles: string[]
}

// TODO_REAL_DATA — placeholder operating hours, explicitly permitted as a
// placeholder by this sprint's brief ("jam operasional placeholder jika
// belum ada"). Replace with the real schedule before submitting this data
// to any citation platform — an incorrect public "open" claim is worse than
// no listing at all.
const PLACEHOLDER_HOURS: CitationHours[] = [
  { day: 'Senin – Jumat', hours: '09:00 – 17:00 WIB' },
  { day: 'Sabtu', hours: '09:00 – 15:00 WIB' },
  { day: 'Minggu', hours: 'Tutup' },
]

export const LOCAL_TAILOR_CITATION: CitationData = {
  businessName: CITY_BUSINESS.name,
  legalName: CITY_BUSINESS.name,
  description:
    'Local Tailor Bandung adalah bespoke tailoring house di Bandung, Indonesia, mengkhususkan diri pada custom thobe dan premium Muslim menswear — setiap garmen dibuat dari pola personal, bukan ukuran standar.',
  categories: ['Tailor', 'Custom Clothing Store', 'Bespoke Tailor'],
  address: {
    streetAddress: CITY_BUSINESS.streetAddress,
    addressLocality: CITY_BUSINESS.addressLocality,
    addressRegion: CITY_BUSINESS.addressRegion,
    postalCode: CITY_BUSINESS.postalCode,
    addressCountry: CITY_BUSINESS.addressCountry,
  },
  phoneInternational: `+${CITY_BUSINESS.whatsappInternational}`,
  website: CITY_BUSINESS.website,
  hoursOfOperation: PLACEHOLDER_HOURS,
  geo: CITY_GEO_BANDUNG,
  mapsUrl: CITY_MAPS_URL,
  socialProfiles: [],
}

/** Pretty-printed JSON, ready to paste into a citation platform's bulk-import field or hand-fill form. */
export function citationToJSON(): string {
  return JSON.stringify(LOCAL_TAILOR_CITATION, null, 2)
}
