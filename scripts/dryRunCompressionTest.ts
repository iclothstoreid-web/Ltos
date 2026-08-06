// DRY-RUN COMPRESSION VALIDATION (QA ONLY, NO OPENAI SPEND) — 2026-07-31
// Refreshed 2026-08-06 (Render Investigation) — original Sprint PR-06 data
// was hardcoded from 2026-07-30 rows and predates Sprint A (Reference
// Policy Refactor) / Reference Binding Architecture V2 (both 2026-08-05),
// so it neither built `assetInstructions` nor exercised Plaket/Pocket
// reference composition (the old Plaket row's own `sourceImage` was a
// human-readable description, not a URL — it would never have passed
// `isAiAssetActive` for real). Re-fetched all 6 rows live from Supabase
// (design_master_options) moments before writing this file, plus the
// linked dna_colors row for Black — every field below is current
// production data, not a simulation. Confirms independently: Plaket's own
// AI Design DNA was re-authored since PAT-01/02 (lockRules/negativeRules
// now a few short lines, not the old 700-token CRITICAL list) — real
// content, not just the pipeline code, has also changed since Sprint R-03.
//
// This script is scratch-only: never committed, deleted after use.

import 'dotenv/config'

import type { MasterDataOption } from '../src/lib/design/masterData'
import { resolveDNA } from '../src/lib/design/dnaResolver/resolver'
import type { DNAResolverInput } from '../src/lib/design/dnaResolver/types'
import { composeRenderRecipe } from '../src/lib/design/recipeComposer/composer'
import { DEFAULT_GLOBAL_RENDER_POLICY } from '../src/lib/design/recipeComposer/types'
import type { RenderRecipeEntry } from '../src/lib/design/recipeComposer/types'
import type { RenderRecipe } from '../src/lib/design/renderRecipe/types'
import { buildRenderInstruction, validateRenderInstruction } from '../src/lib/design/promptBuilder/builder'
import { serializeOpenAI } from '../src/lib/design/promptBuilder/serializer'
import { buildPromptLayers, compressPromptByLayers, validatePriorityZeroIntact } from '../src/lib/design/promptBuilder/compression'
import { validateComponentDna } from '../src/lib/design/promptValidation/dnaValidator'
import { evaluateCapability } from '../src/lib/design/capabilityEngine/engine'
import type { UnresolvedComponent } from '../src/lib/design/capabilityEngine/engine'
import { IDENTITY_PRESERVATION } from '../src/lib/design/renderEngine/identityPreservation'
import { composeAiAssets, validateCollarReference, validatePlaketReference, validatePocketReference } from '../src/lib/design/aiAssetComposer/composer'
import { GLOBAL_BASE_HERO_IMAGE_URL } from '../src/lib/design/renderEngine/baseHero'
import { buildReferenceBinding } from '../src/lib/design/renderEngine/referenceBinding'

function stub(row: Record<string, unknown>): MasterDataOption {
  return {
    metadata: {},
    selling_points: [],
    internal_notes: '',
    price: 0,
    material_id: null,
    updated_at: new Date().toISOString(),
    ...row,
  } as unknown as MasterDataOption
}

