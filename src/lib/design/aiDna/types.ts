// AI Design DNA — permanent, per-ITEM asset (never per-category; Category is
// only a container). This sprint builds the lifecycle/structure only: no
// OpenAI call, no Vision, no Prompt content. See buildPromptFromDNA /
// buildRenderInstruction (promptBuilder.ts) for the (still-empty) interface
// a later "AI Vision Integration" sprint will fill in.
export type AiDnaStatus = 'pending' | 'draft' | 'approved' | 'needs_regeneration'

export interface AiDesignDnaMetadata {
  generatedAt: string | null
  approvedAt: string | null
  sourceImage: string | null
  approvedBy: string | null
}

export interface AiDesignDna {
  status: AiDnaStatus
  version: number
  geometry: unknown | null
  construction: unknown | null
  appearance: unknown | null
  materials: unknown | null
  stitching: unknown | null
  placement: unknown | null
  negativeRules: string[]
  metadata: AiDesignDnaMetadata
}

// Matches the DB column default on design_master_options.ai_dna exactly —
// every INSERT (through this app or any future one) gets this shape for
// free at the database level, so no code path can ever create an item
// without a DNA object (see migration add_ai_design_dna_to_master_options).
export const DEFAULT_AI_DESIGN_DNA: AiDesignDna = {
  status: 'pending',
  version: 1,
  geometry: null,
  construction: null,
  appearance: null,
  materials: null,
  stitching: null,
  placement: null,
  negativeRules: [],
  metadata: {
    generatedAt: null,
    approvedAt: null,
    sourceImage: null,
    approvedBy: null,
  },
}

export const AI_DNA_STATUS_LABELS: Record<AiDnaStatus, string> = {
  pending: 'Pending',
  draft: 'Draft',
  approved: 'Approved',
  needs_regeneration: 'Needs Regeneration',
}

// Display order for the lifecycle indicator in the Master Data Editor —
// not a strict linear state machine (Needs Regeneration is reached from
// Draft/Approved, not from Pending), just the brief's own ordering.
export const AI_DNA_LIFECYCLE_ORDER: AiDnaStatus[] = ['pending', 'draft', 'approved', 'needs_regeneration']

// Hero Image was replaced — per the brief, flip status to Needs
// Regeneration and never delete the existing DNA content. Only meaningful
// once something has actually been generated (`draft`/`approved`); a `
// pending` item has no DNA yet, so there's nothing to regenerate and it
// stays `pending` until it's generated for the first time.
export function markDnaNeedsRegeneration(dna: AiDesignDna): AiDesignDna {
  if (dna.status !== 'draft' && dna.status !== 'approved') return dna
  return { ...dna, status: 'needs_regeneration' }
}
