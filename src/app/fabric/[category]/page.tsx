import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { getMaterialFilterFacets, listMaterials } from '@/lib/materials/materialRepository'
import { buildFabricCategoryMetadata } from '@/lib/materials/seo'
import { parseListMaterialsParams, buildLoadMoreHref, type FabricSearchParams } from '@/lib/materials/searchParamsHelpers'
import { FABRIC_CATEGORIES, FABRIC_CATEGORY_DESCRIPTIONS, FABRIC_CATEGORY_LABELS, isFabricCategory } from '@/types/material'
import { MaterialHero } from '@/components/fabric/MaterialHero'
import { MaterialGrid } from '@/components/fabric/MaterialGrid'
import { CategoryChip } from '@/components/fabric/CategoryChip'
import { FabricSearchForm } from '@/components/fabric/FabricSearchForm'
import { FabricFiltersPanel } from '@/components/fabric/FabricFiltersPanel'
import { MobileFilterDrawer } from '@/components/fabric/MobileFilterDrawer'
import { ActiveFilterChips } from '@/components/fabric/ActiveFilterChips'
import { SortLinks } from '@/components/fabric/SortLinks'

interface PageProps {
  params: { category: string }
  searchParams: FabricSearchParams
}

// Fixed taxonomy (src/types/material.ts) — every category page is
// pre-rendered regardless of whether it has materials yet, so the nav
// never links to a build-time-missing route.
export function generateStaticParams() {
  return FABRIC_CATEGORIES.map((category) => ({ category }))
}

// Closed enum, exhaustively listed above — unlike [slug] (open-ended,
// grows as materials are added), no legitimate category can ever fall
// outside this set. false makes an invalid segment 404 at the router
// level with a real HTTP 404, instead of falling through to an on-demand
// render whose notFound() status Next's ISR fallback cache doesn't
// propagate correctly (observed in W3-1: x-nextjs-cache HIT, 200).
export const dynamicParams = false

// Metadata depends only on the [category] path segment, never on
// searchParams — so /fabric/cotton?texture=crisp shares the exact same
// title/description/canonical as /fabric/cotton, avoiding duplicate
// metadata across filtered variations of the same category page.
export function generateMetadata({ params }: PageProps): Metadata {
  if (!isFabricCategory(params.category)) {
    return { title: 'Category Not Found | Local Tailor' }
  }
  return buildFabricCategoryMetadata(params.category)
}

// The bare (query-less) category URL is what generateStaticParams
// pre-renders — without a revalidate window it would only pick up new
// Material Master rows on the next deploy. Filtered/sorted/paginated
// variations (any request carrying searchParams) always render fresh on
// request regardless of this setting.
export const revalidate = 3600

export default async function FabricCategoryPage({ params, searchParams }: PageProps) {
  if (!isFabricCategory(params.category)) notFound()
  const category = params.category
  const basePath = `/fabric/${category}`
  const label = FABRIC_CATEGORY_LABELS[category]

  const supabase = createPublicClient()
  const parsed = parseListMaterialsParams(searchParams, { lockedCategory: category })

  const [{ materials, totalCount }, facets] = await Promise.all([
    listMaterials(supabase, parsed),
    getMaterialFilterFacets(supabase, category),
  ])

  const currentLimit = parsed.limit ?? materials.length
  const hasMore = totalCount > materials.length
  const siblingCategories = FABRIC_CATEGORIES.filter((c) => c !== category)

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
          <Link href="/fabric" className="hover:text-luxury-gold">
            Fabric Explorer
          </Link>{' '}
          / {label}
        </p>

        <div className="mt-4">
          <MaterialHero eyebrow="Category" title={`${label} Fabrics`} description={FABRIC_CATEGORY_DESCRIPTIONS[category]}>
            <FabricSearchForm basePath={basePath} searchParams={searchParams} lockedCategory={category} />
          </MaterialHero>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <ActiveFilterChips basePath={basePath} searchParams={searchParams} lockedCategory={category} />
          <div className="ml-auto flex items-center gap-4">
            <MobileFilterDrawer resultCount={totalCount}>
              <FabricFiltersPanel basePath={basePath} searchParams={searchParams} facets={facets} lockedCategory={category} />
            </MobileFilterDrawer>
            <SortLinks basePath={basePath} searchParams={searchParams} />
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block" aria-label="Fabric filters">
            <FabricFiltersPanel basePath={basePath} searchParams={searchParams} facets={facets} lockedCategory={category} />
          </aside>

          <div>
            <p role="status" className="mb-4 font-luxury-sans text-xs text-luxury-taupe">
              {totalCount === 0
                ? `No ${label} fabrics yet.`
                : `Showing ${materials.length} of ${totalCount} ${label} fabric${totalCount === 1 ? '' : 's'}`}
            </p>

            <MaterialGrid materials={materials} emptyMessage={`No ${label} fabrics match your search.`} />

            {hasMore && (
              <div className="mt-8 text-center">
                <Link
                  href={buildLoadMoreHref(basePath, searchParams, currentLimit)}
                  scroll={false}
                  className="inline-flex items-center rounded-full border border-luxury-gold/30 px-6 py-2.5 font-luxury-sans text-[11px] uppercase tracking-[0.14em] text-luxury-ivory transition hover:border-luxury-gold hover:text-luxury-gold focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
                >
                  Load More
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Internal linking (§9) — every category page links to every
            sibling category, so crawlers and users can reach the full
            taxonomy from any single category landing page. */}
        <div className="mt-16 border-t border-luxury-gold/10 pt-8">
          <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">Explore Other Fabrics</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {siblingCategories.map((c) => (
              <CategoryChip key={c} category={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