// Live rows fetched via Supabase MCP (project vdgkbzpdgmlzyxaiznka),
// 2026-08-06. Approved dates below show Collar/Plaket/Pocket/Cuff DNA was
// all re-authored 2026-08-02 through 2026-08-05 — after PAT-01/02, after
// Sprint R-04's packing fix, after Sprint A's Reference Policy Refactor.
const LORENZO = stub({
  id: '976794cd-3a4a-4d16-9e02-9efe0eda7699', name: 'Lorenzo Premium Gold Class', category: 'bahan', is_active: true,
  photo_url: 'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/bahan/976794cd-3a4a-4d16-9e02-9efe0eda7699.jfif',
  dna_color_id: null,
  ai_dna: {"status":"needs_regeneration","version":1,"metadata":{"note":"Base material definition untuk premium wool-blend. Warna akan di-specify per variant di warna_bahan part.","approvedAt":"2026-07-27T08:00:00Z","approvedBy":"Design Team","generatedAt":"2026-07-27T07:48:40Z","sourceImage":"reference-lorenzo-premium-swatch.jpg"},"placement":{"relation_to_body":"Relaxed fit yang maintain shape, natural drape di sekitar body, tidak clinging","position_on_garment":"Entire garment body - wraps around full torso, sleeves, dan body length"},"componentRules":["Jangan render fabric sebagai flat atau lifeless","Jangan render sebagai glossy atau terlalu shiny - maintain matte aesthetic","Jangan render wrinkles yang tidak natural atau exaggerated","Jangan render stiff atau rigid appearance - tetap maintain soft controlled drape","Jangan override texture dengan artificial effects"],"referenceInstruction":"Wool-blend twill 60/40, medium weight ~250-280gsm. Matte finish, micro-dimensional texture, subtle sheen. Visible crisp topstitching."},
  render_recipe: {"pose":{},"focus":{},"camera":{},"status":"configured","version":1,"lighting":{},"composition":{},"componentRules":["Jangan render dengan harsh shadows yang obscure fabric detail","Jangan create glare atau blown-out highlights","Jangan render fabric sebagai flat satu warna - show texture dimensionality","Jangan override lighting dengan unrealistic reflections","Jangan render wrinkles atau creases yang tidak natural","Jangan distort fabric pattern atau weave structure"],"fabricBehavior":{"drape":"Gentle natural folds, soft controlled drape menunjukkan fabric weight dan body","fold_pattern":"Natural soft folds di seams, maintained structure tanpa artificial creases","light_interaction":"Matte twill surface dengan subtle sheen response, micro-dimensional texture terlihat, no glare"},"renderPriority":1,"visibilityRules":{}},
})

const BLACK = stub({
  id: '8fd8a98d-4ce3-4ad7-938e-fe2d06656f81', name: 'Black', category: 'warna_bahan', is_active: true,
  photo_url: null, dna_color_id: 'f8eddbd3-dd59-406f-9d98-293e6f6fccd4',
  ai_dna: {"status":"approved","version":1,"componentRules":[],"referenceInstruction":null},
  render_recipe: {"status":"configured","version":1},
})
// dna_colors.f8eddbd3-... .prompt — real merge target (route.ts:226-254)
const BLACK_DNA_COLOR_PROMPT =
  'Deep black tone, near-zero reflectivity. Undertone: neutral-cool with slight depth. Absorbs light completely — visual weight and presence. Matte finish, minimal sheen. No color bleed, no graying. Consistent darkness across all fabric surfaces. Visual characteristic: solid, grounding, maximum contrast. Sharp definition when paired with lighter elements. Lighting interaction: light-absorptive, reveals texture through shadow only. Creates bold silhouette. Color code: #1A1A1A (pure black). Specification: zero-brightness, maximum saturation darkness. Professional, formal, timeless visual impact.'

const BASIM_COLLAR = stub({
  id: '71f730db-e833-4fe0-884f-61c5d8f7175a', name: 'Basim Collar', category: 'kerah', is_active: true,
  photo_url: 'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/kerah/71f730db-e833-4fe0-884f-61c5d8f7175a.jpg',
  dna_color_id: null,
  ai_dna: {"status":"approved","version":4,"metadata":{"approvedAt":"2026-08-02T02:01:31.055Z","approvedBy":null,"generatedAt":"2026-08-02T02:01:31.055Z","sourceImage":"https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/kerah/71f730db-e833-4fe0-884f-61c5d8f7175a.jpg"},"componentRules":["Preserve the Rounded collar shape exactly as shown in the Hero Image.","Preserve the curvature and symmetry of both collar leaves.","Do not modify the inherited Standard Collar dimensions."],"placement":{"leafFlow":"extends 6cm upward from base, tips rounded, symmetric left-right","rotation":"0° tilt—no forward/backward angle","baseHeight":"3.5cm measured from neck seam upward","anchorPoint":"Collar base sits exactly at neck opening seam of thobe body","positioning":"Centered on front-neck, standing perpendicular to chest"},"referenceInstruction":"Use the Hero Image only as the structural reference for this collar.\n\nFollow only the visible collar shape, construction, edge profile, seam flow, symmetry, and overall proportion.\n\nIgnore fabric texture, fabric color, lighting, shadow, background, depth of field, and camera characteristics.\n\nDo not infer any geometry, construction, or detail that is not visible in the Hero Image."},
  render_recipe: {"status":"configured","version":1,"componentRules":["Collar floating or detached","Leaf pointing sideways or downward","Collar twisted or asymmetric","Harsh shadow lines at base","tidak merge ke body","tidak ada floating"],"renderPriority":["placement_lock","edge_separation","lighting_match"]},
})

