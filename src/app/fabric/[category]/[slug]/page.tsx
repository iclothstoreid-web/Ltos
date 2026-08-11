import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import {
  getAllMaterials,
  getComparisonCandidates,
  getMaterialBySlug,
  getMaterialGallery,
  getRelatedMaterials,
} from '@/lib/materials/materialRepository'
import { buildFabricMaterialBreadcrumbSchema, buildFabricMaterialMetadata, buildFabricMaterialProductSchema } from '@/lib/materials/seo'
import { FABRIC_CATEGORY_LABELS, isFabricCategory } from '@/types/material'
import { FabricGallery } from '@/components/fabric/FabricGallery'
import { MaterialDnaSection } from '@/components/fabric/MaterialDnaSection'
import { FabricSpecificationsSection } from '@/components/fabric/FabricSpecificationsSection'
import { UseCaseSection } from '@/components/fabric/UseCaseSection'
import { FabricVideoSection } from '@/components/fabric/FabricVideoSection'
import { RelatedMaterialsSection } from '@/components/fabric/RelatedMaterialsSection'
import { ComparisonPreviewSection } from '@/components/fabric/ComparisonPreviewSection'
import { DesignStudioCta } from '@/components/fabric/DesignStudioCta'

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
  if (!material) return { title: 'Material Not Found | Local Tailor' }
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

  const supabase = createPublicClient()
  const [related, comparisonCandidates] = await Promise.all([
    getRelatedMaterials(supabase, material, 4),
    getComparisonCandidates(supabase, material, 3),
  ])

  const label = FABRIC_CATEGORY_LABELS[material.category]
  const gallery = getMaterialGallery(material)
  const productSchema = buildFabricMaterialProductSchema(material)
  const breadcrumbSchema = buildFabricMaterialBreadcrumbSchema(material)

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/fabric" className="hover:text-luxury-gold">
                Fabric Explorer
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/fabric/${material.category}`} className="hover:text-luxury-gold">
                {label}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-luxury-ivory">
              {material.name}
            </li>
          </ol>
        </nav>

        {/* Hero gallery + material information + CTA */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <FabricGallery images={gallery} alt={material.name} />

          <div>
            <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">{label}</p>
            <h1 className="mt-2 font-luxury-sans text-2xl text-luxury-ivory md:text-3xl">{material.name}</h1>
            {material.composition && <p className="mt-2 font-luxury-sans text-sm text-luxury-taupe">{material.composition}</p>}

            <DesignStudioCta slug={material.slug} className="mt-6" />

            <div className="mt-10 space-y-10">
              <FabricSpecificationsSection material={material} />
              <UseCaseSection material={material} />
            </div>
          </div>
        </div>

        {/* Material DNA */}
        <div className="mt-16">
          <MaterialDnaSection material={material} />
        </div>

        {/* Video */}
        <div className="mt-16">
          <FabricVideoSection videoUrl={material.video_url} materialName={material.name} />
        </div>

        {/* Related materials */}
        <div className="mt-16">
          <RelatedMaterialsSection materials={related} />
        </div>

        {/* Comparison preview */}
        <div className="mt-16">
          <ComparisonPreviewSection candidates={comparisonCandidates} />
        </div>

        {/* SEO content — short descriptive paragraph, real crawlable text
            beyond the metadata tags, built only from data already on the
            material (no new field, no fabricated claims). */}
        <div className="mt-16 max-w-3xl border-t border-luxury-gold/10 pt-8">
          <h2 className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">About {material.name}</h2>
          <p className="mt-3 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">
            {material.name} is a {label.toLowerCase()} fabric{material.composition ? ` (${material.composition})` : ''} available for
            bespoke thobe tailoring at Local Tailor.
            {material.texture ? ` Its ${material.texture} texture` : ' Its texture'}
            {material.season ? ` suits ${material.season.replace('_', ' ')} wear` : ' suits everyday wear'}, finished to the same
            handcrafted standard as every fabric in our collection.
          </p>
        </div>
      </div>
    </div>
  )
}
