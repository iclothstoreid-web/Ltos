import type { Metadata } from 'next'
import type { ConfiguratorOption, Estimate } from '@/types/configurator'
import { formatRupiah } from '@/lib/format/money'

// Local brand constant scoped to the configurator share page — deliberately
// not importing from src/lib/marketing/seo.ts (the header/nav already uses
// the real current brand, see src/lib/marketing/copy.ts's navCopy.brand).
// Keep these two in sync if either file's brand constant changes again.
// LTOS is single-brand: public Local Tailor identity.
export const DESIGN_BRAND_NAME = 'Local Tailor'

// "Belum perlu image rendering dinamis" — static placeholder only. A later
// sprint can render an actual composited preview via next/og.
export const DESIGN_OG_IMAGE_PATH = '/mannequin/mannequin.webp'

export interface ResolvedDesignSelection {
  model: ConfiguratorOption | null
  collar: ConfiguratorOption | null
  cuff: ConfiguratorOption | null
  fabric: ConfiguratorOption | null
  color: ConfiguratorOption | null
  pocket: ConfiguratorOption | null
  placket: ConfiguratorOption | null
  zigzag: ConfiguratorOption | null
  embroidery: ConfiguratorOption | null
}

// "Custom Navy Premium Thobe | Local Tailor" — Color + Fabric lead, Model
// as fallback when neither is picked yet.
export function buildDesignTitle(selection: ResolvedDesignSelection): string {
  const descriptors = [selection.color?.name, selection.fabric?.name].filter((v): v is string => !!v)
  const base = descriptors.length > 0 ? `Custom ${descriptors.join(' ')} Thobe` : selection.model ? `Custom ${selection.model.name}` : 'Custom Bespoke Thobe'
  return `${base} | ${DESIGN_BRAND_NAME}`
}

export function buildDesignDescription(selection: ResolvedDesignSelection, estimate: Estimate): string {
  const parts: string[] = []
  parts.push(`Desain bespoke ${selection.model?.name ?? 'thobe'}`)
  if (selection.fabric) parts.push(`material ${selection.fabric.name}`)
  if (selection.color) parts.push(`warna ${selection.color.name}`)
  if (selection.collar) parts.push(`kerah ${selection.collar.name}`)
  if (selection.pocket) parts.push(`saku ${selection.pocket.name}`)
  if (selection.placket) parts.push(`plaket ${selection.placket.name}`)
  if (selection.embroidery) parts.push(`bordir ${selection.embroidery.name}`)
  if (selection.zigzag) parts.push(`handmade zig-zag ${selection.zigzag.name}`)
  const summary = parts.join(', ')
  return `${summary}. Estimasi ${formatRupiah(estimate.total)}, selesai dalam ${estimate.productionDays} hari kerja.`
}

export function buildDesignMetadata(params: { title: string; description: string; url: string }): Metadata {
  return {
    title: params.title,
    description: params.description,
    alternates: {
      canonical: params.url,
    },
    openGraph: {
      title: params.title,
      description: params.description,
      url: params.url,
      siteName: DESIGN_BRAND_NAME,
      type: 'website',
      images: [{ url: DESIGN_OG_IMAGE_PATH }],
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      images: [DESIGN_OG_IMAGE_PATH],
    },
  }
}

// schema.org Product — PreOrder availability since every item here is
// made-to-order, never stocked.
export function buildDesignProductSchema(params: { title: string; description: string; url: string; estimate: Estimate }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.title,
    description: params.description,
    category: 'Bespoke Thobe',
    brand: {
      '@type': 'Brand',
      name: DESIGN_BRAND_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: params.url,
      priceCurrency: params.estimate.currency,
      price: params.estimate.total,
      availability: 'https://schema.org/PreOrder',
    },
  }
}

export function buildDesignBreadcrumbSchema(params: { origin: string; title: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: params.origin },
      { '@type': 'ListItem', position: 2, name: 'Design Studio', item: `${params.origin}/design-studio` },
      { '@type': 'ListItem', position: 3, name: params.title, item: params.url },
    ],
  }
}
