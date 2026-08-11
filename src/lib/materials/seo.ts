import type { Metadata } from 'next'
import type { FabricMaterial } from '@/types/material'
import { FABRIC_CATEGORY_LABELS, type FabricCategory } from '@/types/material'

// Static origin, not headers()-derived — src/app/design/[slug]/page.tsx
// reads headers() for its origin, but that route is fully dynamic. This
// sprint's routes need generateStaticParams() (real Static Generation), and
// calling headers() would opt them out of that entirely. Matches
// src/lib/marketing/seo.ts's BUSINESS.url convention instead.
export const FABRIC_SITE_ORIGIN = 'https://ltos-local-tailor.vercel.app'

// Mirrors the shape of src/lib/configurator/seo.ts's buildDesignMetadata —
// same brand constant/OG conventions, scoped to the Fabric Explorer.
export const FABRIC_BRAND_NAME = 'Local Tailor'

export function buildFabricMetadata(params: { title: string; description: string; url: string; image?: string | null }): Metadata {
  const title = `${params.title} | ${FABRIC_BRAND_NAME}`
  const images = params.image ? [{ url: params.image }] : undefined
  return {
    title,
    description: params.description,
    alternates: {
      canonical: params.url,
    },
    openGraph: {
      title,
      description: params.description,
      url: params.url,
      siteName: FABRIC_BRAND_NAME,
      type: 'website',
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description: params.description,
      images: params.image ? [params.image] : undefined,
    },
  }
}

export function buildFabricExplorerMetadata(): Metadata {
  return buildFabricMetadata({
    title: 'Fabric Explorer',
    description: 'Jelajahi koleksi material bespoke Local Tailor — komposisi, tekstur, dan karakteristik setiap kain.',
    url: `${FABRIC_SITE_ORIGIN}/fabric`,
  })
}

export function buildFabricCategoryMetadata(category: FabricCategory): Metadata {
  const label = FABRIC_CATEGORY_LABELS[category]
  return buildFabricMetadata({
    title: `${label} Fabrics`,
    description: `Koleksi material ${label} — komposisi, tekstur, dan karakteristik untuk bespoke thobe Anda.`,
    url: `${FABRIC_SITE_ORIGIN}/fabric/${category}`,
  })
}

export function buildFabricMaterialMetadata(material: FabricMaterial): Metadata {
  const label = FABRIC_CATEGORY_LABELS[material.category]
  const description = material.composition
    ? `${material.name} — ${label}, ${material.composition}.`
    : `${material.name} — koleksi material ${label} dari Local Tailor.`
  return buildFabricMetadata({
    title: material.name,
    description,
    url: `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}`,
    image: material.hero_image,
  })
}
