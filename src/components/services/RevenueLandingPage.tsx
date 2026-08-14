import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'
import { WalnutGrainOverlay } from '@/components/marketing/shell/WalnutGrainOverlay'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { breadcrumbSchema, faqSchema, organizationSchema, websiteSchema, serviceSchema } from '@/lib/seo/schema'
import { buildServiceLocalBusinessSchema, SERVICE_AREA_NAMES } from '@/lib/seo/serviceBusinessSchema'
import { CITY_SITE_ORIGIN } from '@/lib/seo/cityConfig'
import { parseUtmParams } from '@/lib/seo/utm'
import type { ServiceConfig } from '@/lib/seo/serviceConfig'
import { ServiceHero } from './ServiceHero'
import { ServiceValueProps } from './ServiceValueProps'
import { ServiceGallery } from './ServiceGallery'
import { ServiceFAQ } from './ServiceFAQ'
import { ServiceReviews } from './ServiceReviews'
import { ServiceCTA } from './ServiceCTA'
import { ServiceStickyWhatsApp } from './ServiceStickyWhatsApp'
import { ServiceRelatedLinks } from './ServiceRelatedLinks'
import { BespokeProcessSection } from '@/components/marketing/sections/BespokeProcessSection'
import { LocationPricing } from '@/components/locations/LocationPricing'
import { GoogleReviewCTA } from '@/components/reviews/GoogleReviewCTA'
import { EventOnMount } from '@/components/analytics/EventOnMount'
import { FunnelStepOnMount } from '@/components/analytics/FunnelStepOnMount'
import { GA4_EVENTS } from '@/lib/analytics/events'

interface RevenueLandingPageProps {
  service: ServiceConfig
  searchParams?: { utm_source?: string; utm_medium?: string; utm_campaign?: string }
}

// Sprint W10 — one shared template composing all 8 required sections
// (Hero, Value Proposition, Portfolio Gallery, Bespoke Process, Pricing
// Expectation, FAQ, Testimonial, WhatsApp CTA) + full schema set, driven
// entirely by a ServiceConfig. Same "one template, one config array, zero
// per-page markup duplication" pattern as src/app/locations/[city]/
// page.tsx — the difference is these 5 pages need literal top-level URLs
// (/bespoke-tailor-bandung, not /services/[slug]), so each gets its own
// thin route file instead of one generateStaticParams-driven dynamic
// route; this component is what keeps that from meaning 5x duplicated
// page bodies.
export function RevenueLandingPage({ service, searchParams }: RevenueLandingPageProps) {
  const utm = parseUtmParams(searchParams)
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: service.hero.eyebrow, path: `/${service.slug}` },
  ]
  const pageUrl = `${CITY_SITE_ORIGIN}/${service.slug}`

  return (
    <div className="bg-luxury-navy-deep">
      <JsonLd
        data={[
          buildServiceLocalBusinessSchema(service),
          breadcrumbSchema(breadcrumbItems),
          faqSchema(service.faq),
          organizationSchema(),
          websiteSchema(),
          serviceSchema({
            name: service.hero.eyebrow,
            description: service.hero.subheadline,
            url: pageUrl,
            serviceType: 'Bespoke Tailoring',
            areaServed: SERVICE_AREA_NAMES.join(', '),
          }),
        ]}
      />
      {/* Sprint W10 — Conversion Engine: funnel_step + a named page-view
          event, same taxonomy trackFunnelStep()/EventOnMount() Sprint W9-1
          already established for /fabric, /gallery, etc. 'consultation' is
          the closest existing WEBSITE_FUNNEL_STEPS entry for a commercial
          landing page whose whole purpose is driving a WhatsApp
          consultation. */}
      <FunnelStepOnMount step="consultation" />
      <EventOnMount eventName={GA4_EVENTS.pageView} params={{ landing_page: service.slug }} pageType="landing" />
      <Nav />
      <main>
        <ServiceHero service={service} utm={utm} />
        <div className="mx-auto max-w-6xl px-6 pt-10 md:px-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <ServiceValueProps service={service} />
        <BespokeProcessSection />
        <ServiceGallery service={service} />
        <ServiceReviews service={service} />
        <GoogleReviewCTA city="Bandung" />
        <LocationPricing />
        <ServiceCTA service={service} utm={utm} />
        <ServiceFAQ service={service} />
        <ServiceRelatedLinks service={service} />
      </main>
      <Footer />
      <ServiceStickyWhatsApp service={service} utm={utm} />
      <WalnutGrainOverlay />
    </div>
  )
}