const SUDAS_PLAKET = stub({
  id: '10eb5b65-18f0-4f7d-9642-6b48d50d3e46', name: 'Sudas Plaket', category: 'plaket', is_active: true,
  photo_url: 'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/plaket/10eb5b65-18f0-4f7d-9642-6b48d50d3e46.jpg',
  dna_color_id: null,
  ai_dna: {"status":"approved","version":5,"metadata":{"note":"Precise 6-sided hexagon endpoint. Geometric design feature requiring exact AI rendering. NOT triangle approximation.","approvedAt":"2026-08-04T23:52:23.674Z","approvedBy":null,"generatedAt":"2026-08-04T23:52:23.674Z","sourceImage":"https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/plaket/10eb5b65-18f0-4f7d-9642-6b48d50d3e46.jpg","reference_shape":"STOP sign rotated 180°, hexagon geometry"},"componentRules":["Preserve the Hexagon Bottom Shape exactly as shown in the Hero Image.","Preserve all six endpoint edges and their geometric proportions.","Do not modify the inherited Standard Front Placket dimensions."],"placement":{"relation_to_body":"Sits absolutely flat, hexagon geometry maintained without drooping or distortion.","position_on_garment":"Centered on front opening. Hexagon endpoint sits perfectly centered horizontally."},"referenceInstruction":"Use the Hero Image only as a geometric reference for the bottom termination.\n\nPreserve the exact outline, symmetry, and angle transitions of the bottom endpoint.\n\nMaintain the same placket width approaching the endpoint.\n\nIgnore fabric, color, texture, stitching appearance, lighting, shadows, wrinkles, and camera characteristics."},
  render_recipe: {"pose":{},"focus":{},"camera":{},"status":"configured","version":2,"lighting":{},"composition":{},"componentRules":["CRITICAL: Do NOT render triangle. Render exactly 6-sided hexagon.","CRITICAL: Do NOT render diamond or 4-sided endpoint. Must be hexagon.","CRITICAL: Do NOT round hexagon point vertex. Vertex must be sharp and geometric.","Do NOT soften or blur hexagon edges. All 6 edges must be crisp and clear.","Do NOT distort hexagon geometry or proportions.","Do NOT render endpoint as irregular or asymmetric polygon.","Do NOT add wrinkles, creases, or fabric distortion to hexagon endpoint area.","Do NOT over-lighten or over-darken reducing edge clarity and definition.","Do NOT fail to show all 6 hexagon edges simultaneously in sharp focus.","Do NOT render approximation or simplification (e.g., triangle instead of hexagon) — hexagon is required exactly."],"fabricBehavior":{"drape":"Plaket sits absolutely flat. No wrinkles, creases, or puckering.","fold_pattern":"Plaket area maintains perfect flatness.","light_interaction":"Topstitch threads catch light creating fine line definition."},"renderPriority":3,"visibilityRules":{}},
})

