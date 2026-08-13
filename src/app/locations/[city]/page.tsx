import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/marketing/shell/Nav'
import { Footer } from '@/components/marketing/shell/Footer'
import { CityHero } from '@/components/locations/CityHero'
import { CityWhyChoose } from '@/components/locations/CityWhyChoose'
import { LocationServices } from '@/components/locations/LocationServices'
import { CityGallery } from '@/components/locations/CityGallery'
import { CityReviews } from '@/components/locations/CityReviews'
import { LocationPricing } from '@/components/locations/LocationPricing'
import { CityCTA } from '@/components/locations/CityCTA'
import { LocalTrustSection } from '@/components/locations/LocalTrustSection'
import { CityFAQ } from '@/components/locations/CityFAQ'
import { CityNearbyAreas } from '@/components/locations/CityNearbyAreas'
import { CityRelatedGuides } from '@/components/locations/CityRelatedGuides'
import { CityStickyWhatsApp } from '@/components/locations/CityStickyWhatsApp'
import { AppointmentForm } from '@/components/locations/AppointmentForm'
import { GoogleReviewCTA } from '@/components/reviews/GoogleReviewCTA'
import { BespokeProcessSection } from '@/components/marketing/sections/BespokeProcessSection'
import { FabricHighlight } from '@/components/marketing/sections/FabricHighlight'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { breadcrumbSchema, faqSchema, organizationSchema, websiteSchema, serviceSchema } from '@/lib/seo/schema'
import { buildLocationLocalBusinessSchema } from '@/lib/seo/localBusiness'
import { buildLocationMetadata } from '@/lib/seo/locationMetadata'
import { getAllCitySlugs, getCityBySlug, getOtherCities, CITY_SITE_ORIGIN } from '@/lib/seo/cityConfig'
import { parseUtmParams } from '@/lib/seo/utm'

interface PageProps {
  params: { city: string }
  searchParams: { utm_source?: string; utm_medium?: string; utm_campaign?: string }
}

// Sprint W8-1 foundation, rebuilt as a data-driven engine in W8-2/3 — one
// dynamic route drives every city page, including Bandung's fuller
// "domination page" treatment (same template, richer cityConfig.ts entry —
// no Bandung-specific branching in this file). Adding city #6+ requires
// exactly one CITY_CONFIGS entry; generateStaticParams already derives
// every route from it, so no new route file and no new component are ever
// needed to scale this to 100+ cities.
export function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps): Metadata {
  const city = getCityBySlug(params.city)
  if (!city) return { title: 'Location Not Found | Local Tailor' }
  return buildLocationMetadata(city)
}

export default function LocationPage({ params, searchParams }: PageProps) {
  const city = getCityBySlug(params.city)
  if (!city) notFound()

  const utm = parseUtmParams(searchParams)
  const otherCities = getOtherCities(city.slug)
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
    { name: city.city, path: `/locations/${city.slug}` },
  ]
  const pageUrl = `${CITY_SITE_ORIGIN}/locations/${city.slug}`

  return (
    <div className="bg-luxury-navy-deep">
      {/* Sprint W8-B §2 — Schema Expansion. Tailor/BreadcrumbList/FAQPage
          already shipped in W8-1/8-2/3; Organization/WebSite/Service added
          here so every location page carries the full set the brief asks
          for, reusing the exact same W7 builders the homepage already uses
          (organizationSchema/websiteSchema — no sameAs/logo/SearchAction,
          same honesty reasoning as the homepage) rather than inventing
          location-specific variants. */}
      <JsonLd
        data={[
          buildLocationLocalBusinessSchema(city),
          breadcrumbSchema(breadcrumbItems),
          faqSchema(city.faq),
          organizationSchema(),
          websiteSchema(),
          serviceSchema({
            name: 'Bespoke Tailoring Service',
            description: city.hero.subheadline,
            url: pageUrl,
            serviceType: 'Bespoke Tailoring',
            areaServed: city.city,
          }),
        ]}
      />
      <Nav />
      <main>
        <CityHero city={city} utm={utm} />
        <div className="mx-auto max-w-6xl px-6 pt-10 md:px-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <CityWhyChoose city={city} />
        <BespokeProcessSection />
        <LocationServices city={city} />
        <FabricHighlight />
        <CityGallery city={city} />
        <CityReviews city={city} />
        <GoogleReviewCTA city={city.city} />
        <LocationPricing />
        <CityCTA city={city} utm={utm} />
        <AppointmentForm city={city} utm={utm} />
        <LocalTrustSection city={city} />
        <CityFAQ city={city} />
        <CityNearbyAreas city={city} otherCities={otherCities} />
        <CityRelatedGuides city={city} />
      </main>
      <Footer />
      <CityStickyWhatsApp city={city} utm={utm} />
    </div>
  )
}
