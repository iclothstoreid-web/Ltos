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
// actually write/edit from the Master Data Editor) plus optional
// `renderNotes` (admin-facing only, never sent to GPT). `placement` is kept
// as-is — structural positioning a photo can't convey, not narrative.
//
// Safe Migration (2026-08-07) — `lockRules`/`negativeRules` as two separate
// concepts were retired in favor of ONE field, `componentRules` — every
// constraint (positive or negative) this component carries, in authored
// order. CRUD+reorder in the UI (RuleListEditor).
//
// Sprint Cleanup (2026-08-09) — the transitional `lockRules`/`negativeRules`
// legacy fields (and the DB data behind them) have been removed entirely;
// `componentRules` is now the only shape, on every row (see Final Master
// Data Cleanup sprint report). `resolveComponentRules` in
// dnaResolver/resolveComponentRules.ts still gates reads through one
// function for consistency, but no longer has legacy data to fall back to.
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
  // Component Rules — every constraint (positive or negative) this
  // component carries beyond the Engine's own Garment Layout / Final
  // Constraints sections (renderEngine/garmentLayout.ts,
  // renderEngine/finalConstraints.ts — merged in by Recipe Composer at
  // compose time as Engine defaults, never stored here — Delta Knowledge
  // decision, 2026-08-04, unchanged by this rename). CRUD + reorder in the
  // Master Data Editor. Empty for a component with no override; a category
  // extension (e.g. LOOK_CUTTING_FIT_COMPONENT_RULES below) or a genuine
  // per-item custom rule is the only content that belongs here.
  //
  // Optional at the type level for defensive callers only — every real row
  // has this populated (Sprint Cleanup, 2026-08-09); go through
  // dnaResolver/resolveComponentRules.ts rather than reading this key bare.
  componentRules?: string[]
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
// several lines that duplicated Identity Preservation's own template
// verbatim ("Do not change customer identity/body shape/facial structure/
// skin tone/perspective" — see renderEngine/identityPreservation.ts, which
// already states all of this and is not touched by this refactor). Both
// retired from here: their real (non-duplicate) content is now Garment
// Layout / Final Constraints' job, consolidated into ONE Engine source per
// section — see renderEngine/garmentLayout.ts and
// renderEngine/finalConstraints.ts. Quality-target content (what used to be
// called "Quality Foundation" both here and in recipeComposer/types.ts) now
// lives in renderEngine/globalQualityRules.ts — a third, distinct Engine
// responsibility, never mixed with the other two again. Look Cutting's own
// Fit Knowledge extension (LOOK_CUTTING_FIT_COMPONENT_RULES below) is
// unaffected — it was always a category-specific delta on top of the Engine
// default, not part of the Engine default itself.

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
//
// Prompt Architecture Realignment (2026-08-06) — the former
// LOOK_CUTTING_FIT_LOCK_RULES + LOOK_CUTTING_FIT_NEGATIVE_RULES pair is one
// array now (componentRules), same wording, same order (positive framing
// first, then the negative mirror) — this array was never part of the
// validated UAT prompt (Look Cutting was not selected in that render), so
// merging its storage shape carries zero wording-preservation risk. Look
// Cutting has no dedicated Prompt Builder step (it is a fit/silhouette
// delta, not a discrete visual reference component like Collar/Placket/
// Pocket/Cuff) — when selected, its componentRules are folded into the
// Garment Layout section alongside the Engine's own GARMENT_LAYOUT_RULES.
export const LOOK_CUTTING_FIT_COMPONENT_RULES: string[] = [
  'Apply the selected garment fit consistently across the entire thobe.',
  'Adjust only the garment silhouette.',
  "Control garment ease relative to the customer's existing body.",
  'Generate natural fabric drape.',
  'Maintain realistic folds and fabric tension.',
  "Preserve proportionality to the customer's existing body and pose.",
  'Ensure smooth fit transitions across shoulders, chest, waist, sleeves, and hem.',
  'Produce a physically plausible tailored garment.',
  'Do not modify body shape or proportions.',
  'Do not create unrealistic tightness or looseness.',
  'Do not stretch or shrink the garment unnaturally.',
  'Do not generate exaggerated folds or floating fabric.',
  'Do not modify garment length or sleeve length.',
  'Do not modify collar, cuffs, material, color, embroidery, placket, pockets, buttons, or any design element unrelated to garment fit.',
]

// Engine/Repository split (Delta Knowledge decision, 2026-08-04) — this is
// now the DELTA-ONLY seed for a freshly created item, not a copy of the
// Global Default Policy. `componentRules` starts empty on purpose: the
// Engine's own Garment Layout / Final Constraints sections stay the single
// Engine source (consumed once, at compose time, by
// recipeComposer/composer.ts's composeRenderRecipe — see its own comment),
// never copied into a row again. A component only ever stores what
// genuinely differs from that Engine default (a category extension like
// LOOK_CUTTING_FIT_COMPONENT_RULES, or a real per-item override) —
// masterData.ts's createMasterDataOption spreads this object then layers
// those extensions straight on top, so it now produces a delta-only array
// with no code change of its own required there.
//
// NOT the live DB column default (that column predates componentRules/
// referenceInstruction entirely — every insert path that matters
// (createMasterDataOption) already sends `ai_dna` or a category-specific
// object explicitly rather than relying on that stale default; a data
// migration reshapes existing rows' stored `lockRules`/`negativeRules` into
// `componentRules` — see supabase/migrations).
export const DEFAULT_AI_DESIGN_DNA: AiDesignDna = {
  status: 'pending',
  version: 1,
  referenceInstruction: null,
  componentRules: [],
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
// Nothing in the app calls this automatically: even though Component Hero
// Image = Catalog Photo now (Architecture Lock, 2026-08-04), a `photo_url`
// change does not auto-flip an already-approved `sourceImage` — the owner
// re-activates explicitly (AiDesignDnaSection's Activate button), same as
// before this lock (see masterData.ts's updateMasterDataOption). Only
// meaningful once something has actually been generated (`draft`/
// `approved`); a `pending` item has no DNA yet, so there's nothing to
// review and it stays `pending` until it's generated for the first time.
export function markDnaNeedsRegeneration(dna: AiDesignDna): AiDesignDna {
  if (dna.status !== 'draft' && dna.status !== 'approved') return dna
  return { ...dna, status: 'needs_regeneration', version: dna.version + 1 }
}

// AI DNA generated — freezes the Hero Image photo of that moment into
// `metadata.sourceImage` as the Official Reference Image (Design Knowledge
// Pipeline V1, decision 14; Component Hero Image = Catalog Photo,
// Architecture Lock 2026-08-04: the photo passed in is the item's own
// `photo_url`, never a separate upload — AiDesignDnaSection has no file
// picker anymore). This is a snapshot, not a live pointer — `sourceImage`
// only moves the next time this function runs, i.e. the next time an Owner
// activates the Hero Image again (e.g. after changing the catalog photo).
// Only a draft-worthy transition: reaching `approved`
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
