import type { PromptLayersV2 } from './layers'

// Prompt Validator (Sprint AI-R2.5, Part 3) — deterministic, no AI. Runs
// BEFORE a V2 request is sent to OpenAI. Checks each of the 4 layers
// (layers.ts) is non-empty; if any layer is empty, `valid` is false and the
// caller must not send the request ("Jangan kirim request" per the brief).
// negativeRules is reported but never fails validation on its own — Layer
// 1's identity template already carries the hard identity-lock constraints
// in positive form, so an empty negativeRules list is not itself a failure.

export interface PromptLayerCheck {
  layer: 'identity' | 'composition' | 'garmentDna' | 'quality'
  label: string
  status: 'PASS' | 'FAIL'
  reason: string
}

export interface PromptValidatorResult {
  valid: boolean
  checks: PromptLayerCheck[]
}

const LAYER_ORDER: { layer: PromptLayerCheck['layer']; label: string }[] = [
  { layer: 'identity', label: 'Layer 1 — Identity' },
  { layer: 'composition', label: 'Layer 2 — Composition' },
  { layer: 'garmentDna', label: 'Layer 3 — Garment DNA' },
  { layer: 'quality', label: 'Layer 4 — Quality' },
]

export function validatePromptLayers(layers: PromptLayersV2): PromptValidatorResult {
  const checks: PromptLayerCheck[] = LAYER_ORDER.map(({ layer, label }) => {
    const content = layers[layer]
    const nonEmpty = typeof content === 'string' && content.trim().length > 0
    return {
      layer,
      label,
      status: nonEmpty ? 'PASS' : 'FAIL',
      reason: nonEmpty ? `${content.trim().length} karakter.` : `${label} kosong — request tidak boleh dikirim.`,
    }
  })

  return { valid: checks.every((check) => check.status === 'PASS'), checks }
}
