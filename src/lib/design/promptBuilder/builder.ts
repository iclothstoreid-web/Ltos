import type { MasterRenderRecipe } from '@/lib/design/recipeComposer/types'
import type { MasterDataCategory } from '@/lib/design/masterData'
import { pruneToLockRules } from './lockRules'
import type { RenderInstruction, RenderInstructionValidation } from './types'

// Prompt Builder (Sprint AI-06) — reads ONLY MasterRenderRecipe (accepting
// `| null` to propagate "Recipe Composer hasn't produced one yet," the
// same convention composeRenderRecipe/buildRenderRecipe already use
// elsewhere in this pipeline) and mechanically reshapes it into
// RenderInstruction. It never resolves conflicts, never merges recipes,
// never invents a default value, and never "fixes" an incomplete recipe —
// those are Recipe Composer's job, already done upstream. An incomplete
// MasterRenderRecipe simply produces an incomplete RenderInstruction,
// which validateRenderInstruction below reports; nothing here works
// around it.
//
// Fixed, one-time structural mapping (the Builder's own "grammar," decided
// once here — not re-decided per render):
//
//   MasterRenderRecipe field      RenderInstruction section
//   ------------------------      -------------------------
//   camera                    ->  camera            (direct)
//   lighting                  ->  lighting          (direct)
//   composition, focus        ->  composition       (focus nested under a `focus` key)
//   background                ->  background        (direct)
//   quality, style             ->  quality           (style nested under a `style` key)
//   negativeRules              ->  negativeRules     (direct)
//   pose                       ->  subject           (pose describes the subject)
//   visibilityRules             ->  body              (what's visible on the body)
//   garment                     ->  garment           (direct)
//   fabricIdentity, fabricBehavior -> fabric          (identity + behavior share the one section)
//   stitching                   ->  stitching         (direct)
//   embroidery                  ->  embroidery        (direct)
//
// garment/fabricIdentity/stitching/embroidery were added to MasterRenderRecipe
// by Recipe Composer (Sprint AI-07, after this Builder was first written) —
// this mapping was updated 2026-07-27 (DNA Resolver integration) to actually
// read them; they used to be hardcoded `{}` here, which silently dropped
// every Component/AI Design DNA-derived garment field before it ever reached
// a prompt. `sources`/`composedAt` are provenance metadata, not renderable
// content — RenderInstruction has no equivalent field, and none is invented;
// they are simply not carried forward.
// Reference-First (Sprint R-02) — `referenceBackedCategories` is optional
// and, when omitted, this function behaves exactly as before (full DNA
// text, no pruning) — every existing caller that doesn't pass it (Debug
// Viewer, Render Test Framework scripts) is unaffected. When passed, and
// `model_thobe` is in the set, `recipe.garment` is pruned to Lock Rules
// (lockRules.ts) before it's copied into RenderInstruction. Only the Anchor
// (model_thobe) is checked here — unlike compression.ts's per-entry
// formatEntryContent, `recipe.garment` at this point is Recipe Composer's
// ALREADY-MERGED, Anchor-collision-resolved single object (see
// recipeComposer/composer.ts's resolveRecipeConflict): per-category
// boundaries no longer exist for any key Model Thobe's own DNA also sets,
// so pruning can only be keyed on whether the Anchor itself is
// reference-backed, not on Collar/Plaket/Pocket individually. This path is
// diagnostic-only in production anyway (route.ts only serializes it when
// RENDER_DEBUG_LOG is on; the real prompt sent to OpenAI is compression.ts's
// output, which prunes per-category correctly — see compression.ts's
// formatEntryContent).
export function buildRenderInstruction(
  recipe: MasterRenderRecipe | null,
  referenceBackedCategories?: Set<MasterDataCategory>,
): RenderInstruction | null {
  if (!recipe) {
    return null
  }

  const garment = referenceBackedCategories?.has('model_thobe') ? pruneToLockRules(recipe.garment) : recipe.garment

  return {
    subject: { ...recipe.pose },
    body: { ...recipe.visibilityRules },
    garment: { ...garment },
    camera: { ...recipe.camera },
    lighting: { ...recipe.lighting },
    composition: { ...recipe.composition, focus: recipe.focus },
    background: { ...recipe.background },
    fabric: { ...recipe.fabricIdentity, ...recipe.fabricBehavior },
    stitching: { ...recipe.stitching },
    embroidery: { ...recipe.embroidery },
    quality: { ...recipe.quality, style: recipe.style },
    negativeRules: [...recipe.negativeRules],
  }
}

const REQUIRED_SECTIONS: Array<{ key: Exclude<keyof RenderInstruction, 'negativeRules'>; label: string }> = [
  { key: 'subject', label: 'Subject' },
  { key: 'body', label: 'Body' },
  { key: 'garment', label: 'Garment' },
  { key: 'camera', label: 'Camera' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'composition', label: 'Composition' },
  { key: 'background', label: 'Background' },
  { key: 'fabric', label: 'Fabric' },
  { key: 'stitching', label: 'Stitching' },
  { key: 'embroidery', label: 'Embroidery' },
  { key: 'quality', label: 'Quality' },
]

// Reports incompleteness — never "fixes" it. An empty section means
// upstream (Recipe Composer / Master Render Recipe) has nothing there
// yet; this function's only job is to say so, so a caller can decide
// whether to block Prompt Serializer or proceed anyway.
export function validateRenderInstruction(instruction: RenderInstruction | null): RenderInstructionValidation {
  if (!instruction) {
    return { valid: false, errors: ['RenderInstruction belum tersedia — Master Render Recipe belum di-compile.'] }
  }

  const errors: string[] = []

  REQUIRED_SECTIONS.forEach(({ key, label }) => {
    if (Object.keys(instruction[key]).length === 0) {
      errors.push(`${label} kosong — tidak ada data di Master Render Recipe.`)
    }
  })

  return { valid: errors.length === 0, errors }
}
