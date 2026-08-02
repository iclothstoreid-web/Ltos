-- Reference-First Render Engine Cleanup — data-only migration. No ALTER
-- TABLE: design_master_options.ai_dna is a JSONB column not defined in any
-- tracked migration (predates this repo's migration history — see
-- src/lib/design/aiDna/types.ts's DEFAULT_AI_DESIGN_DNA comment), so
-- "removing" its 5 legacy narrative fields is a content/shape change inside
-- the JSON, not a schema change.
--
-- For every design_master_options row:
--   1. Backfill ai_dna.referenceInstruction from whatever narrative text
--      already exists (appearance, else geometry/construction/stitching/
--      materials, concatenated) — ONLY when referenceInstruction is not
--      already set, so no admin-visible content silently disappears for an
--      already-approved item.
--   2. Seed ai_dna.lockRules / ai_dna.negativeRules with the default lists
--      (keep in sync with DEFAULT_LOCK_RULES / DEFAULT_NEGATIVE_RULES in
--      src/lib/design/aiDna/types.ts) — ONLY when those arrays are
--      currently empty or missing.
--   3. Strip the 5 legacy narrative keys (geometry, construction,
--      appearance, materials, stitching) from ai_dna.
--
-- NOT applied to the live Supabase project as part of writing this file —
-- mutating every Master Data row is a separate, explicit approval step.

update public.design_master_options
set ai_dna = (
  (
    case
      when coalesce(ai_dna ->> 'referenceInstruction', '') <> '' then ai_dna
      else jsonb_set(
        ai_dna,
        '{referenceInstruction}',
        -- jsonb_set is STRICT: to_jsonb(NULL) yields SQL NULL (not a JSON
        -- null), and a NULL replacement value makes jsonb_set return NULL
        -- for the whole row, which then violates ai_dna's NOT NULL
        -- constraint. Rows with no narrative content at all (e.g. "Asil
        -- Cuff") hit this — coalesce to 'null'::jsonb so the key is set to
        -- JSON null instead of nulling out the entire column.
        coalesce(
          to_jsonb(
            nullif(
              concat_ws(
                ', ',
                nullif(ai_dna ->> 'appearance', ''),
                nullif(ai_dna ->> 'geometry', ''),
                nullif(ai_dna ->> 'construction', ''),
                nullif(ai_dna ->> 'stitching', ''),
                nullif(ai_dna ->> 'materials', '')
              ),
              ''
            )
          ),
          'null'::jsonb
        ),
        true
      )
    end
  )
  || jsonb_build_object(
    'lockRules',
    case
      when jsonb_typeof(ai_dna -> 'lockRules') = 'array' and jsonb_array_length(ai_dna -> 'lockRules') > 0
        then ai_dna -> 'lockRules'
      else '[
        "Preserve garment silhouette exactly.",
        "Preserve garment proportion exactly.",
        "Preserve garment length exactly.",
        "Preserve seam alignment.",
        "Preserve natural drape.",
        "Preserve natural fold behaviour.",
        "Preserve component scale.",
        "Preserve relative placement of every component.",
        "Preserve garment construction integrity.",
        "Do not distort garment geometry.",
        "Do not modify garment structure.",
        "Keep the reference image as the primary visual source."
      ]'::jsonb
    end,
    'negativeRules',
    case
      when jsonb_typeof(ai_dna -> 'negativeRules') = 'array' and jsonb_array_length(ai_dna -> 'negativeRules') > 0
        then ai_dna -> 'negativeRules'
      else '[
        "Do not change customer identity.",
        "Do not change body shape.",
        "Do not change facial structure.",
        "Do not change skin tone.",
        "Do not crop garment.",
        "Do not change garment silhouette.",
        "Do not generate additional components.",
        "Do not remove selected components.",
        "Do not modify garment proportions.",
        "Do not alter reference garment structure.",
        "Do not change perspective unnaturally.",
        "Do not introduce artifacts."
      ]'::jsonb
    end
  )
) - 'geometry' - 'construction' - 'appearance' - 'materials' - 'stitching';
