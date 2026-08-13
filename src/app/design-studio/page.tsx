import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { getConfiguratorCatalog, findOptionByMaterialId, findOptionByDnaColorId } from '@/lib/configurator/mapping'
import { getMaterialBySlug, getMaterialColors } from '@/lib/materials/materialRepository'
import { DesignStudioClient } from '@/components/configurator/DesignStudioClient'
import { buildSimplePageMetadata } from '@/lib/marketing/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { serviceSchema, breadcrumbSchema } from '@/lib/seo/schema'
import { JsonLd } from '@/components/seo/JsonLd'

const DESIGN_STUDIO_DESCRIPTION =
  'Rangkai jubah bespoke Anda — pilih Model, Kerah, Manset, Material, dan Warna, lalu lihat estimasi harga secara langsung.'

// Sprint W7-11 — was a bare { title, description } literal with no
// canonical/OG/Twitter/robots signal, unlike every other marketing page
// (gallery, journal, book-appointment) which already goes through this same
// builder. Bringing it in line closes that metadata gap without changing
// anything about the page's actual content.
export const metadata: Metadata = buildSimplePageMetadata({
  title: 'Design Studio',
  description: DESIGN_STUDIO_DESCRIPTION,
  path: '/design-studio',
})

interface PageProps {
  searchParams: { fabric?: string; color?: string }
}

// Sprint W3-4 §7-8 — Design Studio Deep Link / Preselection. Resolves
// Fabric Explorer's ?fabric=<materials.slug>&color=<dna_colors.slug> into
// this catalog's own option ids server-side (fabric/color have no
// meaning to the client-side configurator catalog on their own — it only
// knows design_master_options ids). A fabric/color slug that exists in
// Material Master but was never linked into the Design Studio catalog
// (no matching material_id/dna_color_id on a 'bahan'/'warna_bahan' option)
// simply resolves to null — DesignStudioClient's normal unselected-state
// behavior, "fallback normal" per the brief. Design Studio's own workflow
// (ConfiguratorPanel, the Zustand store, estimate/save flow) is completely
// unchanged; this only adds two optional initial values.
async function resolveInitialSelection(fabricSlug?: string, colorSlug?: string) {
  if (!fabricSlug) return { initialFabricId: null, initialColorId: null }

  const supabase = createPublicClient()
  const [catalog, material] = await Promise.all([
    getConfiguratorCatalog(supabase),
    getMaterialBySlug(supabase, fabricSlug),
  ])

  if (!material) return { initialFabricId: null, initialColorId: null }

  const fabricOption = findOptionByMaterialId(catalog.fields.fabricId, material.id)
  if (!fabricOption) return { initialFabricId: null, initialColorId: null }

  if (!colorSlug) return { initialFabricId: fabricOption.id, initialColorId: null }

  // A color only has meaning in context of this specific material (same
  // as Fabric Explorer's own ?color=) — resolved against this material's
  // real available colors, not the flat DNA Color list.
  const materialColors = await getMaterialColors(supabase, material.id)
  const dnaColorId = materialColors.find((c) => c.slug === colorSlug)?.dna_color_id ?? null
  const colorOption = findOptionByDnaColorId(catalog.fields.colorId, dnaColorId)

  return { initialFabricId: fabricOption.id, initialColorId: colorOption?.id ?? null }
}

// Sprint W2-1 foundation — public configurator, distinct from the internal
// Fitter-facing Design Studio at /workspace/design-studio (untouched by
// this sprint). Catalog data is fetched client-side from
// GET /api/design/options, which is the only thing that reads Master Data
// (via the integration layer, src/lib/configurator/mapping.ts).
export default async function DesignStudioPage({ searchParams }: PageProps) {
  const { initialFabricId, initialColorId } = await resolveInitialSelection(searchParams.fabric, searchParams.color)

  // Sprint W7-3/W7-6 — Service + Breadcrumb JSON-LD only, no visible markup
  // change: this page is a fixed-viewport configurator tool
  // (DesignStudioClient's own layout owns h-screen panels), so a visible
  // breadcrumb bar or FAQ block doesn't belong here without redesigning
  // that layout, which this sprint is explicitly not doing.
  const service = serviceSchema({
    name: 'Bespoke Tailoring Service',
    description: DESIGN_STUDIO_DESCRIPTION,
    url: `${FABRIC_SITE_ORIGIN}/design-studio`,
    serviceType: 'Bespoke Tailoring',
  })
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Design Studio', path: '/design-studio' },
  ])

  return (
    <>
      <JsonLd data={[service, breadcrumb]} />
      <DesignStudioClient initialFabricId={initialFabricId} initialColorId={initialColorId} />
    </>
  )
}
