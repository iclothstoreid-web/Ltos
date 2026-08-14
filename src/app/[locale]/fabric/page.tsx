import type { Metadata } from 'next'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/public'
import { getMaterialFilterFacets, listMaterials } from '@/lib/materials/materialRepository'
import { buildFabricExplorerMetadata, FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { parseListMaterialsParams, buildLoadMoreHref, type FabricSearchParams } from '@/lib/materials/searchParamsHelpers'
import { MaterialHero } from '@/components/fabric/MaterialHero'
import { MaterialGrid } from '@/components/fabric/MaterialGrid'
import { FabricSearchForm } from '@/components/fabric/FabricSearchForm'
import { FabricFiltersPanel } from '@/components/fabric/FabricFiltersPanel'
import { MobileFilterDrawer } from '@/components/fabric/MobileFilterDrawer'
import { ActiveFilterChips } from '@/components/fabric/ActiveFilterChips'
import { SortLinks } from '@/components/fabric/SortLinks'
import { CategoryChip } from '@/components/fabric/CategoryChip'
import { FunnelStepOnMount } from '@/components/analytics/FunnelStepOnMount'
import { WalnutGrainOverlay } from '@/components/marketing/shell/WalnutGrainOverlay'

// Metadata is deliberately independent of searchParams — every ?search=/
// ?category=/etc. variation of this page shares the exact same title,
// description, and (crucially) canonical URL, so search engines never see
// duplicate metadata across query combinations.
export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(buildFabricExplorerMetadata(), FABRIC_SITE_ORIGIN, '/fabric')
}

const BASE_PATH = '/fabric'

interface PageProps {
  searchParams: FabricSearchParams
}

// Reading `searchParams` opts this route out of static rendering (correct
// — a search/filter UI has effectively infinite query combinations, none
// of it can be prerendered). Every filter/sort/pagination change is a full
// server round trip through listMaterials(), never client-side filtering
// of an already-fetched array.
export default async function FabricExplorerPage({ searchParams }: PageProps) {
  const supabase = createPublicClient()
  const parsed = parseListMaterialsParams(searchParams)

  const [{ materials, totalCount }, facets] = await Promise.all([
    listMaterials(supabase, parsed),
    getMaterialFilterFacets(supabase),
  ])

  const currentLimit = parsed.limit ?? materials.length
  const hasMore = totalCount > materials.length

  return (
    <main className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <FunnelStepOnMount step="fabric" />
      <div className="mx-auto max-w-6xl">
        <MaterialHero
          title="Fabric Explorer"
          description="Explore our bespoke fabric collection — composition, texture, and character for every fabric."
        >
          <FabricSearchForm basePath={BASE_PATH} searchParams={searchParams} />
        </MaterialHero>

        {facets.categories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">Browse:</span>
            {facets.categories.map((category) => (
              <CategoryChip key={category} category={category} />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <ActiveFilterChips basePath={BASE_PATH} searchParams={searchParams} />
          <div className="ml-auto flex items-center gap-4">
            <MobileFilterDrawer resultCount={totalCount}>
              <FabricFiltersPanel basePath={BASE_PATH} searchParams={searchParams} facets={facets} />
            </MobileFilterDrawer>
            <SortLinks basePath={BASE_PATH} searchParams={searchParams} />
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block" aria-label="Fabric filters">
            <FabricFiltersPanel basePath={BASE_PATH} searchParams={searchParams} facets={facets} />
          </aside>

          <div>
            {/* sr-only — MaterialHero's own title is the page's only visible
                h1, and MaterialCard renders each result as an h3; without
                this, real results skip straight from h1 to h3. Was latent
                (nothing to trigger it) until real catalog data existed. */}
            <h2 className="sr-only">Fabric Results</h2>
            <p role="status" className="mb-4 font-luxury-sans text-xs text-luxury-taupe">
              {totalCount === 0 ? 'No fabrics found.' : `Showing ${materials.length} of ${totalCount} fabric${totalCount === 1 ? '' : 's'}`}
            </p>

            <MaterialGrid materials={materials} emptyMessage="No fabrics match your search. Try adjusting your filters." />

            {hasMore && (
              <div className="mt-8 text-center">
                <Link
                  href={buildLoadMoreHref(BASE_PATH, searchParams, currentLimit)}
                  scroll={false}
                  className="inline-flex items-center rounded-full border border-luxury-gold/30 px-6 py-2.5 font-luxury-sans text-[11px] uppercase tracking-[0.14em] text-luxury-ivory transition hover:border-luxury-gold hover:text-luxury-gold focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
                >
                  Load More
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <WalnutGrainOverlay />
    </main>
  )
}
