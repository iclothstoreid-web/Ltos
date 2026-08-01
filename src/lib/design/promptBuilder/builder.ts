import type { MasterRenderRecipe } from '@/lib/design/recipeComposer/types'
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
// Reference-First Cleanup — `recipe.garment` no longer carries prunable
// narrative fields (see dnaResolver/resolver.ts: it only ever holds
// `referenceInstruction`/`placement`/`color` now), so there is nothing left
// to prune here. `garment` passes through unchanged, same as every other
// MasterRenderRecipe field this function reshapes.
export function buildRenderInstruction(recipe: MasterRenderRecipe | null): RenderInstruction | null {
  if (!recipe) {
    return null
  }

  return {
    subject: { ...recipe.pose },
    body: { ...recipe.visibilityRules },
    garment: { ...recipe.garment },
    camera: { ...recipe.camera },
    lighting: { ...recipe.lighting },
    composition: { ...recipe.composition, focus: recipe.focus },
    background: { ...recipe.background },
    fabric: { ...recipe.fabricIdentity, ...recipe.fabricBehavior },
    stitching: { ...recipe.stitching },
    embroidery: { ...recipe.embroidery },
    quality: { ...recipe.quality, style: recipe.style },
    negativeRules: [...recipe.negativeRules],
    lockRules: [...recipe.lockRules],
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
