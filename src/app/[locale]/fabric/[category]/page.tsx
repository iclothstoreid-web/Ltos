import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { getMaterialFilterFacets, listMaterials } from '@/lib/materials/materialRepository'
import { buildFabricCategoryBreadcrumbSchema, buildFabricCategoryMetadata, FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
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
import { CategoryEditorialSection } from '@/components/fabric/CategoryEditorialSection'
import { FunnelStepOnMount } from '@/components/analytics/FunnelStepOnMount'

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
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isFabricCategory(params.category)) {
    return { title: 'Category Not Found | Tarda' }
  }
  return withLocaleAlternates(buildFabricCategoryMetadata(params.category), FABRIC_SITE_ORIGIN, `/fabric/${params.category}`)
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

  const [{ materials, totalCount }, facets, { materials: popular }] = await Promise.all([
    listMaterials(supabase, parsed),
    getMaterialFilterFacets(supabase, category),
    listMaterials(supabase, { category, limit: 4, sort: 'featured' }),
  ])

  const currentLimit = parsed.limit ?? materials.length
  const hasMore = totalCount > materials.length
  const siblingCategories = FABRIC_CATEGORIES.filter((c) => c !== category)
  const breadcrumbSchema = buildFabricCategoryBreadcrumbSchema(category)
  // Popular rail only earns its place when it's showing a different view
  // than the (unfiltered, default-sorted) main grid already would —
  // otherwise it's a redundant duplicate of the same 4 cards.
  const showPopularRail = popular.length > 0 && (totalCount > popular.length || parsed.sort !== undefined || Object.keys(searchParams).length > 0)

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <FunnelStepOnMount step="fabric" />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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
              <li aria-current="page" className="text-luxury-ivory">
                {label}
              </li>
            </ol>
          </nav>

          <div className="mt-4">
            <MaterialHero eyebrow="Category" title={`${label} Fabrics`} description={FABRIC_CATEGORY_DESCRIPTIONS[category]}>
              <FabricSearchForm basePath={basePath} searchParams={searchParams} lockedCategory={category} />
            </MaterialHero>
          </div>
        </header>

        {showPopularRail && (
          <section aria-labelledby="popular-materials-heading" className="mt-10">
            <h2 id="popular-materials-heading" className="font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory">
              Popular in {label}
            </h2>
            <div className="mt-4">
              <MaterialGrid materials={popular} />
            </div>
          </section>
        )}

        <section aria-labelledby="category-catalog-heading" className="mt-16">
          <h2 id="category-catalog-heading" className="sr-only">
            All {label} Fabrics
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-3">
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
        </section>

        {/* Category SEO Content (§4) — 400-800 word editorial section */}
        <div className="mt-16 border-t border-luxury-gold/10 pt-10">
          <CategoryEditorialSection category={category} />
        </div>

        {/* Related Categories (§7 Category Hub Navigation) — every category
            page links to every sibling category, so crawlers and users can
            reach the full taxonomy from any single category landing page. */}
        <aside aria-labelledby="related-categories-heading" className="mt-16 border-t border-luxury-gold/10 pt-8">
          <h2 id="related-categories-heading" className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
            Related Categories
          </h2>
          <nav aria-label="Related fabric categories" className="mt-3 flex flex-wrap gap-2">
            {siblingCategories.map((c) => (
              <CategoryChip key={c} category={c} />
            ))}
          </nav>
        </aside>

        <footer className="mt-16 border-t border-luxury-gold/10 pt-8">
          <Link href="/fabric" className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-taupe hover:text-luxury-gold">
            ← Explore the Full Fabric Explorer
          </Link>
        </footer>
      </div>
    </div>
  )
}