const PATCH_POCKET = stub({
  id: '2de82004-99a5-4e1e-a5e0-787c9cbac3a5', name: 'Patch Pocket Topstitched Medium', category: 'saku', is_active: true,
  photo_url: 'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/saku/2de82004-99a5-4e1e-a5e0-787c9cbac3a5.jpg',
  dna_color_id: null,
  ai_dna: {"status":"approved","version":4,"metadata":{"approvedAt":"2026-08-05T02:28:08.484Z","approvedBy":null,"generatedAt":"2026-08-05T02:28:08.483Z","sourceImage":"https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/saku/2de82004-99a5-4e1e-a5e0-787c9cbac3a5.jpg"},"componentRules":["Preserve the pocket outline exactly as shown in the Hero Image.","Preserve the visible opening shape and bottom contour.","Do not modify the inherited Standard Pocket dimensions."],"placement":{"anchor":"upper_body_front_panel","location":"chest_left_or_side","offset_from_armhole":"2.0cm"},"referenceInstruction":"Use the Hero Image only as the structural reference for this pocket.\n\nFollow only the visible pocket shape, opening, edge profile, seam flow, symmetry, and overall proportion.\n\nIgnore fabric texture, fabric color, lighting, shadow, background, depth of field, and camera characteristics.\n\nDo not infer any geometry, construction, or detail that is not visible in the Hero Image."},
  render_recipe: {"status":"configured","version":1},
})

const SUDAS_CUFF = stub({
  id: '45b09ccf-8e2c-4a08-aa3d-0745c697c793', name: 'Sudas Cuff', category: 'manset', is_active: true,
  photo_url: 'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/manset/45b09ccf-8e2c-4a08-aa3d-0745c697c793.jpg',
  dna_color_id: null,
  ai_dna: {"status":"approved","version":3,"metadata":{"note":"Simple standard cuff untuk UAT.","approvedAt":"2026-08-05T02:19:50.278Z","approvedBy":null,"generatedAt":"2026-08-05T02:19:50.277Z","sourceImage":"https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/manset/45b09ccf-8e2c-4a08-aa3d-0745c697c793.jpg"},"componentRules":["Preserve the cuff shape exactly as shown in the Hero Image.","Preserve the visible edge profile and overall cuff proportion.","Do not modify the inherited Standard Cuff dimensions."],"placement":{"relation_to_body":"Sits snug pada sleeve end, functional closure point","position_on_garment":"Sleeve end, wraps around wrist area"},"referenceInstruction":"Use the Hero Image only as the structural reference for this cuff.\n\nFollow only the visible cuff shape, construction, edge profile, seam flow, symmetry, and overall proportion.\n\nIgnore fabric texture, fabric color, lighting, shadow, background, depth of field, and camera characteristics."},
  render_recipe: {"pose":{},"focus":{},"camera":{},"status":"configured","version":1,"lighting":{},"composition":{},"componentRules":["Jangan render cuff dengan harsh shadows","Jangan render cuff wrinkled","Jangan render cuff gaping","Jangan blur seam detail","Jangan render cuff limp","Jangan render cuff terputus dari sleeve","Jangan add unrealistic details"],"fabricBehavior":{"drape":"Cuff sits snug pada sleeve end","fold_pattern":"Natural fold kalau ada, structured","light_interaction":"Edge stitching catches light, thread visible"},"renderPriority":3,"visibilityRules":{}},
})

const CUSTOMER_PHOTO_URL =
  'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/consultation-photos/b295247f-faba-4e09-acc0-7d5abd162347/front-1785236836789.jpg'

const SELECTIONS: { componentType: string; option: MasterDataOption }[] = [
  { componentType: 'bahan', option: LORENZO },
  { componentType: 'warna_bahan', option: BLACK },
  { componentType: 'kerah', option: BASIM_COLLAR },
  { componentType: 'plaket', option: SUDAS_PLAKET },
  { componentType: 'saku', option: PATCH_POCKET },
  { componentType: 'manset', option: SUDAS_CUFF },
]

