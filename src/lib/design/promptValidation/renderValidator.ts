// Render Validator (Sprint AI-R2.5, Part 5) — "Tanpa AI. Minimal." per the
// brief: every check here is a plain string/boolean check over data the
// pipeline already computed synchronously, zero network calls, zero
// OpenAI spend. Runs as the LAST gate before generateImage() is called; if
// `valid` is false, the caller must cancel the render ("Render dibatalkan")
// instead of sending the request.
//
// This is deliberately a DIFFERENT thing from renderQuality/qualityJudge.ts
// (the GPT-4o-mini vision judge from Sprint AI-R2) — that one inspects the
// actual pixels of a completed render and is a heuristic AI opinion, billed,
// and can only run AFTER a render exists. This module runs BEFORE a render
// is requested and never calls any AI provider.
//
// "Body framing valid" (the brief's own checklist item) does NOT mean
// classifying the customer photo's pixels (that already exists, separately,
// as classifyCustomerPhotoFraming — an AI call, opt-in, informational only).
// Deterministically, the only thing checkable without AI is whether the
// full-body/no-crop framing INSTRUCTION actually made it into the outgoing
// prompt text — i.e. whether Global Render Recipe's Visibility content
// (renderEngine/globalRenderRecipe.ts's GLOBAL_RENDER_RECIPE_VISIBILITY,
// merged into DEFAULT_GLOBAL_RENDER_POLICY.visibilityRules,
// recipeComposer/types.ts — split out from Camera by this same refactor's
// review revision, 2026-08-04) survived Prompt Builder -> Serializer/
// Compression instead of being silently dropped (which is exactly the bug
// class Sprint AI-R2 fixed once already). That is what
// `bodyFramingLockPresent` checks below.
//
// Sprint AI-R3 (AI Capability Engine) update: this module used to also gate
// on Model Reference availability (added in the prior "Reference DNA
// Architecture V1" turn). That has been REMOVED — a missing Model Reference
// is no longer a hard block anywhere in the pipeline; it is graded by
// capabilityEngine/engine.ts instead (drops the render to HIGH/STANDARD,
// never cancels it). This module keeps ONLY the checks that stay hard
// requirements regardless of capability grade: the request must still be a
// real, well-formed request to OpenAI (non-empty prompt, no serialization
// bugs, correct model/endpoint/fidelity/count) — those are request-shape
// correctness, not render-quality grading, so they still block on FAIL.
//
// Architecture Lock (2026-08-04) — the `model_thobe_present` check that
// used to sit here is REMOVED for the same reason: Model Thobe is
// catalog-only now (thumbnail/name/description/selling point), no longer
// an Anchor Prompt Assembly requires. Its presence or absence has no
// bearing on request correctness anymore.

export interface RenderRequestValidatorCheck {
  id: string
  label: string
  status: 'PASS' | 'FAIL'
  reason: string
}

export interface RenderRequestValidatorResult {
  valid: boolean
  cancelled: boolean
  checks: RenderRequestValidatorCheck[]
}

export interface RenderRequestValidatorInput {
  customerPhotoUrl: string | null | undefined
  referenceImageUrls: string[]
  prompt: string | null | undefined
  usesEdit: boolean
  endpoint: string
  model: string
  imageCount: number
  /** Substrings expected to survive into the final prompt if the full-body/
   *  no-crop framing text made it through. Defaults to the exact phrases
   *  Global Render Recipe (renderEngine/globalRenderRecipe.ts) sets on
   *  DEFAULT_GLOBAL_RENDER_POLICY.visibilityRules (recipeComposer/types.ts —
   *  moved off `.camera` by this same refactor's review revision, since
   *  Camera and Visibility are now separate fields with separate
   *  responsibility). Render Engine Knowledge Refactor (2026-08-04) — the
   *  previous default
   *  ('full body', 'locked') checked 'locked' against the old
   *  `quality.lock: '...identity and pose locked...'` text, which was
   *  itself a duplicate of Identity Lock's own template and has been
   *  retired (see aiDna/types.ts). This check's real purpose per the
   *  comment above is full-body/no-crop framing specifically, so both
   *  substrings now check that framing text directly. */
  framingLockSubstrings?: string[]
}

