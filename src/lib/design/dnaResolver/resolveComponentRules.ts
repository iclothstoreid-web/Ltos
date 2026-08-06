// The ONE place that reads Component Rules off a source object (an
// AiDesignDna or a RenderRecipe). Every pipeline read goes through this
// function rather than reading `componentRules` bare, so a genuinely-absent
// array (a still-uninitialized row) normalizes to `[]` in one place instead
// of every call site guarding it separately.
//
// Sprint Cleanup (2026-08-09) — this used to also fall back to legacy
// `lockRules`/`negativeRules` for the Safe Migration transition period; both
// the legacy DB data and the legacy type fields are gone now (Final Master
// Data Cleanup sprint), so the fallback branch was removed.
export interface ComponentRulesSource {
  componentRules?: string[] | null
}

export function resolveComponentRules(source: ComponentRulesSource): string[] {
  return Array.isArray(source.componentRules) ? source.componentRules : []
}
