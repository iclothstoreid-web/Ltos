import { createHash } from 'node:crypto'
import type { DnaState } from './types'

// Deterministic regardless of request ordering — two DNA States with the
// same photo and the same set of {category, itemId} pairs always hash
// identically, no matter what order componentSelections happened to arrive
// in. This is what lets Render Cache treat "Collar A -> B -> A" as a real
// cache hit on the third pick (see renderCache/cache.ts).
export function hashDnaState(state: DnaState): string {
  const sortedComponents = [...state.components]
    .map((component) => `${component.category}:${component.itemId}`)
    .sort()

  const canonical = JSON.stringify({
    photo: state.customerPhotoUrl,
    components: sortedComponents,
  })

  return createHash('sha1').update(canonical).digest('hex')
}
