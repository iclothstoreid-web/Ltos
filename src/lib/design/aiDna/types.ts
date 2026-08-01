// AI Design DNA — permanent, per-ITEM asset (never per-category; Category is
// only a container). Prompt and render-instruction construction lives in
// src/lib/design/promptBuilder/; this module owns the DNA lifecycle and shape.
//
// Reference-First Cleanup (Sprint "Reference-First Render Engine Cleanup") —
// the five freeform narrative fields (geometry/construction/appearance/
// materials/stitching) are gone. Nothing in this app ever exposed them as
// field-by-field editable UI (AiDesignDnaSection.tsx was always a read-only
// lifecycle recap), so there was no admin workflow to preserve. They are
// replaced by ONE admin-editable `referenceInstruction` string (what the
// old 5 fields tried to describe in prose, now one field an owner can
// actually write/edit from the Master Data Editor) plus per-item
// `lockRules`/`negativeRules` (CRUD+reorder in the UI) and optional
// `renderNotes` (admin-facing only, never sent to GPT). `placement` is kept
// as-is — structural positioning a photo can't convey, not narrative.
//
// The `needs_regeneration` member means "the Hero Image changed, go
// re-activate it as a Reference" on the Reference-First architecture, not
// "the DNA content is stale and must be regenerated" — the DNA fields
// themselves are untouched by this transition (see markDnaNeedsRegeneration
// below). Master Data UI Cleanup (Sprint R-06.1) removed the lifecycle
// status display (Pending/Draft/Approved/Needs Review radio row) from
// AiDesignDnaSection.tsx — `status` itself is unchanged and still gates
// aiAssetComposer's isAiAssetActive(), only its old label constants
// (AI_DNA_STATUS_LABELS/AI_DNA_LIFECYCLE_ORDER) were removed as dead code
// once nothing rendered them anymore.
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
  // Instruction to GPT Image on how to use the Hero Image (silhouette,
  // proportion, length, seam alignment, fold/drape behaviour, component
  // positioning, relative scale, construction reference — what to keep,
  // what to ignore, what Color DNA overrides). For a category with no Hero
  // Image mechanism, this is simply the full descriptive text, the role the
  // old narrative fields used to play.
  referenceInstruction: string | null
  // Positive constraints ("Preserve garment silhouette exactly.") — CRUD +
  // reorder in the Master Data Editor, seeded from DEFAULT_LOCK_RULES.
  lockRules: string[]
  // Negative constraints ("Do not change customer identity.") — CRUD +
  // reorder in the Master Data Editor, seeded from DEFAULT_NEGATIVE_RULES.
  negativeRules: string[]
  // Optional admin-facing note (e.g. "why this Lock Rule was added," known
  // render quirks) — never serialized into the GPT payload.
  renderNotes: string | null
  placement: unknown | null
  metadata: AiDesignDnaMetadata
}

// Seed content for a new item's Lock Rules / Negative Rules — also used by
// the data-cleanup migration to backfill existing rows whose arrays are
// still empty. An owner can Add/Edit/Delete/Reorder from here via the
// Master Data Editor; this is only the starting point, not a fixed list.
export const DEFAULT_LOCK_RULES: string[] = [
  'Preserve garment silhouette exactly.',
  'Preserve garment proportion exactly.',
  'Preserve garment length exactly.',
  'Preserve seam alignment.',
  'Preserve natural drape.',
  'Preserve natural fold behaviour.',
  'Preserve component scale.',
  'Preserve relative placement of every component.',
  'Preserve garment construction integrity.',
  'Do not distort garment geometry.',
  'Do not modify garment structure.',
  'Keep the reference image as the primary visual source.',
]

export const DEFAULT_NEGATIVE_RULES: string[] = [
  'Do not change customer identity.',
  'Do not change body shape.',
  'Do not change facial structure.',
  'Do not change skin tone.',
  'Do not crop garment.',
  'Do not change garment silhouette.',
  'Do not generate additional components.',
  'Do not remove selected components.',
  'Do not modify garment proportions.',
  'Do not alter reference garment structure.',
  'Do not change perspective unnaturally.',
  'Do not introduce artifacts.',
]

// Matches the DB column default on design_master_options.ai_dna exactly —
// every INSERT (through this app or any future one) gets this shape for
// free at the database level, so no code path can ever create an item
// without a DNA object (see migration add_ai_design_dna_to_master_options).
export const DEFAULT_AI_DESIGN_DNA: AiDesignDna = {
  status: 'pending',
  version: 1,
  referenceInstruction: null,
  lockRules: [...DEFAULT_LOCK_RULES],
  negativeRules: [...DEFAULT_NEGATIVE_RULES],
  renderNotes: null,
  placement: null,
  metadata: {
    generatedAt: null,
    approvedAt: null,
    sourceImage: null,
    approvedBy: null,
  },
}

// Hero Image was replaced — per the brief, flip status to Needs Review
// (Sprint R-06 — previously labeled "Needs Regeneration") and never delete
// the existing DNA content. Only meaningful once something has actually
// been generated (`draft`/`approved`); a `pending` item has no DNA yet, so
// there's nothing to review and it stays `pending` until it's generated
// for the first time.
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
    // Spreading DEFAULT metadata first, then `dna.metadata`, guards a row
    // whose `metadata` key is entirely missing (e.g. overwritten by a raw
    // SQL data fix) — `{...undefined}` alone would silently drop
    // approvedAt/approvedBy instead of throwing, which is how such a row
    // could quietly end up with a metadata object the rest of the app
    // (AiDesignDnaSection) never expected. Self-heals on next Generate.
    metadata: { ...DEFAULT_AI_DESIGN_DNA.metadata, ...dna.metadata, generatedAt: now, sourceImage: photoUrl },
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
    // See markDnaGenerated above for why DEFAULT metadata is spread first.
    metadata: { ...DEFAULT_AI_DESIGN_DNA.metadata, ...dna.metadata, approvedAt: now, approvedBy },
  }
}
