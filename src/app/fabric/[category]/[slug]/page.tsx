import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { getAllMaterials, getMaterialBySlug } from '@/lib/materials/materialRepository'
import { buildFabricMaterialMetadata } from '@/lib/materials/seo'
import { FABRIC_CATEGORY_LABELS, isFabricCategory } from '@/types/material'

interface PageParams {
  params: { category: string; slug: string }
}

// One catalog fetch, reused for every [category]/[slug] pair — cheaper at
// build time than a getMaterialBySlug() round trip per material, and this
// is the only place both the category and slug segments need cross-checking
// against the same source of truth (a material's real category, not
// whatever the URL happens to say).
export async function generateStaticParams() {
  const supabase = createPublicClient()
  const materials = await getAllMaterials(supabase)
  return materials.map((material) => ({ category: material.category, slug: material.slug }))
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const material = await resolveMaterial(params)
  if (!material) return { title: 'Material Tidak Ditemukan | Local Tailor' }
  return buildFabricMaterialMetadata(material)
}

export const revalidate = 3600

// Validates category param + fetches by slug, but a slug whose real
// category doesn't match the URL's [category] segment is treated as not
// found — /fabric/wool/some-cotton-slug must 404, not silently render the
// cotton material under a wool URL.
async function resolveMaterial(params: { category: string; slug: string }) {
  if (!isFabricCategory(params.category)) return null
  const supabase = createPublicClient()
  const material = await getMaterialBySlug(supabase, params.slug)
  if (!material || material.category !== params.category) return null
  return material
}

export default async function FabricMaterialPage({ params }: PageParams) {
  const material = await resolveMaterial(params)
  if (!material) notFound()

  const label = FABRIC_CATEGORY_LABELS[material.category]

  const specs: { label: string; value: string | number | null }[] = [
    { label: 'Composition', value: material.composition },
    { label: 'Weight (GSM)', value: material.weight_gsm },
    { label: 'Texture', value: material.texture },
    { label: 'Breathability', value: material.breathability },
    { label: 'Wrinkle Resistance', value: material.wrinkle_resistance },
    { label: 'Luxury Level', value: material.luxury_level },
    { label: 'Season', value: material.season },
    { label: 'Care Instruction', value: material.care_instruction },
    { label: 'Price Tier', value: material.price_tier },
  ].filter((s) => s.value !== null && s.value !== '')

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
          <a href="/fabric" className="hover:text-luxury-gold">
            Fabric Explorer
          </a>{' '}
          /{' '}
          <a href={`/fabric/${material.category}`} className="hover:text-luxury-gold">
            {label}
          </a>{' '}
          / {material.name}
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1fr]">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/30">
            {material.hero_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={material.hero_image} alt={material.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-luxury-sans text-[11px] uppercase tracking-[0.14em] text-luxury-taupe">
                No Image
              </div>
            )}
          </div>

          <div>
            <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">{label}</p>
            <h1 className="mt-2 font-luxury-sans text-2xl text-luxury-ivory">{material.name}</h1>

            {specs.length > 0 && (
              <dl className="mt-6 divide-y divide-luxury-gold/10 border-y border-luxury-gold/10">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-4 py-3">
                    <dt className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe">{spec.label}</dt>
                    <dd className="font-luxury-sans text-xs text-luxury-ivory">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
