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
  // Positive constraints beyond the Engine's own Global Render Policy
  // (renderEngine/globalRenderPolicy.ts, which Recipe Composer merges in at
  // compose time, not stored here — Delta Knowledge decision, 2026-08-04) —
  // CRUD + reorder in the Master Data Editor. Empty for a component with no
  // override; a category extension (e.g. LOOK_CUTTING_FIT_LOCK_RULES below)
  // or a genuine per-item custom rule is the only content that belongs here.
  lockRules: string[]
  // Negative constraints beyond the Engine's own Global Render Policy —
  // same Delta Knowledge treatment as lockRules above.
  negativeRules: string[]
  // Optional admin-facing note (e.g. "why this Lock Rule was added," known
  // render quirks) — never serialized into the GPT payload.
  renderNotes: string | null
  placement: unknown | null
  metadata: AiDesignDnaMetadata
}

// Render Engine Knowledge Refactor (2026-08-04) — this file used to define
// DEFAULT_LOCK_RULES/DEFAULT_NEGATIVE_RULES here as "Identity Knowledge,"
// merged by recipeComposer/composer.ts alongside DEFAULT_GLOBAL_RENDER_POLICY
// (recipeComposer/types.ts) — two separate Engine-default sources, both
// unconditionally merged into every render, with real content overlap (both
// carried garment-geometry/structure constraints in different wording) and
// several lines that duplicated Identity Lock's own template verbatim ("Do
// not change customer identity/body shape/facial structure/skin tone/
// perspective" — see promptArchitectureV2/layers.ts's LAYER1_IDENTITY_
// TEMPLATE, which already states all of this and is not touched by this
// refactor). Both retired from here: their real (non-duplicate) content is
// now Global Render Policy's job, consolidated into ONE Engine source —
// see renderEngine/globalRenderPolicy.ts. Composer.ts's merge now reads
// only `policy.lockRules`/`policy.negativeRules`, no second source. Quality-
// target content (what used to be called "Quality Foundation" both here and
// in recipeComposer/types.ts) now lives in renderEngine/qualityFoundation.ts
// — a third, distinct Engine responsibility, never mixed with the other two
// again. Look Cutting's own Fit Knowledge extension (LOOK_CUTTING_FIT_LOCK_
// RULES below) is unaffected — it was always a category-specific delta on
// top of the Engine default, not part of the Engine default itself.

// Fit Knowledge — belongs ONLY to category 'look_cutting'. Look Cutting
// controls ONLY how the garment fits and drapes on the customer's EXISTING
// body (silhouette, ease, drape, fold, tension) — it must never influence
// body shape or any other design component (Kerah, Manset, Plaket, Saku,
// Material, Warna, Aksesori, Bordir, Handmade Zig-Zag). Merged in only by
// masterData.ts's createMasterDataOption when category === 'look_cutting' —
// never added to DEFAULT_AI_DESIGN_DNA/the DB column default, since that
// default is category-agnostic and applies to every insert.
//
// This is the boundary shared by every Fit (Slim/Standard/Regular). The
// amount of ease and character of drape that distinguishes one Fit from
// another belongs in that item's own admin-authored `referenceInstruction`
// free text, not here — see AiDesignDnaSection.tsx's Look Cutting authoring
// caption.
export const LOOK_CUTTING_FIT_LOCK_RULES: string[] = [
  'Apply the selected garment fit consistently across the entire thobe.',
  'Adjust only the garment silhouette.',
  "Control garment ease relative to the customer's existing body.",
  'Generate natural fabric drape.',
  'Maintain realistic folds and fabric tension.',
  "Preserve proportionality to the customer's existing body and pose.",
  'Ensure smooth fit transitions across shoulders, chest, waist, sleeves, and hem.',
  'Produce a physically plausible tailored garment.',
]

export const LOOK_CUTTING_FIT_NEGATIVE_RULES: string[] = [
  'Do not modify body shape or proportions.',
  'Do not create unrealistic tightness or looseness.',
  'Do not stretch or shrink the garment unnaturally.',
  'Do not generate exaggerated folds or floating fabric.',
  'Do not modify garment length or sleeve length.',
  'Do not modify collar, cuffs, material, color, embroidery, placket, pockets, buttons, or any design element unrelated to garment fit.',
]

// Engine/Repository split (Delta Knowledge decision, 2026-08-04) — this is
// now the DELTA-ONLY seed for a freshly created item, not a copy of the
// Global Default Policy. `lockRules`/`negativeRules` start empty on
// purpose: Global Render Policy (renderEngine/globalRenderPolicy.ts) stays
// the single Engine source (consumed once, at compose time, by
// recipeComposer/composer.ts's composeRenderRecipe — see its own comment),
// never copied into a row again. A component only ever stores what
// genuinely differs from that Engine default (a category extension like
// LOOK_CUTTING_FIT_LOCK_RULES, or a real per-item override) — masterData.ts's
// createMasterDataOption spreads this object then layers those extensions
// straight on top, so it now produces delta-only arrays with no code change
// of its own required there.
//
// NOT the live DB column default (that column predates lockRules/
// referenceInstruction entirely — `information_schema.columns` shows it
// still building the old 5-narrative-field shape with `negativeRules: []`
// and no `lockRules` key at all — a pre-existing staleness this task does
// not touch, since altering the column default is a schema change and the
// locked scope forbids that; every insert path that matters (createMasterDataOption)
// already sends `ai_dna` or a category-specific object explicitly rather than
// relying on that stale default).
export const DEFAULT_AI_DESIGN_DNA: AiDesignDna = {
  status: 'pending',
  version: 1,
  referenceInstruction: null,
  lockRules: [],
  negativeRules: [],
  renderNotes: null,
  placement: null,
  metadata: {
    generatedAt: null,
    approvedAt: null,
    sourceImage: null,
    approvedBy: null,
  },
}

// Manual "flip to Needs Review" transition — kept for any future caller
// that wants to force a re-review without discarding existing DNA content.
// Since Hero Image Internal Separation, nothing in the app calls this
// automatically anymore: `photo_url` (catalog thumbnail) no longer has any
// relationship to `ai_dna.metadata.sourceImage` (the internal Render Engine
// reference), so a catalog photo change is no longer treated as a Hero
// Image change (see masterData.ts's updateMasterDataOption). Only
// meaningful once something has actually been generated (`draft`/
// `approved`); a `pending` item has no DNA yet, so there's nothing to
// review and it stays `pending` until it's generated for the first time.
export function markDnaNeedsRegeneration(dna: AiDesignDna): AiDesignDna {
  if (dna.status !== 'draft' && dna.status !== 'approved') return dna
  return { ...dna, status: 'needs_regeneration', version: dna.version + 1 }
}

// AI DNA generated — freezes the Hero Image Internal photo of that moment
// into `metadata.sourceImage` as the Official Reference Image (Design
// Knowledge Pipeline V1, decision 14; Hero Image Internal Separation
// sprint: the photo passed in is now uploaded through its own dedicated
// picker in AiDesignDnaSection, never the catalog `photo_url`). This is a
// snapshot, not a live pointer — `sourceImage` only moves the next time
// this function runs, i.e. the next time an Owner uploads/activates a new
// Hero Image Internal. Only a draft-worthy transition: reaching `approved`
// requires the separate markDnaApproved step below (AI Asset Lifecycle
// sprint) — generating alone is not approving.
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
