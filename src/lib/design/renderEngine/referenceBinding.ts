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
export interface ReferenceBindingRoles {
  customerPhoto: boolean
  baseHero: boolean
  collar: boolean
  placket: boolean
  pocket: boolean
}

const CUSTOMER_PHOTO_BINDING = 'Customer Photo -> Identity Reference.'
const BASE_HERO_BINDING = 'Base Hero -> Silhouette Reference.'
const COLLAR_BINDING = 'Collar Hero -> Collar Geometry Reference.'
const PLACKET_BINDING = 'Placket Hero -> Placket Geometry Reference.'
const POCKET_BINDING = 'Pocket Hero -> Pocket Geometry Reference.'

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

  return ['The attached reference images represent the following roles.', ...blocks].join(' ')
}
