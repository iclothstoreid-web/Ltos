// Reference Binding — Engine Section 2/7 (Prompt Architecture Realignment,
// 2026-08-06; content originally Reference Binding Map, Reference Binding
// Architecture V2 2026-08-05, Responsibility Cleanup 2026-08-05). Renamed
// file only — wording and behavior are unchanged, this is a storage-location
// move, not a content change (see this refactor's own scope: "yang berubah
// hanya lokasi penyimpanan, struktur pipeline, builder, repository — bukan
// isi prompt").
//
// One Responsibility Per Layer — this layer answers exactly ONE question:
// WHICH IMAGE REPRESENTS WHAT. It does not answer, and must never again
// carry:
//   - WHO the customer is / preserve face, hairstyle, skin tone, body
//     (Identity Preservation's job — identityPreservation.ts)
//   - HOW to use a reference image generically — ignore lighting/texture/
//     background (Reference Usage Policy's job, referenceUsagePolicy.ts)
//   - WHAT to copy — specific geometry attributes (each component's own
//     Component Rules, assembled at that component's own Prompt Builder step)
//   - Component Rules (Garment Layout / each component's own job)
//
// Built ENTIRELY from which images are actually active this render — never
// a static "Image 1/2/3" list. A role that isn't sent is simply omitted
// from the returned string; an all-false input returns ''.
//
// Final Repository Knowledge Migration (2026-08-06) — FULL REPLACE of the
// per-role wording per latest Prompt UAT (Indonesian). The dynamic,
// only-active-roles behavior above is unchanged — the UAT brief's role list
// reads as the wording template for each role WHEN active, not a mandate to
// always emit all roles regardless of what's actually attached (that would
// contradict this file's own "never a static list" rule and could describe
// an image the model was never actually sent).
//
// NOT carried over: the UAT brief's 6th role, "Hero Manset/Cuff -> Referensi
// Geometri Cuff." Cuff has no AI Asset / Hero Image mechanism anywhere in
// this codebase — aiAssetComposer/composer.ts's own header table documents
// Cuff as text-only, never image-contributing (Architecture Lock, still
// current). Adding a Cuff Hero role here would require a new AI Asset
// capability (registry entry + Capability Engine wiring), which is an
// Architecture/Pipeline change explicitly out of scope for a Repository
// Knowledge-only migration. Flagged in this sprint's report — not
// implemented.
export interface ReferenceBindingRoles {
  customerPhoto: boolean
  baseHero: boolean
  collar: boolean
  placket: boolean
  pocket: boolean
}

const CUSTOMER_PHOTO_BINDING = 'Foto Pelanggan → Referensi Identitas.'
const BASE_HERO_BINDING = 'Base Hero Dasar → Referensi Siluet.'
const COLLAR_BINDING = 'Hero Kerah → Referensi Geometri Kerah.'
const PLACKET_BINDING = 'Hero Plaket → Referensi Geometri Plaket.'
const POCKET_BINDING = 'Hero Saku → Referensi Geometri Saku.'

// Order matches the fixed order images are actually attached in (route.ts:
// Customer -> Base Hero -> Collar -> Placket -> Pocket) so the Nth role
// named here lines up with the Nth image the model receives.
export function buildReferenceBinding(roles: ReferenceBindingRoles): string {
  const blocks: string[] = []
  if (roles.customerPhoto) blocks.push(CUSTOMER_PHOTO_BINDING)
  if (roles.baseHero) blocks.push(BASE_HERO_BINDING)
  if (roles.collar) blocks.push(COLLAR_BINDING)
  if (roles.placket) blocks.push(PLACKET_BINDING)
  if (roles.pocket) blocks.push(POCKET_BINDING)

  if (blocks.length === 0) return ''

  return ['Gambar referensi terlampir mewakili peran berikut:', ...blocks].join(' ')
}
