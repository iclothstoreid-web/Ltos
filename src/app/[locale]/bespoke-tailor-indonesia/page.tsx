import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RevenueLandingPage } from '@/components/services/RevenueLandingPage'
import { getLocale } from 'next-intl/server'
import { localizeService } from '@/lib/seo/serviceConfig'
import { getNationalBySlug } from '@/lib/seo/nationalConfig'
import { buildServiceMetadata } from '@/lib/seo/serviceMetadata'
import { CITY_SITE_ORIGIN } from '@/lib/seo/cityConfig'
import { withLocaleAlternates } from '@/i18n/alternates'

const SLUG = 'bespoke-tailor-indonesia'

export async function generateMetadata(): Promise<Metadata> {
  const service = getNationalBySlug(SLUG)
  if (!service) return { title: 'Not Found | Local Tailor' }
  const locale = await getLocale()
  return withLocaleAlternates(buildServiceMetadata(localizeService(service, locale)), CITY_SITE_ORIGIN, `/${SLUG}`)
}

interface PageProps {
  searchParams: { utm_source?: string; utm_medium?: string; utm_campaign?: string }
}

// National SEO — P0-2. The Indonesia-wide commercial/consideration pillar
// for bespoke tailoring. Thin route wrapper; shares RevenueLandingPage.tsx
// + nationalConfig.ts (scope: 'national') with P0-1 and the 5 Bandung
// pages. Literal top-level route per the approved SEO roadmap.
export default function Page({ searchParams }: PageProps) {
  const service = getNationalBySlug(SLUG)
  if (!service) notFound()
  return <RevenueLandingPage service={service} searchParams={searchParams} />
}
