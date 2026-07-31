// Version labels (Sprint AI-R2.5, Part 8 report fields) — this codebase has
// no runtime version numbers on the serializer/compression modules
// themselves; these are static, human-readable labels identifying which
// sprint last changed each stage, so a Regression Report can say what
// pipeline shape actually produced a given result without guessing.
// Bump/extend the relevant entry whenever that module's OWN sprint changes
// its behavior — this file is documentation, it has no effect on runtime.

export const PIPELINE_VERSIONS = {
  promptArchitecture: {
    v1: 'V1 — Sprint AI-06/AI-R1 (single serializer, compression buckets Anchor/Material/Other/Negatives)',
    v2: 'V2 — Sprint AI-R2.5 (4-layer: Identity/Composition/GarmentDNA/Quality)',
  },
  serializer: 'promptBuilder/serializer.ts — Sprint AI-06',
  compression: 'promptBuilder/compression.ts — Sprint AI-R1 (~270 token budget)',
  dnaResolver: 'dnaResolver/resolver.ts — Sprint AI-07/2026-07-27',
  recipeComposer: 'recipeComposer/composer.ts — Sprint AI-05/AI-07/AI-R1/AI-R2',
} as const

export type PromptVersion = 'v1' | 'v2'
