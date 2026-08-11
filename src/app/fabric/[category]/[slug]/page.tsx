import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import {
  buildFabricRenderContext,
  getAllMaterials,
  getInternalLinkTargets,
  getMaterialAuthorityContent,
  getMaterialBySlug,
  getMaterialColors,
  getMaterialFaq,
  getMaterialGallery,
  getSeoNeighbors,
  groupMaterialColorsByFamily,
  primaryMaterialColorFrom,
} from '@/lib/materials/materialRepository'
import {
  buildFabricFaqSchema,
  buildFabricMaterialBreadcrumbSchema,
  buildFabricMaterialMetadata,
  buildFabricMaterialProductSchema,
} from '@/lib/materials/seo'
import { FABRIC_CATEGORY_LABELS, isFabricCategory, type MaterialColor } from '@/types/material'
import { FabricGallery } from '@/components/fabric/FabricGallery'
import { MaterialDnaSection } from '@/components/fabric/MaterialDnaSection'
import { FabricSpecificationsSection } from '@/components/fabric/FabricSpecificationsSection'
import { UseCaseSection } from '@/components/fabric/UseCaseSection'
import { FabricVideoSection } from '@/components/fabric/FabricVideoSection'
import { RelatedMaterialsSection } from '@/components/fabric/RelatedMaterialsSection'
import { ComparisonPreviewSection } from '@/components/fabric/ComparisonPreviewSection'
import { DesignStudioCta } from '@/components/fabric/DesignStudioCta'
import { FabricColorSwatches } from '@/components/fabric/FabricColorSwatches'
import { DnaColorInfoPanel } from '@/components/fabric/DnaColorInfoPanel'
import { ColorFamilySection } from '@/components/fabric/ColorFamilySection'
import { MaterialAuthoritySection } from '@/components/fabric/MaterialAuthoritySection'
import { FaqSection } from '@/components/fabric/FaqSection'
import { InternalLinksSection } from '@/components/fabric/InternalLinksSection'

