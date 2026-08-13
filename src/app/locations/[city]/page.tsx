import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'
import { LocationHero } from '@/components/locations/LocationHero'
import { LocalTrustSection } from '@/components/locations/LocalTrustSection'
import { LocationServices } from '@/components/locations/LocationServices'
import { LocationPricing } from '@/components/locations/LocationPricing'
import { LocationAppointmentCta } from '@/components/locations/LocationAppointmentCta'
import { NearbyAreas } from '@/components/locations/NearbyAreas'
import { RelatedGuides } from '@/components/locations/RelatedGuides'
import { BespokeProcessSection } from '@/components/marketing/sections/BespokeProcessSection'
import { FabricHighlight } from '@/components/marketing/sections/FabricHighlight'
import { ReviewsSection } from '@/components/marketing/sections/ReviewsSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { FaqSection } from '@/components/seo/FaqSection'
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schema'
import { buildLocationLocalBusinessSchema } from '@/lib/seo/localBusiness'
import { buildLocationMetadata } from '@/lib/seo/locationMetadata'
import { getAllLocationSlugs, getLocationBySlug, getOtherLocations } from '@/lib/seo/locations'

interface PageProps {
  params: { city: string }
}

// Sprint W8-1 — one dynamic route drives all 5 city pages (the "reusable
// location page template" the brief asks for), matching the established
// pattern from src/app/knowledge/[category]/[slug]/page.tsx and
// src/app/fabric/[category]/[slug]/page.tsx rather than 5 hand-copied page
// files.
export function generateStaticParams() {
  return getAllLocationSlugs().map((city) => ({ city }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps): Metadata {
  const location = getLocationBySlug(params.city)
  if (!location) return { title: 'Location Not Found | Local Tailor' }
  return buildLocationMetadata(location)
}

export default function LocationPage({ params }: PageProps) {
  const location = getLocationBySlug(params.city)
  if (!location) notFound()

  const otherLocations = getOtherLocations(location.slug)
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
    { name: location.cityName, path: `/locations/${location.slug}` },
  ]

  return (
    <div className="bg-luxury-navy-deep">
      <JsonLd
        data={[
          buildLocationLocalBusinessSchema(location),
          breadcrumbSchema(breadcrumbItems),
          faqSchema(location.faq),
        ]}
      />
      <Nav />
      <main>
        <LocationHero location={location} />
        <div className="mx-auto max-w-6xl px-6 pt-10 md:px-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <LocalTrustSection location={location} />
        <BespokeProcessSection />
        <LocationServices location={location} />
        <FabricHighlight />
        <ReviewsSection ctaHref="/gallery" />
        <LocationPricing />
        <LocationAppointmentCta location={location} />
        <FaqSection items={location.faq} headingId="location-faq-heading" heading={`Pertanyaan Umum — ${location.cityName}`} />
        <NearbyAreas otherLocations={otherLocations} />
        <RelatedGuides location={location} />
      </main>
      <Footer />
    </div>
  )
}
