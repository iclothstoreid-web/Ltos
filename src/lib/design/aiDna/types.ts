// AI Design DNA — permanent, per-ITEM asset (never per-category; Category is
// only a container). Prompt and render-instruction construction lives in
// src/lib/design/promptBuilder/; this module owns the DNA lifecycle and shape.
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
  return { ...dna, status: 'needs_regeneration', version: dna.version + 1 }
}

// AI DNA generated — freezes the Hero Image (`photo_url`) of that moment
// into `metadata.sourceImage` as the Official Reference Image (Design
// Knowledge Pipeline V1, decision 14). This is a snapshot, not a live
// pointer: `photo_url` may keep changing afterwards (decision 4), but
// `sourceImage` only moves the next time this function runs — i.e. the next
// generate — and Hero Image changing in between instead routes through
// markDnaNeedsRegeneration above, never through here. Only a draft-worthy
// transition: reaching `approved` requires the separate markDnaApproved
// step below (AI Asset Lifecycle sprint) — generating alone is not
// approving.
export function markDnaGenerated(dna: AiDesignDna, photoUrl: string | null): AiDesignDna {
  const now = new Date().toISOString()
  return {
    ...dna,
    status: 'draft',
    version: dna.version + 1,
    metadata: { ...dna.metadata, generatedAt: now, sourceImage: photoUrl },
  }
}

// AI Design DNA reviewed and approved (AI Asset Lifecycle sprint) — the
// ONLY function allowed to set status 'approved'. Only meaningful from
// 'draft' (there must be something generated — with a frozen sourceImage —
// to review in the first place); calling it on any other status is a no-op,
// same guard style as markDnaNeedsRegeneration above. This is the single
// event that turns a Master Item's AI Asset (aiAssetComposer/
// aiAssetComposer — the module reads `status === 'approved'`, not just
// `sourceImage` presence) ACTIVE — there is no separate "Create AI Asset"
// action anywhere in this codebase, by design (see aiAssetComposer's own
// header comment).
export function markDnaApproved(dna: AiDesignDna, approvedBy: string | null): AiDesignDna {
  if (dna.status !== 'draft') return dna
  const now = new Date().toISOString()
  return {
    ...dna,
    status: 'approved',
    version: dna.version + 1,
    metadata: { ...dna.metadata, approvedAt: now, approvedBy },
  }
}
