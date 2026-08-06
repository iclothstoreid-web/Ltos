// Safe Migration (2026-08-07) — the ONE place that decides, for a single
// source object (an AiDesignDna or a RenderRecipe), whether to read its new
// `componentRules` field or fall back to the legacy `lockRules` +
// `negativeRules` pair. Every pipeline read of Component Rules goes through
// this function — nothing reads `componentRules` bare, so a row that
// genuinely has an empty (but present) `componentRules` array is never
// silently re-merged from stale legacy data, while a row that hasn't been
// migrated yet (or was written by a stale client still using the old
// shape) never loses its lockRules/negativeRules content.
//
// Order preserved on fallback: lockRules entries first, then negativeRules
// entries — matches the order the data migration itself uses
// (supabase/migrations/20260827000000_add_component_rules.sql) and the
// order every seed/spread in application code already used before this
// field existed (e.g. masterData.ts's createMasterDataOption for Look
// Cutting).
export interface ComponentRulesSource {
  componentRules?: string[] | null
  lockRules?: string[] | null
  negativeRules?: string[] | null
}

export function resolveComponentRules(source: ComponentRulesSource): string[] {
  if (Array.isArray(source.componentRules)) {
    return source.componentRules
  }
  return [...(source.lockRules ?? []), ...(source.negativeRules ?? [])]
}
