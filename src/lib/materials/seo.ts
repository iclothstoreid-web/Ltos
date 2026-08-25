import type { Metadata } from 'next'
import type { FabricFaqItem, FabricMaterial, MaterialColor } from '@/types/material'
import { FABRIC_CATEGORY_LABELS, FABRIC_TEXTURE_LABELS, type FabricCategory } from '@/types/material'

// Static origin, not headers()-derived — src/app/design/[slug]/page.tsx
// reads headers() for its origin, but that route is fully dynamic. This
// sprint's routes need generateStaticParams() (real Static Generation), and
// calling headers() would opt them out of that entirely.
//
// Production Domain Migration audit — this is the one, real source of
// truth for the public Local Tailor marketing/SEO surface: every
// canonical, OG URL, hreflang alternate, JSON-LD schema, and the sitemap/
// robots routes (30 files total) import this constant rather than
// hardcoding a domain of their own. src/lib/marketing/seo.ts's BUSINESS.url
// now imports this directly instead of duplicating the literal — previously
// the two could silently drift, which is exactly how this constant was
// still pointing at the pre-custom-domain Vercel URL after production
// moved to localtailor.id (verified live + in Search Console via DNS).
// Not to be confused with TARDA_CONFIG.canonicalDomain in
// src/lib/brand/config.ts, which is the separate Tarda brand's own login
// app domain and is intentionally untouched by this migration.
export const FABRIC_SITE_ORIGIN = 'https://localtailor.id'

// Mirrors the shape of src/lib/configurator/seo.ts's buildDesignMetadata —
// same brand constant/OG conventions, scoped to the Fabric Explorer.
//
// Brand & Location Correction — the public Local Tailor site's brand
// identity is "Local Tailor", not "Tarda" (Tarda is a separate brand/app,
// see src/lib/brand/config.ts's TARDA_CONFIG, untouched by this correction).
export const FABRIC_BRAND_NAME = 'Local Tailor'

// Sprint W3-5 §10 — every gallery/hero photo on this route is a portrait
// (aspect-[4/5] everywhere in the fabric components), so a fixed 1200x1500
// is the real, honest dimension for every OG image this module ever emits
// — not a generic 1200x630 landscape placeholder that would misrepresent
// the actual asset.
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 1500