interface PageParams {
  params: { category: string; slug: string }
  searchParams: { color?: string }
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

// Sprint W3-4 — `?color=` affects title/description/OG image but never the
// canonical tag (buildFabricMaterialMetadata always canonicalizes to the
// bare fabric URL) and generateStaticParams above never enumerates color
// combinations, so ?color= variants render dynamically, on top of the same
// statically-generated base page.
export async function generateMetadata({ params, searchParams }: PageParams): Promise<Metadata> {
  const material = await resolveMaterial(params)
  if (!material) return { title: 'Material Not Found | Local Tailor' }

  const selectedColor = searchParams.color ? await resolveSelectedColor(material.id, searchParams.color) : null
  return buildFabricMaterialMetadata(material, selectedColor)
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

async function resolveSelectedColor(materialId: string, colorSlug: string): Promise<MaterialColor | null> {
  const supabase = createPublicClient()
  const colors = await getMaterialColors(supabase, materialId)
  return colors.find((c) => c.slug === colorSlug) ?? null
}

export default async function FabricMaterialPage({ params, searchParams }: PageParams) {
  const material = await resolveMaterial(params)
  if (!material) notFound()

  const supabase = createPublicClient()
  const colors = await getMaterialColors(supabase, material.id)
  const selectedColor = searchParams.color ? colors.find((c) => c.slug === searchParams.color) ?? null : null
  const primaryColor = primaryMaterialColorFrom(colors)
  const displayedColor = selectedColor ?? primaryColor
  const colorFamilies = groupMaterialColorsByFamily(colors)

  const linkTargets = await getInternalLinkTargets(supabase, material, selectedColor?.dna_color_id ?? null, displayedColor?.family ?? null)

  // Bounded fan-out (max 4, Related Materials' own cap) for the color
  // strip on each related card — see MaterialGrid's colorsByMaterialId
  // comment on why this is deliberately not done for the full Explorer grid.
  const relatedColorEntries = await Promise.all(
    linkTargets.related.map(async (m) => [m.id, await getMaterialColors(supabase, m.id)] as const)
  )
  const relatedColorsByMaterialId = Object.fromEntries(relatedColorEntries)

  const label = FABRIC_CATEGORY_LABELS[material.category]
  const basePath = `/fabric/${material.category}/${material.slug}`
  const gallery = getMaterialGallery(material)
  const seoNeighbors = getSeoNeighbors(material)
  const faq = getMaterialFaq(material)
  const authorityContent = getMaterialAuthorityContent(material)

  const productSchema = buildFabricMaterialProductSchema(material, displayedColor)
  const breadcrumbSchema = buildFabricMaterialBreadcrumbSchema(material)
  const faqSchema = buildFabricFaqSchema(faq)
  const renderContext = buildFabricRenderContext(material, selectedColor)

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Sprint W3-4 §11 — AI Render Context Preparation. A data island, not
          a call to any render/AI API — a future render integration reads
          this instead of re-deriving material+color context itself. */}
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/json"
        id="fabric-render-context"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(renderContext) }}
      />

      <div className="mx-auto max-w-6xl">
        <header>
          <nav aria-label="Breadcrumb" className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-luxury-gold">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
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
        </header>

        <article>
          {/* Hero gallery + material information + CTA */}
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <figure className="m-0">
              <FabricGallery images={gallery} alt={material.name} />
              <figcaption className="sr-only">
                {material.name} — {label} fabric{material.composition ? `, ${material.composition}` : ''}
              </figcaption>
            </figure>

            <div>
              <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">{label}</p>
              <h1 className="mt-2 font-luxury-sans text-2xl text-luxury-ivory md:text-3xl">{material.name}</h1>
              {material.composition && <p className="mt-2 font-luxury-sans text-sm text-luxury-taupe">{material.composition}</p>}

              {colors.length > 0 && displayedColor && (
                <div className="mt-5 space-y-4">
                  <FabricColorSwatches basePath={basePath} colors={colors} selectedColorSlug={selectedColor?.slug ?? null} />
                  <DnaColorInfoPanel color={displayedColor} />
                </div>
              )}

              <DesignStudioCta slug={material.slug} colorSlug={selectedColor?.slug ?? null} className="mt-6" />

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

          {/* Color families */}
          {colorFamilies.length > 0 && (
            <div className="mt-16">
              <ColorFamilySection basePath={basePath} families={colorFamilies} selectedColorSlug={selectedColor?.slug ?? null} />
            </div>
          )}

          {/* Video */}
          <div className="mt-16">
            <FabricVideoSection videoUrl={material.video_url} materialName={material.name} />
          </div>

          {/* Material Authority Content */}
          <div className="mt-16 max-w-3xl">
            <MaterialAuthoritySection materialName={material.name} content={authorityContent} />
          </div>

          {/* FAQ */}
          <div className="mt-16 max-w-3xl">
            <FaqSection faq={faq} />
          </div>
        </article>

        {/* Internal Linking Engine */}
        <div className="mt-16">
          <InternalLinksSection
            category={seoNeighbors.category}
            siblingCategories={seoNeighbors.siblingCategories}
            sameTexture={linkTargets.sameTexture}
            sameColorFamily={linkTargets.sameColorFamily}
          />
        </div>

        {/* Related materials */}
        <div className="mt-16">
          <RelatedMaterialsSection materials={linkTargets.related} colorsByMaterialId={relatedColorsByMaterialId} />
        </div>

        {/* Comparison preview */}
        <div className="mt-16">
          <ComparisonPreviewSection candidates={linkTargets.comparison} />
        </div>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-luxury-gold/10 pt-8">
          <Link href="/fabric" className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe hover:text-luxury-gold">
            ← Back to Fabric Explorer
          </Link>
          <DesignStudioCta slug={material.slug} colorSlug={selectedColor?.slug ?? null} />
        </footer>
      </div>
    </div>
  )
}
