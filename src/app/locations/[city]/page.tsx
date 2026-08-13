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
import { BespokeProcessSection } from '@/components/marketing/sections/BespokeProcessSection'
import { FabricHighlight } from '@/components/marketing/sections/FabricHighlight'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schema'
import { buildLocationLocalBusinessSchema } from '@/lib/seo/localBusiness'
import { buildLocationMetadata } from '@/lib/seo/locationMetadata'
import { getAllCitySlugs, getCityBySlug, getOtherCities } from '@/lib/seo/cityConfig'

interface PageProps {
  params: { city: string }
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

export default function LocationPage({ params }: PageProps) {
  const city = getCityBySlug(params.city)
  if (!city) notFound()

  const otherCities = getOtherCities(city.slug)
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
    { name: city.city, path: `/locations/${city.slug}` },
  ]

  return (
    <div className="bg-luxury-navy-deep">
      <JsonLd
        data={[
          buildLocationLocalBusinessSchema(city),
          breadcrumbSchema(breadcrumbItems),
          faqSchema(city.faq),
        ]}
      />
      <Nav />
      <main>
        <CityHero city={city} />
        <div className="mx-auto max-w-6xl px-6 pt-10 md:px-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <CityWhyChoose city={city} />
        <BespokeProcessSection />
        <LocationServices city={city} />
        <FabricHighlight />
        <CityGallery city={city} />
        <CityReviews city={city} />
        <LocationPricing />
        <CityCTA city={city} />
        <LocalTrustSection city={city} />
        <CityFAQ city={city} />
        <CityNearbyAreas city={city} otherCities={otherCities} />
        <CityRelatedGuides city={city} />
      </main>
      <Footer />
    </div>
  )
}
