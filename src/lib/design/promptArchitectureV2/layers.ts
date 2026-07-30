import type { RenderInstruction } from '@/lib/design/promptBuilder/types'
import { formatSection } from '@/lib/design/promptBuilder/serializer'
import { compressPrompt, type PromptSection } from '@/lib/design/promptBuilder/compression'

// Prompt Architecture V2 (Sprint AI-R2.5, Part 1) — a NEW, parallel prompt
// construction path used only by the Render Test Framework (Prompt
// Inspector V2, DNA Debug Viewer, Render Test Runner). It never replaces
// promptBuilder/serializer.ts (still V1, still what the real production
// route /api/design/render/route.ts calls) — this module exists so V1 and
// V2 can be compared side by side before V2 is ever trusted with a live
// customer render. Swapping production over to V2 is an explicit future
// decision, not something this sprint makes.
//
// The brief's 4 layers, in the fixed order they must always be composed:
//   1. IDENTITY    — permanent template, never derived from DNA
//   2. COMPOSITION — permanent template, never derived from DNA
//   3. GARMENT DNA — 100% derived from Recipe Composer's output
//      (RenderInstruction.garment/fabric/stitching/embroidery — the merged
//      result of Model, Look Cutting, Material, Color, Collar, Cuff,
//      Pocket, Button, Embroidery, Handmade Zigzag). Never hardcoded.
//   4. QUALITY     — permanent template, never derived from DNA
//
// Known limitation (report this, don't silently patch it): Recipe Composer
// merges every contributing Master Item's `garment` fields into ONE flat
// record (recipeComposer/composer.ts's mergeRecordField) — per-field
// category provenance only survives in composeRenderRecipeTrace's separate
// debug trace, not in RenderInstruction itself. So Layer 3 below reads as
// "Garment — key: value, key: value...", not "Model: ..., Collar: ...,
// Cuff: ..." broken out per source category. Producing that breakdown for
// real would require Recipe Composer to carry per-field provenance into
// MasterRenderRecipe itself — a business-logic change this sprint's brief
// explicitly rules out ("Jangan redesign business logic").

export const LAYER1_IDENTITY_TEMPLATE = [
  'Keep exactly the same person.',
  'Do not change: face, age, skin, hair, beard, body, body proportion, pose, perspective, lighting, background.',
  'Maintain original identity.',
  'Only replace clothing.',
].join(' ')

export const LAYER2_COMPOSITION_TEMPLATE = [
  'Maintain original framing.',
  'Full body. Head to toe. Feet visible. No crop.',
  'Maintain camera. Maintain perspective.',
].join(' ')

export const LAYER4_QUALITY_TEMPLATE = [
  'Luxury tailoring. Premium bespoke. Photorealistic.',
  'Natural folds. Real fabric. Luxury finish.',
].join(' ')

// Layer 3 — the ONLY layer built from data, never hardcoded. Reuses
// formatSection (promptBuilder/serializer.ts) so the exact same
// deterministic, key-sorted formatting V1 already uses for these same four
// RenderInstruction sections is not re-implemented a second, possibly
// diverging, way.
export function buildLayer3GarmentDna(instruction: RenderInstruction): string {
  return [
    formatSection('Garment', instruction.garment),
    formatSection('Fabric', instruction.fabric),
    formatSection('Stitching', instruction.stitching),
    formatSection('Embroidery', instruction.embroidery),
  ]
    .filter(Boolean)
    .join('. ')
}

export interface PromptLayersV2 {
  identity: string
  composition: string
  garmentDna: string
  quality: string
  negativeRules: string[]
}

// RenderInstruction can be null (Recipe Composer hasn't produced one yet) —
// same "null means not ready" convention as buildRenderInstruction/
// composeRenderRecipe elsewhere in this pipeline. Layer 1/2/4 are always
// present (they don't depend on DNA); only Layer 3 and negativeRules go
// empty when there's no instruction.
export function buildPromptLayersV2(instruction: RenderInstruction | null): PromptLayersV2 {
  return {
    identity: LAYER1_IDENTITY_TEMPLATE,
    composition: LAYER2_COMPOSITION_TEMPLATE,
    garmentDna: instruction ? buildLayer3GarmentDna(instruction) : '',
    quality: LAYER4_QUALITY_TEMPLATE,
    negativeRules: instruction?.negativeRules ?? [],
  }
}

// Layer 1 -> 2 -> 3 -> 4, in that fixed order, joined the same way V1's
// serializeOpenAI joins its sections — one sentence-separated string, with
// negativeRules folded into a trailing "Avoid:" clause since GPT Image has
// no dedicated negative-prompt parameter (same reason serializer.ts does
// this for V1).
export function mergePromptLayersV2(layers: PromptLayersV2): string {
  const sections = [layers.identity, layers.composition, layers.garmentDna, layers.quality].filter(Boolean)
  let merged = sections.join(' ')

  const negativeRules = layers.negativeRules.filter(Boolean)
  if (negativeRules.length > 0) {
    merged += ` Avoid: ${negativeRules.join(', ')}.`
  }

  return merged
}

// Token-budgeted compression for V2, reusing the exact same compressPrompt
// engine V1 uses (promptBuilder/compression.ts) — only the section
// boundaries differ (4 fixed layers instead of V1's Anchor/Material/Other/
// Negatives buckets), so budget-fitting/truncation/omission behavior is
// guaranteed identical, not a second implementation that could drift.
export function buildCompressedLayerSections(layers: PromptLayersV2): PromptSection[] {
  return [
    { label: 'Identity', content: layers.identity, maxTokens: 40 },
    { label: 'Composition', content: layers.composition, maxTokens: 30 },
    { label: 'GarmentDNA', content: layers.garmentDna, maxTokens: 150 },
    { label: 'Quality', content: layers.quality, maxTokens: 25 },
    { label: 'Negatives', content: layers.negativeRules.join(', '), maxTokens: 50 },
  ]
}

export function compressPromptLayersV2(layers: PromptLayersV2, totalBudget = 270) {
  return compressPrompt(buildCompressedLayerSections(layers), totalBudget)
}