export function buildFabricMetadata(params: {
  title: string
  description: string
  url: string
  image?: string | null
  imageAlt?: string
}): Metadata {
  const title = `${params.title} | ${FABRIC_BRAND_NAME}`
  const images = params.image
    ? [{ url: params.image, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: params.imageAlt ?? params.title }]
    : undefined
  return {
    title,
    description: params.description,
    alternates: {
      canonical: params.url,
    },
    // §12 — explicit affirmative index/follow signal for every canonical
    // fabric page (Explorer hub, category pages, material detail pages).
    // Query-parameterized requests to /fabric and /fabric/[category] never
    // reach this differently — their metadata is generated without regard
    // to searchParams, so every ?search=/?category=/etc. variation resolves
    // to this exact same canonical + robots signal, which is Google's own
    // recommended fix for parameter-based duplicate content.
    robots: {
      index: true,
      follow: true,
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
    }, available DNA colors, and direct customization in Design Studio.`
  } else {
    const qualifier = (material.price_tier && PRICE_TIER_QUALIFIER[material.price_tier]) ?? 'Quality'
    title = `${material.name} Fabric | ${qualifier} ${label} for Custom Thobe`

    const descriptionParts = [`Explore ${material.name} fabric`]
    if (material.texture) descriptionParts.push(`with a ${FABRIC_TEXTURE_LABELS[material.texture]} texture`)
    if (material.composition) descriptionParts.push(material.texture ? `and ${material.composition}` : material.composition)
    description = `${descriptionParts.join(' ')}, available DNA colors, and direct customization in Design Studio.`
  }

  return buildFabricMetadata({
    title,
    description,
    url: canonicalUrl,
    image: selectedColor?.reference_image ?? material.hero_image,
    imageAlt: selectedColor ? `${material.name} in ${selectedColor.name}` : material.name,
  })
}

// Sprint W3-5 §1 — full Product schema: name/description/category/material/
// brand/image/color/additionalProperty/offers/url. `material` (the
// schema.org property) carries composition as free text, same as most
// fabric-retail Product markup does absent a formal Wikidata fiber
// taxonomy. `color` reflects whichever color is currently displayed
// (selected, or the primary/first if none selected) — omitted entirely
// when the material has no colors yet.
//
// `offers` deliberately carries no `price`/`priceCurrency`: Material
// Master's `price` column is Inventory-internal and is never exposed
// through list_fabric_catalog()'s column allowlist (see W3-1's migration
// comment) — every bespoke garment is made-to-order and quoted per
// consultation, not sold off a fixed public price list, so a numeric price
// here would be either fabricated or a stale approximation. `availability:
// PreOrder` mirrors src/lib/configurator/seo.ts's buildDesignProductSchema,
// which makes the exact same call for the exact same made-to-order reason.
// This forfeits Google Shopping-style rich-result price eligibility but
// keeps the schema honest — and price isn't what the brief's stated
// audience (AI Overview, Gemini, Perplexity, ChatGPT) actually needs to
// understand and recommend the fabric.
export function buildFabricMaterialProductSchema(material: FabricMaterial, displayedColor?: MaterialColor | null) {
  const label = FABRIC_CATEGORY_LABELS[material.category]
  const url = `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}`

  const additionalProperty = [
    material.texture ? { '@type': 'PropertyValue', name: 'Texture', value: FABRIC_TEXTURE_LABELS[material.texture] } : null,
    material.weight_gsm != null ? { '@type': 'PropertyValue', name: 'Weight', value: `${material.weight_gsm} GSM` } : null,
    material.breathability ? { '@type': 'PropertyValue', name: 'Breathability', value: material.breathability } : null,
    material.wrinkle_resistance ? { '@type': 'PropertyValue', name: 'Wrinkle Resistance', value: material.wrinkle_resistance } : null,
    material.luxury_level ? { '@type': 'PropertyValue', name: 'Luxury Level', value: material.luxury_level } : null,
    material.season ? { '@type': 'PropertyValue', name: 'Season', value: material.season.replace('_', ' ') } : null,
  ].filter((p): p is { '@type': string; name: string; value: string } => p !== null)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: material.name,
    description: material.composition ?? `${label} fabric from ${FABRIC_BRAND_NAME}.`,
    category: `${label} Fabric`,
    url,
    ...(material.hero_image ? { image: [material.hero_image] } : {}),
    ...(material.composition ? { material: material.composition } : {}),
    ...(displayedColor ? { color: displayedColor.name } : {}),
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
    brand: {
      '@type': 'Brand',
      name: FABRIC_BRAND_NAME,
    },
    offers: {
      '@type': 'Offer',
      url,
      availability: 'https://schema.org/PreOrder',
      businessFunction: 'https://schema.org/ProvideService',
    },
  }
}

// Sprint W3-5 §3 — full Home > Fabric Explorer > Category > Material
// hierarchy (§3's requirement), synced 1:1 with the visible breadcrumb
// <nav> in the detail page — same labels, same hrefs, same order.
export function buildFabricMaterialBreadcrumbSchema(material: FabricMaterial) {
  const label = FABRIC_CATEGORY_LABELS[material.category]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: FABRIC_SITE_ORIGIN },
      { '@type': 'ListItem', position: 2, name: 'Fabric Explorer', item: `${FABRIC_SITE_ORIGIN}/fabric` },
      { '@type': 'ListItem', position: 3, name: label, item: `${FABRIC_SITE_ORIGIN}/fabric/${material.category}` },
      { '@type': 'ListItem', position: 4, name: material.name, item: `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}` },
    ],
  }
}

// Category landing pages get the same hierarchy, one level shallower
// (Home > Fabric Explorer > Category) — synced with the category page's
// own visible breadcrumb <nav>.
export function buildFabricCategoryBreadcrumbSchema(category: FabricCategory) {
  const label = FABRIC_CATEGORY_LABELS[category]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: FABRIC_SITE_ORIGIN },
      { '@type': 'ListItem', position: 2, name: 'Fabric Explorer', item: `${FABRIC_SITE_ORIGIN}/fabric` },
      { '@type': 'ListItem', position: 3, name: label, item: `${FABRIC_SITE_ORIGIN}/fabric/${category}` },
    ],
  }
}

// Sprint W3-5 §2 — FAQPage schema, built from the exact same FAQ items
// (getMaterialFaq()) the visible FAQ section on the page renders — schema
// and UI can never drift apart since they share one source.
export function buildFabricFaqSchema(faqItems: FabricFaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
