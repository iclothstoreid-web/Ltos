-- Final Master Data Cleanup (2026-08-09) — removes confirmed-dead and
-- Engine-duplicate fields from design_master_options.ai_dna / .render_recipe.
-- Every key removed here was verified, before this migration was written,
-- to have ZERO references anywhere in src/ (grep) and to NOT be part of
-- either the AiDesignDna or RenderRecipe TypeScript interface — meaning no
-- code path (DNA Resolver, Recipe Composer, Prompt Builder, Component
-- Default Knowledge, AI Asset Composer) has ever read them since those
-- interfaces were introduced. See this sprint's report for the full
-- per-field dependency trace.
--
-- Principle applied (per brief): global-scope content belongs to the
-- Engine (renderEngine/*), catalog-specific content belongs to Master Data.
-- Every field removed below is EITHER (a) an orphaned ad-hoc field that was
-- never part of any locked schema to begin with, or (b) a literal
-- duplicate of content the Engine now owns exclusively (Scene
-- Configuration / Global Quality Rules).
--
-- ai_dna:
--   appearance/construction/geometry/materials/stitching — the pre-
--     Reference-First-Cleanup 5-field narrative DNA shape, fully replaced
--     by `referenceInstruction` since that cleanup; these are stale
--     leftovers (all NULL-valued on the one row that still had the keys).
--   tone/undertone/brightness/saturation/description — legacy ad-hoc
--     warna_bahan color-description keys `colorDescriptionFallback()`
--     (dnaResolver/resolver.ts) reads ONLY when `referenceInstruction` is
--     empty. Verified: every warna_bahan row has `dna_color_id` set, and
--     every linked dna_colors row resolves to a non-empty colorText
--     (prompt, or hex as final fallback) — so route.ts's in-memory merge
--     always populates `referenceInstruction` before DNA Resolver ever
--     runs. This fallback path is 100% unreachable for current data; the
--     function itself is kept as a defensive fallback for a future row,
--     but the stale data it would have read is removed.
--   style/context_rules/edge_treatment/fabric_interaction/opening/
--     proportion/variant_id — ad-hoc fields unique to one `saku` row's
--     unintegrated "regional masked overlay" authoring attempt.
--
-- render_recipe:
--   background/quality/style — duplicate Engine content (Scene
--     Configuration / Global Quality Rules own these exclusively now;
--     RenderRecipe's TS interface has never declared these fields).
--   metadata/placement/blendInstructions — orphaned (not in RenderRecipe's
--     interface; `placement` belongs on AiDesignDna, never RenderRecipe).
--   rendering_approach — orphaned warna_bahan-specific narrative text,
--     superseded by dna_colors.prompt.
--   hexagon_rendering_priority — orphaned plaket-specific ad-hoc field.
--   base_reference/component_scope/context_to_gpt/iteration_strategy/
--     quality_gates/regional_mask/render_method/target_model — the same
--     unintegrated saku authoring attempt as above, on the render_recipe
--     side.
--
-- Non-destructive by construction: jsonb `-` on a missing key is a no-op,
-- so this is safe to run regardless of which rows actually have which key.

update design_master_options
set ai_dna = ai_dna
  - 'appearance' - 'construction' - 'geometry' - 'materials' - 'stitching'
  - 'tone' - 'undertone' - 'brightness' - 'saturation' - 'description'
  - 'style' - 'context_rules' - 'edge_treatment' - 'fabric_interaction'
  - 'opening' - 'proportion' - 'variant_id'
where ai_dna ?| array[
  'appearance', 'construction', 'geometry', 'materials', 'stitching',
  'tone', 'undertone', 'brightness', 'saturation', 'description',
  'style', 'context_rules', 'edge_treatment', 'fabric_interaction',
  'opening', 'proportion', 'variant_id'
];

update design_master_options
set render_recipe = render_recipe
  - 'background' - 'quality' - 'style'
  - 'metadata' - 'placement' - 'blendInstructions'
  - 'rendering_approach' - 'hexagon_rendering_priority'
  - 'base_reference' - 'component_scope' - 'context_to_gpt'
  - 'iteration_strategy' - 'quality_gates' - 'regional_mask'
  - 'render_method' - 'target_model'
where render_recipe ?| array[
  'background', 'quality', 'style',
  'metadata', 'placement', 'blendInstructions',
  'rendering_approach', 'hexagon_rendering_priority',
  'base_reference', 'component_scope', 'context_to_gpt',
  'iteration_strategy', 'quality_gates', 'regional_mask',
  'render_method', 'target_model'
];
