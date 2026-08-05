// Reference Binding Map (Reference Binding Architecture V2, 2026-08-05) —
// ONE of the Render Engine's sibling concerns (alongside Base Hero Model/
// Quality Foundation/Global Render Policy/Global Render Recipe/Global
// Reference Policy Geometry). Root cause audit found OpenAI's Images API
// (`images.edit`, verified against the installed SDK's own
// ImageEditParamsBase type) has no label/role/id/metadata field for an
// individual image in a multi-image request — `image` is a plain
// `Uploadable[]`. The prompt text is the ONLY channel available to tell the
// model which attached image plays which role, and nothing in the pipeline
// stated that binding before this layer existed.
//
// This layer answers exactly one question per attached image — "what does
// this picture represent" — and nothing else. It deliberately does NOT
// carry:
//   - Lock Rules / Negative Rules (Global Render Policy's job)
//   - Quality (Quality Foundation's job)
//   - Camera / Lighting (Global Render Recipe's job)
//   - Material / Color (Component Default Knowledge / DNA Color's job)
//   - detailed per-component geometry (Component Delta's job — Collar/
//     Placket/Pocket's own instruction constants, aiAssetComposer/
//     registry.ts, already carry the exhaustive "Transfer only: ..." /
//     "Do NOT copy: ..." lists; this layer only names the role and a short,
//     generic identity summary, never duplicating that detail)
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

const CUSTOMER_PHOTO_BINDING =
  "Customer Photo — this image defines the customer's identity. Preserve: facial identity, hairstyle, skin tone, body proportion, and overall identity. Only replace the garment."

const BASE_HERO_BINDING =
  'Base Hero — this image defines the garment silhouette only. Follow only: garment proportion, silhouette, and overall construction. Do not copy the person.'

const COLLAR_BINDING =
  'Collar Reference — this image defines only the collar geometry. Copy only: collar outline, collar curvature, collar construction, and collar proportion. Ignore every other visual element.'

const PLACKET_BINDING =
  'Placket Reference — this image defines only the placket geometry. Copy only: placket outline, placket construction, and placket proportion. Ignore every other visual element.'

const POCKET_BINDING =
  'Pocket Reference — this image defines only the pocket geometry. Copy only: pocket outline, pocket placement, and pocket proportion. Ignore every other visual element.'

// Order matches the fixed order images are actually attached in (route.ts:
// Customer -> Base Hero -> Collar -> Placket -> Pocket) so the Nth role
// block here lines up with the Nth image the model receives.
export function buildReferenceBindingMap(roles: ReferenceBindingRoles): string {
  const blocks: string[] = []
  if (roles.customerPhoto) blocks.push(CUSTOMER_PHOTO_BINDING)
  if (roles.baseHero) blocks.push(BASE_HERO_BINDING)
  if (roles.collar) blocks.push(COLLAR_BINDING)
  if (roles.placket) blocks.push(PLACKET_BINDING)
  if (roles.pocket) blocks.push(POCKET_BINDING)

  if (blocks.length === 0) return ''

  return ['The attached reference images have the following roles.', ...blocks].join(' ')
}
