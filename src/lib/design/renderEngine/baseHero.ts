// Global Base Hero Image (Architecture Lock, 2026-08-04) — a single,
// engine-owned reference photo that accompanies EVERY render, independent of
// which Model Thobe, Collar, Plaket, Pocket, or any other component was
// selected. Before this revision, "Base Hero" was implemented as whichever
// Model Thobe row's Hero Image happened to be active — a per-item Master
// Data concern, gated by that row's own approval status, and different
// depending on which of the (currently two) Model Thobe rows the customer
// picked. That was the bug: Base Hero must be Render Engine ownership, not
// Master Data.
//
// This module is intentionally the smallest possible fix: a single constant,
// same "Engine, singleton, no editor yet" shape as
// DEFAULT_GLOBAL_RENDER_POLICY (recipeComposer/types.ts), which also shipped
// with no admin UI. It is NOT a MasterDataOption row, has no `ai_dna`, no
// approval gate, and is never selected per-order — route.ts includes it
// unconditionally (when set) for every render.
//
// No existing upload was available to seed this from: as of this revision,
// neither live model_thobe row (Saudi Modern, Dubai Kandora Series) has an
// `ai_dna.metadata.sourceImage` set (both null — the old "Aktifkan Hero
// Image Internal" flow was never actually completed for either), so there is
// nothing to migrate without creating a NEW upload, which the brief
// explicitly forbids ("Tidak ada duplicate upload"). This ships `null` —
// structurally ready, functionally a no-op — until an owner uploads one real
// image to Supabase Storage and this constant is pointed at its public URL.
//
// To activate: upload the image to the `master-data-photos` bucket (or a
// dedicated bucket/path of your choosing) via the Supabase dashboard or CLI,
// then set GLOBAL_BASE_HERO_IMAGE_URL to its public URL. No other code
// change is required — route.ts already reads this constant.
export const GLOBAL_BASE_HERO_IMAGE_URL: string | null = null
