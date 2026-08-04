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
// No existing upload was available to seed this from at the time this
// module was written: neither live model_thobe row (Saudi Modern, Dubai
// Kandora Series) ever had an `ai_dna.metadata.sourceImage` set (both
// null — the old "Aktifkan Hero Image Internal" flow was never actually
// completed for either), so there was nothing to migrate without creating a
// NEW upload, which the brief explicitly forbade ("Tidak ada duplicate
// upload"). This shipped `null` — structurally ready, functionally a no-op —
// until an owner uploaded one real image to Supabase Storage and pointed
// this constant at its public URL.
//
// Activated 2026-08-04 — image uploaded manually (owner, via Supabase
// Dashboard, not through any app upload flow — no admin UI writes this
// bucket path) to `master-data-photos/base-foto/base-hero.jpg` (verified via
// `storage.objects`: 3,447,182 bytes, image/jpeg, matches the local source
// file byte-for-byte). This is the first and only value this constant has
// ever held besides `null`.
export const GLOBAL_BASE_HERO_IMAGE_URL: string | null =
  'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/base-foto/base-hero.jpg'
