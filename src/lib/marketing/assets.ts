// Sprint W1 revision — real premium photography sourced from the existing
// Supabase `master-data-photos` bucket (public, already used by the Design
// Studio's own Master Data Editor) instead of abstract placeholders,
// wherever a genuinely relevant, premium-quality asset exists. Centralized
// here so every section references the same source of truth and a catalog
// change only needs updating in one place.
//
// Deliberately NOT used: `consultation-photos` / `production-evidence`
// (real customer photos, not publishable) and the `material-photos` bucket
// (a single generic, uncurated swatch) — see
// PLAN_SPRINT_W1_HOMEPAGE_LUXURY_BLUEPRINT.md revision log for the
// asset-quality review that led to this list.
const SUPABASE_PROJECT_REF = 'vdgkbzpdgmlzyxaiznka'

function masterDataPhoto(path: string): string {
  return `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/master-data-photos/${path}`
}

// Fabric macro shots — real swatch photography, mapped to the 4 Fabric
// Highlight cards in copy.ts (same order).
export const fabricPhotos = {
  woolBlendTwill: masterDataPhoto('bahan/545437c4-fa54-42e8-9b62-d49b09018b45.jpg'),
  egyptianCotton: masterDataPhoto('bahan/34e3c9ab-941e-4bb6-9ddc-9ebfd1f77770.jpg'),
  linenWeave: masterDataPhoto('bahan/976794cd-3a4a-4d16-9e02-9efe0eda7699.jpg'),
  silkCottonBlend: masterDataPhoto('bahan/ce735b17-635a-4f68-833b-8d227d7eee1d.jpg'),
}

// Editorial garment photography (mannequin bust, curtain backdrop, patterned
// rug) — the same reference photography the Model Thobe / Look Cutting
// Master Data entries use. No customer or staff faces in any of these.
export const garmentPhotos = {
  blackPinstripe: masterDataPhoto('model_thobe/26d0f9ec-be59-452b-997e-792b5864f8dc.jpg'),
  navy: masterDataPhoto('model_thobe/764c1902-4f04-4099-84ed-b404f0ee835c.jpg'),
  maroonPiping: masterDataPhoto('look_cutting/22c5c8f6-e6d0-4d22-8469-90e5d9d4f26e.jpg'),
}

// The Design Studio / Measurement Workspace's own neutral fitting mannequin
// — served from the app's local /public, not Supabase. Reused as-is so the
// Configurator Preview teaser shows the real product, not a new illustration.
export const measurementMannequinSrc = '/mannequin/mannequin.webp'
