import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RevenueLandingPage } from '@/components/services/RevenueLandingPage'
import { getServiceBySlug } from '@/lib/seo/serviceConfig'
import { buildServiceMetadata } from '@/lib/seo/serviceMetadata'

const SLUG = 'jahit-thobe-bandung'

export function generateMetadata(): Metadata {
  const service = getServiceBySlug(SLUG)
  if (!service) return { title: 'Not Found | Local Tailor' }
  return buildServiceMetadata(service)
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
