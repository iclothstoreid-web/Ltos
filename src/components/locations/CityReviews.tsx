import { ReviewsSection } from '@/components/marketing/sections/ReviewsSection'
import type { CityConfig } from '@/lib/seo/cityConfig'

interface CityReviewsProps {
  city: CityConfig
}

// Sprint W8-2/3 — thin wrapper over the real ReviewsSection (reusing its
// actual real review content, per this project's "no fabricated
// testimonials" standard) rather than a new component with duplicate
// markup. `highlightReviewId` surfaces the one real review that actually
// matches this city first, if one exists (cityConfig.ts's
// `reviewHighlightIds`); cities with no real matching review (Bekasi,
// Tangerang) simply render the same 3 real reviews in their original order
// — never a fabricated per-city testimonial.
export function CityReviews({ city }: CityReviewsProps) {
  return <ReviewsSection ctaHref="/gallery" highlightReviewId={city.reviewHighlightIds[0]} />
}
