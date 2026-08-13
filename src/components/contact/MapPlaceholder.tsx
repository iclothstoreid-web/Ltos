import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { CITY_BUSINESS, CITY_MAPS_URL } from '@/lib/seo/cityConfig'

// Sprint W8-B §4 — "Google Maps placeholder block", explicitly requested as
// a structural placeholder (no Google Maps Embed API key is configured in
// this project, and one shouldn't be invented). The "Get Directions" link
// is real, though — CITY_MAPS_URL is a genuine Google Maps search query
// built from the real, verified address, so a visitor still reaches an
// actual map even before a real embed is wired in.
export function MapPlaceholder() {
  return (
    <div role="img" aria-label={`Peta lokasi ${CITY_BUSINESS.name}`} className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-luxury-gold/[0.14]">
      <LuxuryGradientField variant="b" />
      <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Peta Lokasi</p>
        <p className="max-w-xs font-luxury-sans text-sm text-luxury-taupe">{CITY_BUSINESS.streetAddress}</p>
        <a href={CITY_MAPS_URL} target="_blank" rel="noopener noreferrer" className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold underline underline-offset-4">
          Buka di Google Maps
        </a>
      </div>
    </div>
  )
}
