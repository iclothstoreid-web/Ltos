import { FaqSection } from '@/components/seo/FaqSection'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'

interface ServiceFAQProps {
  service: ServiceConfig
}

// Sprint W10 — thin wrapper over the shared FaqSection, same pattern as
// CityFAQ.tsx.
export function ServiceFAQ({ service }: ServiceFAQProps) {
  return <FaqSection items={service.faq} headingId="service-faq-heading" heading={`Pertanyaan Umum — ${service.hero.eyebrow}`} />
}
