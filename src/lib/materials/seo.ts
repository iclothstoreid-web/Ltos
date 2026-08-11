import type { Metadata } from 'next'
import type { FabricMaterial, MaterialColor } from '@/types/material'
import { FABRIC_CATEGORY_LABELS, FABRIC_TEXTURE_LABELS, type FabricCategory } from '@/types/material'

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

// Sprint W3-3 — matches the brief's own worked example:
// "Oxford Cotton Fabric | Premium Cotton for Custom Thobe | Local Tailor"
// (the "| Local Tailor" suffix is appended by buildFabricMetadata itself).
// `qualifier` comes from price_tier when set (Basic/Premium/Luxury), else
// falls back to the generic "Quality" — never fabricated from luxury_level,
// which has no defined vocabulary (see FABRIC_SORT_LABELS.luxury_level's
// comment in types/material.ts).
const PRICE_TIER_QUALIFIER: Record<string, string> = {
  basic: 'Quality',
  premium: 'Premium',
  luxury: 'Luxury',
}

// Sprint W3-4 — `selectedColor` swaps in the brief's own worked example
// ("Oxford Cotton Fabric in Navy | Local Tailor"). `url` (and therefore the
// canonical tag) is always the bare fabric page regardless of the color
// param — "Jangan menghasilkan duplicate canonical. Canonical tetap
// halaman fabric utama" — so every ?color= variant of a material's page
// shares one canonical URL.
export function buildFabricMaterialMetadata(material: FabricMaterial, selectedColor?: MaterialColor | null): Metadata {
  const label = FABRIC_CATEGORY_LABELS[material.category]
  const canonicalUrl = `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}`

  let title: string
  let description: string

  if (selectedColor) {
    title = `${material.name} Fabric in ${selectedColor.name}`
    description = `Explore ${material.name} fabric in ${selectedColor.name}${
      selectedColor.character ? ` — ${selectedColor.character}` : ''
    } for custom thobe tailoring.`
  } else {
    const qualifier = (material.price_tier && PRICE_TIER_QUALIFIER[material.price_tier]) ?? 'Quality'
    title = `${material.name} Fabric | ${qualifier} ${label} for Custom Thobe`

    const descriptionParts = [`Explore ${material.name} fabric`]
    if (material.texture) descriptionParts.push(`with a ${FABRIC_TEXTURE_LABELS[material.texture]} texture`)
    if (material.composition) descriptionParts.push(material.texture ? `and ${material.composition}` : material.composition)
    description = `${descriptionParts.join(' ')} for custom thobe tailoring.`
  }

  return buildFabricMetadata({
    title,
    description,
    url: canonicalUrl,
    image: selectedColor?.reference_image ?? material.hero_image,
  })
}

// schema.org Product — mirrors src/lib/configurator/seo.ts's
// buildDesignProductSchema shape/conventions. No price/availability claim
// (Material Master's `price` column is Inventory-internal, never exposed
// through list_fabric_catalog() — see the SECURITY DEFINER RPC's column
// allowlist), so `offers` is omitted rather than showing a fabricated or
// stale price.
export function buildFabricMaterialProductSchema(material: FabricMaterial) {
  const label = FABRIC_CATEGORY_LABELS[material.category]
  const url = `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: material.name,
    description: material.composition ?? `${label} fabric from ${FABRIC_BRAND_NAME}.`,
    category: `${label} Fabric`,
    url,
    ...(material.hero_image ? { image: [material.hero_image] } : {}),
    brand: {
      '@type': 'Brand',
      name: FABRIC_BRAND_NAME,
    },
  }
}

export function buildFabricMaterialBreadcrumbSchema(material: FabricMaterial) {
  const label = FABRIC_CATEGORY_LABELS[material.category]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Fabric Explorer', item: `${FABRIC_SITE_ORIGIN}/fabric` },
      { '@type': 'ListItem', position: 2, name: label, item: `${FABRIC_SITE_ORIGIN}/fabric/${material.category}` },
      { '@type': 'ListItem', position: 3, name: material.name, item: `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}` },
    ],
  }
}
