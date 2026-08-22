import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RevenueLandingPage } from '@/components/services/RevenueLandingPage'
import { getLocale } from 'next-intl/server'
import { getServiceBySlug, localizeService } from '@/lib/seo/serviceConfig'
import { buildServiceMetadata } from '@/lib/seo/serviceMetadata'
import { CITY_SITE_ORIGIN } from '@/lib/seo/cityConfig'
import { withLocaleAlternates } from '@/i18n/alternates'

const SLUG = 'custom-baju-koko-bogor'

export async function generateMetadata(): Promise<Metadata> {
  const service = getServiceBySlug(SLUG)
  if (!service) return { title: 'Not Found | Tarda' }
  const locale = await getLocale()
  return withLocaleAlternates(buildServiceMetadata(localizeService(service, locale)), CITY_SITE_ORIGIN, `/${SLUG}`)
}

interface PageProps {
  searchParams: { utm_source?: string; utm_medium?: string; utm_campaign?: string }
}

// Sprint W10 — Revenue Landing Page. Thin route wrapper; all real markup,
// schema, and copy live in RevenueLandingPage.tsx + serviceConfig.ts (see
// those files' own comments for the full reasoning). Kept as a literal
// top-level route (not /services/[slug]) per the brief's explicit URL
// list.
export default function Page({ searchParams }: PageProps) {
  const service = getServiceBySlug(SLUG)
  if (!service) notFound()
  return <RevenueLandingPage service={service} searchParams={searchParams} />
}
