import { ReviewsSection } from '@/components/marketing/sections/ReviewsSection'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'

interface ServiceReviewsProps {
  service: ServiceConfig
}

// Sprint W10 — thin wrapper over the real ReviewsSection (same real review
// content, no fabricated per-page testimonials), same pattern as
// CityReviews.tsx.
export function ServiceReviews({ service }: ServiceReviewsProps) {
  return <ReviewsSection ctaHref="/gallery" highlightReviewId={service.reviewHighlightIds[0]} />
}
