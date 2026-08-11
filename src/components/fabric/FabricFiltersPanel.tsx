import {
  FABRIC_CATEGORY_LABELS,
  FABRIC_PRICE_TIER_LABELS,
  FABRIC_SEASON_LABELS,
  FABRIC_TEXTURE_LABELS,
  FABRIC_WEIGHT_CLASS_LABELS,
  type FabricCategory,
  type FabricFilterFacets,
} from '@/types/material'
import { buildToggleFilterHref, type FabricSearchParams } from '@/lib/materials/searchParamsHelpers'
import { FilterLinkGroup } from './FilterLinkGroup'

interface FabricFiltersPanelProps {
  basePath: string
  searchParams: FabricSearchParams
  facets: FabricFilterFacets
  lockedCategory?: FabricCategory
}

function currentValue(searchParams: FabricSearchParams, key: string): string | undefined {
  const value = searchParams[key]
  return typeof value === 'string' ? value : undefined
}

// Desktop sidebar and mobile drawer render this exact same component — one
// filter implementation, not two. `lockedCategory` (category landing
// pages) hides the Category group entirely, since it's already implied by
// the URL path there rather than being a real choice.
export function FabricFiltersPanel({ basePath, searchParams, facets, lockedCategory }: FabricFiltersPanelProps) {
  const activeCategory = currentValue(searchParams, 'category')
  const activeTexture = currentValue(searchParams, 'texture')
  const activeWeight = currentValue(searchParams, 'weight')
  const activeSeason = currentValue(searchParams, 'season')
  const activePriceTier = currentValue(searchParams, 'price_tier')

  return (
    <div className="space-y-5">
      {!lockedCategory && (
        <FilterLinkGroup
          title="Category"
          options={facets.categories.map((category) => ({
            value: category,
            label: FABRIC_CATEGORY_LABELS[category],
            href: buildToggleFilterHref(basePath, searchParams, 'category', category),
            active: activeCategory === category,
          }))}
        />
      )}

      <FilterLinkGroup
        title="Texture"
        options={facets.textures.map((texture) => ({
          value: texture,
          label: FABRIC_TEXTURE_LABELS[texture],
          href: buildToggleFilterHref(basePath, searchParams, 'texture', texture),
          active: activeTexture === texture,
        }))}
      />

      <FilterLinkGroup
        title="Weight"
        options={facets.weightClasses.map((weightClass) => ({
          value: weightClass,
          label: FABRIC_WEIGHT_CLASS_LABELS[weightClass],
          href: buildToggleFilterHref(basePath, searchParams, 'weight', weightClass),
          active: activeWeight === weightClass,
        }))}
      />

      <FilterLinkGroup
        title="Season"
        options={facets.seasons.map((season) => ({
          value: season,
          label: FABRIC_SEASON_LABELS[season],
          href: buildToggleFilterHref(basePath, searchParams, 'season', season),
          active: activeSeason === season,
        }))}
      />

      <FilterLinkGroup
        title="Price Tier"
        options={facets.priceTiers.map((priceTier) => ({
          value: priceTier,
          label: FABRIC_PRICE_TIER_LABELS[priceTier],
          href: buildToggleFilterHref(basePath, searchParams, 'price_tier', priceTier),
          active: activePriceTier === priceTier,
        }))}
      />
    </div>
  )
}
