-- Delta Knowledge cleanup — data-only migration. No ALTER TABLE, no column
-- added/dropped/retyped: design_master_options.ai_dna is JSONB, this only
-- rewrites its content.
--
-- Repository audit (2026-08-04) found that migration
-- 20260825000000_reference_first_dna_cleanup.sql's one-time backfill wrote
-- the literal DEFAULT_LOCK_RULES (12 strings) / DEFAULT_NEGATIVE_RULES (12
-- strings) — src/lib/design/aiDna/types.ts — into every row whose arrays
-- were empty at the time. Result: 94.6% of all loaded lockRules text and
-- 89.0% of all loaded negativeRules text across the repository was that
-- exact duplicate, re-loaded and re-deduplicated on every single render.
--
-- Architecture decision (locked, same date): repository stores Delta
-- Knowledge only (what genuinely differs from the Engine default); the
-- Engine default itself is added back in exactly once, at compose time, by
-- recipeComposer/composer.ts's composeRenderRecipe (see that file's own
-- comment on this same change). This migration performs the corresponding
-- one-time data cleanup: for every row, remove any lockRules/negativeRules
-- entry that is a byte-exact match of one of the 12+12 Engine-default
-- strings, keeping every other entry (category extensions like Look
-- Cutting's Fit Knowledge, and genuine per-item overrides like Lorenzo
-- Premium Gold Class's custom negativeRules) untouched, in original order.
--
-- A row with no delta left over gets `[]`, not a missing key — matches
-- dnaResolver/resolver.ts's `?? []` and RuleListEditor's `Array.isArray(x)
-- ? x : []` guards, both already defensive about this shape.
update public.design_master_options
set ai_dna = ai_dna || jsonb_build_object(
  'lockRules',
  case
    when jsonb_typeof(ai_dna -> 'lockRules') = 'array' then
      coalesce(
        (
          select jsonb_agg(rule)
          from jsonb_array_elements_text(ai_dna -> 'lockRules') as rule
          where rule <> all (array[
            'Preserve garment silhouette exactly.',
            'Preserve garment proportion exactly.',
            'Preserve garment length exactly.',
            'Preserve seam alignment.',
            'Preserve natural drape.',
            'Preserve natural fold behaviour.',
            'Preserve component scale.',
            'Preserve relative placement of every component.',
            'Preserve garment construction integrity.',
            'Do not distort garment geometry.',
            'Do not modify garment structure.',
            'Keep the reference image as the primary visual source.'
          ])
        ),
        '[]'::jsonb
      )
    else ai_dna -> 'lockRules'
  end,
  'negativeRules',
  case
    when jsonb_typeof(ai_dna -> 'negativeRules') = 'array' then
      coalesce(
        (
          select jsonb_agg(rule)
          from jsonb_array_elements_text(ai_dna -> 'negativeRules') as rule
          where rule <> all (array[
            'Do not change customer identity.',
            'Do not change body shape.',
            'Do not change facial structure.',
            'Do not change skin tone.',
            'Do not crop garment.',
            'Do not change garment silhouette.',
            'Do not generate additional components.',
            'Do not remove selected components.',
            'Do not modify garment proportions.',
            'Do not alter reference garment structure.',
            'Do not change perspective unnaturally.',
            'Do not introduce artifacts.'
          ])
        ),
        '[]'::jsonb
      )
    else ai_dna -> 'negativeRules'
  end
);