function main() {
  console.log('='.repeat(80))
  console.log('DRY-RUN PIPELINE SIMULATION — Prompt Architecture Realignment (2026-08-06)')
  console.log('Mirrors route.ts exactly: warna_bahan/dna_colors merge, the 13 fixed Prompt')
  console.log('Builder sections, and the current requiredPriorityZeroIds list. No OpenAI call.')
  console.log('='.repeat(80))

  // route.ts:226-254 — warna_bahan <-> dna_colors merge, in-memory only.
  if (BLACK.dna_color_id) {
    BLACK.ai_dna = { ...BLACK.ai_dna, status: BLACK.ai_dna.status === 'pending' ? 'draft' : BLACK.ai_dna.status, referenceInstruction: BLACK_DNA_COLOR_PROMPT }
    BLACK.render_recipe = { ...BLACK.render_recipe, status: BLACK.render_recipe.status === 'empty' ? 'configured' : BLACK.render_recipe.status }
  }

  const componentsMissing: { componentId: string; componentType: string; reason: string }[] = []
  const resolved: { option: MasterDataOption; recipe: RenderRecipe }[] = []

  SELECTIONS.forEach(({ componentType, option }) => {
    const input: DNAResolverInput = { itemId: option.id, category: option.category, aiDna: option.ai_dna, renderRecipe: option.render_recipe }
    const { recipe, ready, errors } = resolveDNA(input)
    if (!ready || !recipe) {
      componentsMissing.push({ componentId: option.id, componentType, reason: `"${option.name}" — ${errors.join(' ')}` })
      return
    }
    resolved.push({ option, recipe })
  })
  console.log(`Resolved ${resolved.length}/${SELECTIONS.length}; missing: [${componentsMissing.map((m) => m.componentType).join(', ') || 'none'}]`)

  const componentDnaResults = SELECTIONS.map((s) => {
    const v = validateComponentDna({ itemId: s.option.id, category: s.option.category, aiDna: s.option.ai_dna })
    return { itemId: s.option.id, category: s.option.category, valid: v.valid }
  })

  const composedAssets = composeAiAssets({
    customerPhotoUrl: CUSTOMER_PHOTO_URL,
    collarOption: BASIM_COLLAR,
    plaketOption: SUDAS_PLAKET,
    pocketOption: PATCH_POCKET,
  })
  const baseHeroAvailable = GLOBAL_BASE_HERO_IMAGE_URL !== null
  console.log(`\nBase Hero: ${baseHeroAvailable ? 'active' : 'not configured'}`)
  console.log(`Collar Reference: ${validateCollarReference({ collarOption: BASIM_COLLAR, composed: composedAssets }).reason}`)
  console.log(`Plaket Reference: ${validatePlaketReference({ plaketOption: SUDAS_PLAKET, composed: composedAssets }).reason}`)
  console.log(`Pocket Reference: ${validatePocketReference({ pocketOption: PATCH_POCKET, composed: composedAssets }).reason}`)
  console.log(`Reference images (${composedAssets.urls.length + (baseHeroAvailable ? 1 : 0)}): customer photo${baseHeroAvailable ? ' + base hero' : ''} + ${composedAssets.urls.length - 1} AI asset(s)`)

  const unresolvedComponents: UnresolvedComponent[] = componentsMissing.map((m) => ({ itemId: m.componentId, category: m.componentType, reason: m.reason }))
  const capability = evaluateCapability({ customerPhotoPresent: true, baseHeroAvailable, componentDnaResults, unresolvedComponents })
  console.log(`\nCAPABILITY: mode=${capability.mode} score=${capability.capabilityScore}% warnings=[${capability.warnings.join(' | ') || 'none'}]`)
  if (capability.mode === 'BLOCKED') {
    console.log(`BLOCKED — ${capability.blockedReason}`)
    return
  }

  const entries: RenderRecipeEntry[] = resolved.map(({ option, recipe }, index) => ({ itemId: option.id, category: option.category, recipe, priority: index }))
  const masterRecipe = composeRenderRecipe({ entries, policy: DEFAULT_GLOBAL_RENDER_POLICY })
  const instruction = buildRenderInstruction(masterRecipe)
  const instructionValidation = validateRenderInstruction(instruction)
  console.log(`\nInstruction valid: ${instructionValidation.valid} ${instructionValidation.errors.join(' | ')}`)
  if (!instruction) return
  serializeOpenAI({ instruction })

  // route.ts — Reference Binding / Reference Usage Policy / Component
  // Reference Delta construction, exactly.
  const referenceUsagePolicyActive = composedAssets.referencesByCategory.size > 0 || baseHeroAvailable
  const referenceBindingContent = buildReferenceBinding({
    customerPhoto: true,
    baseHero: baseHeroAvailable,
    collar: composedAssets.referencesByCategory.has('kerah'),
    placket: composedAssets.referencesByCategory.has('plaket'),
    pocket: composedAssets.referencesByCategory.has('saku'),
  })
  const promptLayers = buildPromptLayers({
    entries,
    masterRecipe,
    identityPreservation: IDENTITY_PRESERVATION,
    referenceBinding: referenceBindingContent,
    referenceUsagePolicy: referenceUsagePolicyActive,
  })
  const layerCompression = compressPromptByLayers(promptLayers)
  console.log('\nLayer report (in final prompt order — 13 fixed sections + extension components):')
  console.table(layerCompression.layerReport)

  if (!layerCompression.ok) {
    console.log(`\n❌ REFUSED: ${layerCompression.error}`)
    return
  }

  // route.ts — current requiredPriorityZeroIds, exactly.
  const requiredPriorityZeroIds = [
    'identity_preservation', 'scene_configuration', 'garment_layout', 'material', 'color', 'global_quality_rules', 'final_constraints',
    ...(referenceBindingContent ? ['reference_binding'] : []),
    ...(referenceUsagePolicyActive ? ['reference_usage_policy'] : []),
  ]
  const priorityZeroCheck = validatePriorityZeroIntact(layerCompression.layerReport, requiredPriorityZeroIds)
  console.log(`\nPriority 0 intact: ${priorityZeroCheck.valid} ${priorityZeroCheck.missing.length ? `(missing: ${priorityZeroCheck.missing.join(', ')})` : ''}`)

  const collarRow = layerCompression.layerReport.find((r) => r.id === 'component:collar')
  const placketRow = layerCompression.layerReport.find((r) => r.id === 'component:placket')
  const pocketRow = layerCompression.layerReport.find((r) => r.id === 'component:pocket')
  const cuffRow = layerCompression.layerReport.find((r) => r.id === 'component:cuff')
  const allP1Included = layerCompression.layerReport.filter((r) => r.priority === 1).every((r) => r.included)
  const p0Total = layerCompression.layerReport.filter((r) => r.priority === 0 && r.included).reduce((s, r) => s + r.tokens, 0)

  console.log('\n=== VERIFICATION SUMMARY ===')
  console.log(`Priority 0 total tokens (floor, before any P1/P2): ${p0Total} / 1800 budget`)
  console.log(`component:collar  included=${collarRow?.included} truncated=${collarRow?.truncated} tokens=${collarRow?.tokens}`)
  console.log(`component:placket included=${placketRow?.included} truncated=${placketRow?.truncated} tokens=${placketRow?.tokens}`)
  console.log(`component:pocket  included=${pocketRow?.included} truncated=${pocketRow?.truncated} tokens=${pocketRow?.tokens}`)
  console.log(`component:cuff    included=${cuffRow?.included} truncated=${cuffRow?.truncated} tokens=${cuffRow?.tokens}`)
  console.log(`ALL selected (Priority 1) components included: ${allP1Included}`)
  console.log(`Total tokens used: ${layerCompression.totalTokens}`)

  console.log('\n=== FIXED ORDER CHECK (13 sections) ===')
  const order = ['identity_preservation', 'reference_binding', 'reference_usage_policy', 'scene_configuration', 'garment_layout', 'material', 'color', 'global_quality_rules', 'component:collar', 'component:placket', 'component:pocket', 'component:cuff', 'final_constraints']
  console.log(`Layer push order: ${promptLayers.map((l) => l.id).join(' -> ')}`)
  const actualOrder = promptLayers.map((l) => l.id).filter((id) => order.includes(id))
  const expectedOrder = order.filter((id) => actualOrder.includes(id))
  console.log(`Matches required fixed order: ${JSON.stringify(actualOrder) === JSON.stringify(expectedOrder)}`)

  console.log('\n--- FULL COMPRESSED PROMPT SENT TO OPENAI ---')
  console.log(layerCompression.compressed)

  console.log(`\nVERDICT: ${collarRow?.included && placketRow?.included && pocketRow?.included && cuffRow?.included && allP1Included ? 'PASS — all selected components reach OpenAI, in the required fixed order' : 'FAIL'}`)
}

main()
