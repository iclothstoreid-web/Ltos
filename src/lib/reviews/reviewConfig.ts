import { CITY_BUSINESS, CITY_MAPS_URL } from '@/lib/seo/cityConfig'

// Sprint W8-B §5 — Review Engine configuration.
//
// TODO_REAL_DATA — GOOGLE_REVIEW_URL is a placeholder, explicitly permitted
// as one by this sprint's brief ("Siapkan review link configuration
// (placeholder URL)"). It currently points at the same real Google Maps
// search query CITY_MAPS_URL already uses (a genuine, working link to the
// real address) rather than a fabricated `writereview?placeid=...` URL —
// Google's direct "write a review" deep link requires a real Place ID from
// a claimed, verified Google Business Profile, which doesn't exist yet.
// Once that profile is claimed, replace this constant with the real
// `https://search.google.com/local/writereview?placeid=<real place id>`
// link — every component below reads from this one constant, so that's the
// only place the swap needs to happen.
export const GOOGLE_REVIEW_URL = CITY_MAPS_URL

export function buildWhatsAppReviewRequestMessage(params: { customerFirstName?: string } = {}): string {
  const greeting = params.customerFirstName ? `Halo ${params.customerFirstName}` : 'Halo'
  return `${greeting}, terima kasih sudah mempercayakan thobe custom Anda ke ${CITY_BUSINESS.name}. Jika berkenan, kami akan sangat senang jika Anda meluangkan waktu sebentar untuk memberi ulasan di Google — ini sangat membantu klien lain menemukan kami: ${GOOGLE_REVIEW_URL}`
}
