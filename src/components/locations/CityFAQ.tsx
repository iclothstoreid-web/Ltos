import { FaqSection } from '@/components/seo/FaqSection'
import type { CityConfig } from '@/lib/seo/cityConfig'

interface CityFAQProps {
  city: CityConfig
}

// Sprint W8-2/3 — thin named wrapper over the W7 seo/FaqSection component
// (reused as-is, not duplicated) so the location-page template composes a
// "CityFAQ" per this sprint's component list while the actual FAQ markup
// stays defined in exactly one place.
export function CityFAQ({ city }: CityFAQProps) {
  return <FaqSection items={city.faq} headingId="city-faq-heading" heading={`Pertanyaan Umum — ${city.city}`} />
}
