-- Component Render Recipe cleanup — data-only migration. No ALTER TABLE, no
-- column added/dropped/retyped: design_master_options.render_recipe is
-- JSONB, this only rewrites its content.
--
-- Architecture Lock (2026-08-04): camera/pose/lighting/composition/focus/
-- visibilityRules are now exclusive Render Engine responsibility (Base Hero,
-- Quality Foundation, Global Render Policy, Global Render Recipe). A
-- per-item Render Recipe must never carry global framing/shot content,
-- because Recipe Composer's mergeRecordField (recipeComposer/composer.ts)
-- lets a per-item value win over the Engine's own GlobalRenderPolicy on any
-- same-key collision — global content stored on a component silently
-- overrides the Engine, defeating the whole point of a singleton policy.
--
-- Repository audit (2026-08-04) found 3 of 32 design_master_options rows
-- had non-empty content in these 6 fields — everything else already
-- complied (empty `{}` per DEFAULT_RENDER_RECIPE, src/lib/design/
-- renderRecipe/types.ts): Lorenzo Premium Gold Class (bahan), Sudas Cuff
-- (manset), Sudas Plaket (plaket). This migration resets exactly those 6
-- keys to '{}' on those 3 rows — matching DEFAULT_RENDER_RECIPE's shape,
-- keys preserved, never deleted. Every other field (referenceInstruction on
-- ai_dna, lockRules, negativeRules, fabricBehavior, renderPriority, status,
-- version, and any other Component Knowledge) is untouched — the `||` merge
-- below only overwrites the 6 named keys, nothing else in the JSONB object.
update public.design_master_options
set render_recipe = render_recipe || jsonb_build_object(
  'camera', '{}'::jsonb,
  'pose', '{}'::jsonb,
  'lighting', '{}'::jsonb,
  'composition', '{}'::jsonb,
  'focus', '{}'::jsonb,
  'visibilityRules', '{}'::jsonb
)
where id in (
  '976794cd-3a4a-4d16-9e02-9efe0eda7699', -- Lorenzo Premium Gold Class (bahan)
  '45b09ccf-8e2c-4a08-aa3d-0745c697c793', -- Sudas Cuff (manset)
  '10eb5b65-18f0-4f7d-9642-6b48d50d3e46'  -- Sudas Plaket (plaket)
);
