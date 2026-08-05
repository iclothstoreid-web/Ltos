// Reference Binding Map (Reference Binding Architecture V2, 2026-08-05;
// Responsibility Cleanup, 2026-08-05) — ONE of the Render Engine's sibling
// concerns (alongside Base Hero Model/Quality Foundation/Global Render
// Policy/Global Render Recipe/Global Reference Policy Geometry).
//
// One Responsibility Per Layer — this layer answers exactly ONE question:
// WHICH IMAGE REPRESENTS WHAT. It does not answer, and must never again
// carry:
//   - WHO the customer is / preserve face, hairstyle, skin tone, body
//     (Identity Layer's job — LAYER1_IDENTITY_TEMPLATE, promptArchitectureV2/
//     layers.ts, already states this in full; restating any of it here was
//     the duplicate responsibility this cleanup removes)
//   - HOW to use a reference image generically — ignore lighting/texture/
//     background (Global Reference Policy Geometry's job,
//     renderEngine/globalReferencePolicy.ts, already states this)
//   - WHAT to copy — specific geometry attributes (Component Delta's job —
//     Collar/Placket/Pocket's own instruction constants,
//     aiAssetComposer/registry.ts, already carry "Transfer only: .../Do NOT
//     copy: ..."; this layer never repeats that list)
//   - Lock Rules / Negative Rules (Global Render Policy's job)
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

const CUSTOMER_PHOTO_BINDING = 'Customer Photo is the Identity Reference.'
const BASE_HERO_BINDING = 'Base Hero is the Silhouette Reference.'
const COLLAR_BINDING = 'Collar Hero is the Collar Geometry Reference.'
const PLACKET_BINDING = 'Placket Hero is the Placket Geometry Reference.'
const POCKET_BINDING = 'Pocket Hero is the Pocket Geometry Reference.'

// Order matches the fixed order images are actually attached in (route.ts:
// Customer -> Base Hero -> Collar -> Placket -> Pocket) so the Nth role
// named here lines up with the Nth image the model receives.
export function buildReferenceBindingMap(roles: ReferenceBindingRoles): string {
  const blocks: string[] = []
  if (roles.customerPhoto) blocks.push(CUSTOMER_PHOTO_BINDING)
  if (roles.baseHero) blocks.push(BASE_HERO_BINDING)
  if (roles.collar) blocks.push(COLLAR_BINDING)
  if (roles.placket) blocks.push(PLACKET_BINDING)
  if (roles.pocket) blocks.push(POCKET_BINDING)

  if (blocks.length === 0) return ''

  return ['The attached reference images represent the following roles.', ...blocks].join(' ')
}
