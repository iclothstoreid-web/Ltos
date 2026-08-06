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
// Repository Knowledge Migration Phase 1 (2026-08-06) — VERBATIM placement
// of the Prompt UAT block, byte-exact (Source of Truth; no rewrite, no
// paraphrase). Supersedes the prior "Final Repository Knowledge Migration"
// pass's cleaned-up wording (which used "→" and dropped the UAT's own
// irregular spacing/wording) — this pass restores the UAT text exactly,
// including its inconsistent "->" spacing and the extra "dan"/"adalah
// kanvas" wording per role. The dynamic, only-active-roles behavior above is
// still unchanged — the UAT role list is the wording template for each role
// WHEN active, not a mandate to always emit all roles regardless of what's
// actually attached.
//
// STILL NOT WIRED IN: the UAT brief's 6th role, "hero manset/cuff dan->
// referensi geometri cuff" (verbatim, stored below as CUFF_BINDING but never
// pushed into buildReferenceBinding's output). Flagged identically in the
// prior sprint's report and repeated here unchanged in this UAT text — Cuff
// still has no AI Asset / Hero Image mechanism anywhere in this codebase
// (aiAssetComposer/composer.ts's own header table documents Cuff as
// text-only, never image-contributing — Architecture Lock, still current).
// Wiring it in would require adding a `cuff` field to ReferenceBindingRoles
// AND updating every caller (route.ts, dryRunCompressionTest.ts) to pass a
// value for it — an Architecture/Pipeline change, out of scope for a
// Repository Knowledge-only migration ("sesuai arsitektur yang sudah
// di-lock"). The content itself is NOT deleted (see CUFF_BINDING) so no
// sentence from the Source of Truth is lost — only its live wiring is
// withheld pending an explicit Architecture decision. Flagged again in this
// sprint's report.
export interface ReferenceBindingRoles {
  customerPhoto: boolean
  baseHero: boolean
  collar: boolean
  placket: boolean
  pocket: boolean
}

const CUSTOMER_PHOTO_BINDING = 'Foto Pelanggan dan -> Referensi Identitas.'
const BASE_HERO_BINDING = 'base Hero Dasar adalah kanvas -> Referensi Siluet.'
const COLLAR_BINDING = 'Hero Kerah-> Referensi Geometri Kerah.'
const PLACKET_BINDING = 'Hero Plaket dan-> Referensi Geometri Plaket.'
const POCKET_BINDING = 'Hero Saku dan-> Referensi Geometri Saku.'
// Verbatim from Prompt UAT — not wired into buildReferenceBinding, see the
// header comment above. Exported (rather than left as a dead local) so the
// content stays reachable/greppable, not silently orphaned.
export const CUFF_BINDING = 'hero manset/cuff dan-> referensi geometri cuff'

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
