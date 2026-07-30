import { createHash } from 'node:crypto'
import type { DnaState } from './types'

// Deterministic regardless of request ordering — two DNA States with the
// same photo and the same set of {category, itemId, dnaVersion,
// recipeVersion} pairs always hash identically, no matter what order
// componentSelections happened to arrive in. This is what lets Render Cache
// treat "Collar A -> B -> A" as a real cache hit on the third pick (see
// renderCache/cache.ts) — AS LONG AS neither item's AI Design DNA nor
// Render Recipe changed in between. Including dnaVersion/recipeVersion
// (Sprint PR-01, P7) is what makes a Master Data edit (which bumps
// `version` — aiDna/types.ts's mark* functions) produce a genuinely new
// hash instead of reusing a now-stale cached render.
export function hashDnaState(state: DnaState): string {
  const sortedComponents = [...state.components]
    .map(
      (component) =>
        `${component.category}:${component.itemId}:${component.dnaVersion ?? 'v?'}:${component.recipeVersion ?? 'r?'}`
    )
    .sort()

  const canonical = JSON.stringify({
    photo: state.customerPhotoUrl,
    components: sortedComponents,
  })

  return createHash('sha1').update(canonical).digest('hex')
}
