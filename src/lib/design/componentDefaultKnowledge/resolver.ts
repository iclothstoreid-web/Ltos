import type { MasterDataCategory } from '@/lib/design/masterData'
import { getComponentDefaultKnowledge } from './registry'
import type { ComponentDefaultKnowledge } from './types'

// Component Delta Knowledge — what one ITEM stores beyond its category's own
// Component Default Knowledge (e.g. Front Placket's Hexagon variant stores
// only the hexagon-specific rules, never a copy of every Front Placket's
// shared baseline). Same shape as ComponentDefaultKnowledge — a variant's
// delta is measured against exactly the fields a category default can
// provide.
export type ComponentKnowledgeDelta = ComponentDefaultKnowledge

// The one place Component Default Knowledge + Component Delta Knowledge are
// merged (Requirement: "Composer harus otomatis melakukan merge: Component
// Default Knowledge + Component Delta Knowledge"). Recipe Composer calls
// this once per Component Recipe entry, keyed by that entry's own category
// — see recipeComposer/composer.ts's composeRenderRecipe.
//
// Array fields union with the same exact-string dedup Recipe Composer
// already uses everywhere else (composeRenderRecipe's own Set-based merge),
// so a variant repeating a rule its category default already states is not
// a bug, just a duplicate the Set collapses — same tolerance Recipe
// Composer has always had. `referenceInstruction` is resolved here (delta
// wins, category default is the fallback) so the merge rule exists and is
// tested, but no caller reads it yet this sprint (see types.ts's own
// comment) — infrastructure only, per the locked brief. `identity` merges
// key-by-key, delta wins per key (same "more specific wins" precedent as
// dnaResolver/resolver.ts's buildGarmentSpec) — a variant with no identity
// delta of its own (every current Front Placket item) simply inherits the
// category default unchanged.
export function resolveComponentKnowledge(
  category: MasterDataCategory,
  delta: ComponentKnowledgeDelta
): ComponentDefaultKnowledge {
  const base = getComponentDefaultKnowledge(category)
  return {
    referenceInstruction: delta.referenceInstruction ?? base.referenceInstruction,
    lockRules: Array.from(new Set([...base.lockRules, ...delta.lockRules])),
    negativeRules: Array.from(new Set([...base.negativeRules, ...delta.negativeRules])),
    identity: { ...base.identity, ...delta.identity },
  }
}