const DEFAULT_FRAMING_LOCK_SUBSTRINGS = ['full body', 'no crop']

function containsLiteral(text: string, literal: string): boolean {
  return new RegExp(`\\b${literal}\\b`, 'i').test(text)
}

export function validateRenderRequest(input: RenderRequestValidatorInput): RenderRequestValidatorResult {
  const prompt = input.prompt ?? null
  const framingLockSubstrings = input.framingLockSubstrings ?? DEFAULT_FRAMING_LOCK_SUBSTRINGS

  const checks: RenderRequestValidatorCheck[] = [
    {
      id: 'customer_image_present',
      label: 'Customer image ada',
      status: input.customerPhotoUrl ? 'PASS' : 'FAIL',
      reason: input.customerPhotoUrl ? input.customerPhotoUrl : 'customerPhotoUrl kosong.',
    },
    {
      id: 'reference_image_present',
      label: 'Reference image ada',
      status: input.referenceImageUrls.length > 0 ? 'PASS' : 'FAIL',
      reason: `${input.referenceImageUrls.length} reference image(s).`,
    },
    {
      id: 'prompt_not_empty',
      label: 'Prompt bukan kosong',
      status: prompt && prompt.trim().length > 0 ? 'PASS' : 'FAIL',
      reason: prompt && prompt.trim().length > 0 ? `${prompt.trim().length} karakter.` : 'Prompt kosong/null.',
    },
    {
      id: 'prompt_not_object_object',
      label: 'Prompt bukan [object Object]',
      status: prompt && prompt.includes('[object Object]') ? 'FAIL' : 'PASS',
      reason: prompt && prompt.includes('[object Object]') ? 'Ditemukan literal [object Object].' : 'Tidak ditemukan.',
    },
    {
      id: 'prompt_not_undefined',
      label: 'Prompt bukan undefined',
      status: prompt && containsLiteral(prompt, 'undefined') ? 'FAIL' : 'PASS',
      reason: prompt && containsLiteral(prompt, 'undefined') ? 'Ditemukan literal "undefined".' : 'Tidak ditemukan.',
    },
    {
      id: 'prompt_not_null_literal',
      label: 'Prompt bukan null',
      status: prompt === null || (prompt && containsLiteral(prompt, 'null')) ? 'FAIL' : 'PASS',
      reason: prompt === null ? 'Prompt itu sendiri null.' : prompt && containsLiteral(prompt, 'null') ? 'Ditemukan literal "null".' : 'Tidak ditemukan.',
    },
    {
      id: 'input_fidelity_high',
      label: 'Input Fidelity HIGH',
      status: input.usesEdit ? 'PASS' : 'FAIL',
      reason: input.usesEdit
        ? 'images.edit dipanggil dengan input_fidelity: "high" (image.ts).'
        : 'Tidak ada reference image -> images.generate dipakai, input_fidelity HIGH tidak berlaku.',
    },
    {
      id: 'model_gpt_image_edit',
      label: 'Model = gpt-image-1 (GPT Image Edit)',
      status: input.model === 'gpt-image-1' && input.usesEdit ? 'PASS' : 'FAIL',
      reason: `model=${input.model}, endpoint=${input.endpoint}.`,
    },
    {
      id: 'image_count_correct',
      label: 'Image Count benar (=1)',
      status: input.imageCount === 1 ? 'PASS' : 'FAIL',
      reason: `imageCount=${input.imageCount}.`,
    },
    {
      id: 'body_framing_lock_present',
      label: 'Body framing valid (full-body/no-crop lock ada di final prompt)',
      status: prompt && framingLockSubstrings.every((s) => prompt.toLowerCase().includes(s.toLowerCase())) ? 'PASS' : 'FAIL',
      reason: prompt
        ? `Dicek terhadap: ${framingLockSubstrings.join(', ')}.`
        : 'Prompt kosong — tidak bisa dicek.',
    },
  ]

  const valid = checks.every((check) => check.status === 'PASS')
  return { valid, cancelled: !valid, checks }
}
