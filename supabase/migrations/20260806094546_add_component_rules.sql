-- Safe Migration (2026-08-07) — adds `componentRules` to both
-- design_master_options.ai_dna and .render_recipe (jsonb columns), copying
-- the existing `lockRules` + `negativeRules` content into it, ORDER
-- PRESERVED (lockRules entries first, then negativeRules entries — matches
-- every seed/spread in application code that predates this field).
--
-- NON-DESTRUCTIVE BY DESIGN: this migration only ADDS the `componentRules`
-- key via jsonb `||`. It never touches, renames, or drops `lockRules`/
-- `negativeRules` — both remain exactly as they were, byte for byte, on
-- every row. Application code (as of this same sprint) prefers
-- `componentRules` when present and falls back to merging the legacy pair
-- otherwise (see src/lib/design/dnaResolver/resolveComponentRules.ts), so
-- production stays fully readable regardless of whether this migration has
-- run yet on any given deploy.
--
-- Rows that already have a non-null `componentRules` key are left alone
-- (idempotent — safe to re-run).
--
-- Legacy field removal is explicitly OUT OF SCOPE for this migration — a
-- separate Sprint Cleanup migration removes `lockRules`/`negativeRules`
-- only after UAT confirms `componentRules` is correct for every row.

update design_master_options
set ai_dna = ai_dna
  || jsonb_build_object(
       'componentRules',
       coalesce(ai_dna -> 'lockRules', '[]'::jsonb) || coalesce(ai_dna -> 'negativeRules', '[]'::jsonb)
     )
where not (ai_dna ? 'componentRules')
  and (ai_dna ? 'lockRules' or ai_dna ? 'negativeRules');

-- Rows with neither legacy key still get an explicit empty componentRules
-- (e.g. freshly-created rows that predate both fields) — makes "row has
-- componentRules" a total, not partial, fact across the table.
update design_master_options
set ai_dna = ai_dna || jsonb_build_object('componentRules', '[]'::jsonb)
where not (ai_dna ? 'componentRules');

update design_master_options
set render_recipe = render_recipe
  || jsonb_build_object(
       'componentRules',
       coalesce(render_recipe -> 'lockRules', '[]'::jsonb) || coalesce(render_recipe -> 'negativeRules', '[]'::jsonb)
     )
where not (render_recipe ? 'componentRules')
  and (render_recipe ? 'lockRules' or render_recipe ? 'negativeRules');

update design_master_options
set render_recipe = render_recipe || jsonb_build_object('componentRules', '[]'::jsonb)
where not (render_recipe ? 'componentRules');
