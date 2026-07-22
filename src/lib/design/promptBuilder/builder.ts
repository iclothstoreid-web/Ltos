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
//   fabricBehavior               ->  fabric            (direct rename)
//
// MasterRenderRecipe has no field describing garment identity, stitching,
// or embroidery — Recipe Composer / Render Recipe never captured those
// concepts (see recipeComposer/types.ts, renderRecipe/types.ts). Builder
// does not invent them: `garment`, `stitching`, and `embroidery` are
// always `{}` until an upstream sprint adds real source data for them.
// `sources`/`composedAt` are provenance metadata, not renderable content —
// RenderInstruction has no equivalent field, and none is invented; they
// are simply not carried forward.
export function buildRenderInstruction(recipe: MasterRenderRecipe | null): RenderInstruction | null {
  if (!recipe) {
    return null
  }

  return {
    subject: { ...recipe.pose },
    body: { ...recipe.visibilityRules },
    garment: {},
    camera: { ...recipe.camera },
    lighting: { ...recipe.lighting },
    composition: { ...recipe.composition, focus: recipe.focus },
    background: { ...recipe.background },
    fabric: { ...recipe.fabricBehavior },
    stitching: {},
    embroidery: {},
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
