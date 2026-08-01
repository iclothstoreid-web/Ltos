// Sprint R-04 — Reference-First Completion, dry-run validation.
//
// Zero OpenAI calls, zero Supabase/DB access, zero production render — this
// script only imports the REAL pipeline functions
// (buildPromptLayers/compressPromptByLayers from
// src/lib/design/promptBuilder/compression.ts, plus the real AI Asset
// Instruction constants from aiAssetComposer/composer.ts) and runs them
// twice against one fixture representing the same component mix as the
// real Saudi Modern render audited in Sprint R-03
// (scripts/final-render-test-result.json): Model Thobe + Material + Material
// Color + Kerah + Manset + Plaket + Saku.
//
// Fixture provenance (so nobody mistakes this for a data dump): Model
// Thobe, Material (Bahan), Material Color, and Kerah garment text below is
// copied VERBATIM from the real captured prompt in
// scripts/final-render-test-result.json (their category boundaries were
// unambiguous to re-derive from that render's finalPrompt string during the
// R-03 audit). Manset/Plaket/Saku/Visual Description content is
// REPRESENTATIVE fixture text sized to the same rough magnitude R-03
// measured (229/697/52/740 tokens) — their exact real boundaries in that
// one concatenated string were NOT unambiguous to re-derive, so no
// verbatim text is claimed for them. This script validates the ALGORITHM
// change (Reference-First completion, Negative Rules as a constraint,
// importance-ordered packing, Asset Instructions inside the budget) — it
// is not a byte-for-byte replay of the R-03 audit's numbers.
//
// Usage: npx tsx scripts/r04-dry-run.ts

import {
  buildPromptLayers,
  compressPromptByLayers,
  validatePriorityZeroIntact,
  type AssetInstructionLayer,
} from '../src/lib/design/promptBuilder/compression'
import type { RenderRecipeEntry, MasterRenderRecipe } from '../src/lib/design/recipeComposer/types'
import { DEFAULT_GLOBAL_RENDER_POLICY } from '../src/lib/design/recipeComposer/types'
import type { RenderRecipe } from '../src/lib/design/renderRecipe/types'
import { DEFAULT_RENDER_RECIPE } from '../src/lib/design/renderRecipe/types'
import type { MasterDataCategory } from '../src/lib/design/masterData'
import { LAYER1_IDENTITY_TEMPLATE } from '../src/lib/design/promptArchitectureV2/layers'
import {
  MODEL_REFERENCE_SILHOUETTE_INSTRUCTION,
  COLLAR_REFERENCE_SHAPE_INSTRUCTION,
  PLAKET_REFERENCE_SHAPE_INSTRUCTION,
  POCKET_REFERENCE_SHAPE_INSTRUCTION,
} from '../src/lib/design/aiAssetComposer/composer'

function recipe(partial: Partial<RenderRecipe>): RenderRecipe {
  return { ...DEFAULT_RENDER_RECIPE, status: 'configured', ...partial }
}

// ---------------------------------------------------------------------
// Model Thobe — verbatim from scripts/final-render-test-result.json
// ---------------------------------------------------------------------
const modelThobeGarment = {
  appearance: {
    back_balance: 'Centered and symmetrical.',
    complexity: 'Minimal.',
    design_language: 'Premium modern Islamic menswear.',
    front_balance: 'Centered and symmetrical.',
    movement: 'Natural vertical fabric fall.',
    overall_shape: 'Minimal, clean, elegant and timeless.',
    proportion: 'Balanced vertical proportion emphasizing long continuous garment.',
    silhouette: 'Straight modern Saudi silhouette.',
    surface_character: 'Minimal visual interruption.',
    visual_focus: 'Body silhouette and clean drape.',
  },
  construction: {
    body_structure: 'Single-piece full length thobe body with clean uninterrupted front and back panels.',
    body_volume: 'Moderate body volume intended to follow Look Cutting DNA.',
    front_surface: 'Clean uninterrupted front body reserved for modular DNA components.',
    hem_structure: 'Straight full-length hem with balanced front and back length.',
    main_panel: 'Straight continuous body panel from shoulder to hem without segmented construction.',
    shoulder_structure: 'Natural shoulder without padding or exaggerated shape.',
    side_structure: 'Straight vertical side seams following natural body line.',
    sleeve_base: 'Standard set-in sleeve construction connected naturally to shoulder.',
  },
  geometry: {
    collar: 'Not defined by Model Thobe — reserved for selected Collar DNA',
    construction: 'Single-piece full length body panel, straight side seams, natural shoulder, moderate body volume',
    fit: 'Standard fit, natural drape',
    length: '138cm, ankle-length, straight full-length hem',
    length_cm: 138,
    silhouette: 'Ankle-length, straight modern cut',
    sleeve: 'Standard set-in sleeve base construction connected naturally to shoulder',
  },
  materials: {
    note:
      'Recommended base fabric per Owner: 60/40 wool blend. Cross-referenced in bahan.Lorenzo Premium Gold Class (geometry.height already cites "138cm untuk Saudi Modern"). Actual fabric for a given order is still selected independently via the bahan category at order time.',
  },
  placement: {
    body_balance: 'Balanced left and right proportions.',
    center_axis: 'Strong centered front alignment.',
    garment_focus: 'Entire body acts as base canvas for modular DNA.',
    reserved_component_area: { accessory: true, collar: true, cuff: true, embroidery: true, placket: true, pocket: true },
    symmetry: 'Perfect bilateral symmetry.',
    vertical_flow: 'Continuous uninterrupted vertical line.',
  },
  stitching: {
    construction_stitch: 'Standard lockstitch.',
    hem_finish: 'Clean folded hem.',
    main_seam: 'Clean straight seam.',
    overall_finish: 'Premium clean tailoring.',
    side_seam: 'Continuous side seam.',
    thread_visibility: 'Hidden where possible.',
    top_stitch_visibility: 'Minimal.',
  },
}

// ---------------------------------------------------------------------
// Material (Bahan) — verbatim from scripts/final-render-test-result.json
// ---------------------------------------------------------------------
const materialGarment = {
  appearance: {
    construction_visible: 'Jahitan jelas terlihat di surface (premium aesthetic), seam lines crisp dan clean, topstitching precise',
    surface_treatment: 'Matte finish dengan micro-dimensional texture, smooth dan refined, tidak flat, subtle sheen response terhadap cahaya',
    visual_character: 'Premium wool-blend formal wear, elegant dan sophisticated, matte finish dengan subtle sheen',
  },
  construction: {
    facing_type: 'Tidak ada facing khusus untuk base material',
    interlining: 'Minimal - hanya untuk struktur supporting areas jika diperlukan',
    pattern_type: 'Continuous fabric roll, no piecing',
    seam_placement: 'Standard body seams (shoulder, side, center front)',
  },
  geometry: {
    angle: 'Twill diagonal yang halus, teksiur seragam di seluruh permukaan',
    height: 'Panjang custom sesuai dengan model thobe (138cm untuk Saudi Modern)',
    proportions: 'Medium-weight yang memberikan body cukup untuk maintain shape sepanjang penggunaan, tidak limp namun tidak overly rigid',
    silhouette: 'Wool-blend twill dengan struktur medium-weight, drape terkontrol namun lembut',
  },
  materials: {
    facing: 'Sama dengan primary material (jika ada facing, akan di-apply dari component part)',
    interlining: 'Lightweight interfacing untuk supporting seams saja',
    primary: 'Wool-blend twill 60 wool / 40 synthetic, medium weight ~250-280 gsm',
  },
  placement: {
    position_on_garment: 'Entire garment body - wraps around full torso, sleeves, dan body length',
    relation_to_body: 'Relaxed fit yang maintain shape, natural drape di sekitar body, tidak clinging',
  },
  stitching: {
    stitch_type: 'Machine-sewn throughout, clean seam finish dengan double-lock stitch',
    thread_color_rule: 'Thread color sesuai dengan warna pilihan customer (dari warna_bahan part)',
    visible_seam_treatment: 'Jahitan visible dan prominent di surface (premium construction detail)',
  },
}
const materialFabricBehavior = {
  drape: 'Gentle natural folds, soft controlled drape menunjukkan fabric weight dan body',
  fold_pattern: 'Natural soft folds di seams, maintained structure tanpa artificial creases',
  light_interaction: 'Matte twill surface dengan subtle sheen response, micro-dimensional texture terlihat, no glare',
}

// ---------------------------------------------------------------------
// Material Color — verbatim from scripts/final-render-test-result.json
// `color` (not `appearance`) is the resolver's Color Identity carve-out key
// — it is NOT in referenceResolver.ts's NARRATIVE_GARMENT_KEYS, so Reference-First
// pruning never touches it regardless of reference-backed status.
// ---------------------------------------------------------------------
const materialColorGarment = {
  color:
    'Deep black tone, near-zero reflectivity. Undertone: neutral-cool with slight depth. Absorbs light completely — visual weight and presence. Matte finish, minimal sheen. No color bleed, no graying. Consistent darkness across all fabric surfaces. Visual characteristic: solid, grounding, maximum contrast. Sharp definition when paired with lighter elements. Lighting interaction: light-absorptive, reveals texture through shadow only. Creates bold silhouette. Color code: #1A1A1A (pure black). Specification: zero-brightness, maximum saturation darkness. Professional, formal, timeless visual impact.',
}

// ---------------------------------------------------------------------
// Kerah (Collar) — verbatim from scripts/final-render-test-result.json
// ---------------------------------------------------------------------
const kerahGarment = {
  appearance: 'Modern formal: clean geometry, minimal detail, smooth surface, no texture manipulation',
  construction: {
    anchorPoint: 'rigid, anchored at neck seam',
    centerBackSeam: 'single vertical line',
    foldLine: 'clean 180° fold from base to leaf edge',
    layers: '2-ply: outer face fabric + inner interfaced backing',
    leafEdge: 'rounded finish, no raw seam visible (bound or turned)',
  },
  geometry: {
    collarLeafHeight: '6cm',
    collarSpread: 'Full width neck opening, balanced left-right',
    leafShape: 'Symmetrical rounded point (tidak sharp, smooth curve dari mid-leaf ke tip)',
    standingBaseHeight: '3.5cm',
  },
  materials: {
    base: 'White or light neutral base',
    drape: 'Stable drape, holds shape without stiffness',
    type: 'Lightweight cotton or cotton-poly blend',
  },
  placement: {
    anchorPoint: 'Collar base sits exactly at neck opening seam of thobe body',
    baseHeight: '3.5cm measured from neck seam upward',
    leafFlow: 'extends 6cm upward from base, tips rounded, symmetric left-right',
    positioning: 'Centered on front-neck, standing perpendicular to chest',
    rotation: '0° tilt — no forward/backward angle',
  },
}

// ---------------------------------------------------------------------
// Manset / Plaket / Saku — REPRESENTATIVE fixture (not verbatim; see
// header). Sized to the same rough magnitude R-03 measured: Manset ~230,
// Plaket ~700 (deliberately the largest — this is the exact case the
// packLayers fix targets), Saku ~50.
// ---------------------------------------------------------------------
const mansetGarment = {
  appearance: {
    construction_visible: 'Edge stitching visible, seam lines subtle, fold lines natural',
    surface_treatment: 'Flat crisp finish, pressed appearance, smooth surface',
    visual_character: 'Simple formal cuff, clean aesthetic, minimal detail, functional closure',
  },
  construction: {
    facing_type: 'Single layer facing pada inner cuff',
    interlining: 'Lightweight interfacing untuk maintain crisp edge',
    pattern_type: 'Standard two-piece cuff pattern, straight edge, no curve',
    closure: 'Single button closure, horizontal buttonhole, reinforced stitch',
  },
  geometry: {
    width_cm: 6,
    shape: 'rectangle, straight edge, rounded corners',
    fold: 'Single fold, no double-back',
  },
  materials: {
    primary: 'Matches primary body fabric, same weight and finish',
  },
  placement: {
    anchor: 'sleeve_end',
    positioning: 'Wraps wrist, sits at natural wrist bone',
  },
}
const plaketGarment = {
  appearance: {
    construction_visible:
      'Double parallel horizontal topstitching frames top edge and bottom near-endpoint. Vertical centerline topstitch runs full length emphasizing symmetry. Four angled topstitches frame the hexagon sides creating geometric emphasis. All lines sharp, crisp, clearly defined.',
    surface_treatment:
      'Ultra-crisp structured finish. Hexagon endpoint has blade-sharp edges, not softened or rounded. Surface reads as deliberately architectural rather than soft tailoring.',
    visual_character:
      'Bold geometric plaket, strong graphic presence on the chest, reads clearly from a distance, signature design element of this look.',
  },
  construction: {
    grain_direction: 'vertical_aligned',
    layers: 'single_layer_tacked_at_base',
    tack_points: 'top_corners_and_base_center',
    tack_thread: 'matching_to_fabric',
    interlining: 'medium-weight fusible, full plaket area, prevents rippling under topstitch tension',
    edge_finish: 'folded and pressed, no raw edge exposed anywhere along the hexagon perimeter',
  },
  geometry: {
    aspect_ratio: 'vertical_emphasis_0.81',
    corner_radius_mm: 3,
    height_cm: 10.5,
    seam_allowance: '0.7cm_included',
    shape: 'hexagon_elongated_vertical',
    width_cm: 8.5,
    endpoint_angle_deg: 45,
  },
  materials: {
    primary: 'Matches primary body fabric',
    thread: 'Matching or subtle tonal contrast, high-sheen topstitch thread for line definition',
  },
  placement: {
    anchor: 'upper_body_front_panel',
    location: 'center_front_chest',
    offset_from_collar_cm: 4,
  },
  stitching: {
    line_quality: 'even_tension_no_skips',
    method: 'topstitch',
    stitch_distance_mm: 2.5,
    stitch_pattern: 'straight_parallel_to_edge',
    thread_type: 'matching_or_subtle_contrast',
  },
}
const sakuGarment = {
  geometry: { height_cm: 10.5, width_cm: 8.5, shape: 'rectangle_rounded_corners' },
  placement: { anchor: 'upper_body_front_panel', location: 'chest_left_or_side', offset_from_armhole_cm: 2.0 },
}

function entry(category: MasterDataCategory, garment: Record<string, unknown>, priority: number, fabricBehavior: Record<string, unknown> = {}): RenderRecipeEntry {
  return {
    itemId: `fixture-${category}`,
    category,
    priority,
    recipe: recipe({ garment, fabricBehavior }),
  }
}

const entries: RenderRecipeEntry[] = [
  entry('model_thobe', modelThobeGarment, 0),
  entry('bahan', materialGarment, 1, materialFabricBehavior),
  entry('warna_bahan', materialColorGarment, 2),
  entry('kerah', kerahGarment, 3),
  entry('manset', mansetGarment, 4),
  entry('plaket', plaketGarment, 5),
  entry('saku', sakuGarment, 6),
]

// Visual Description fixture — representative pose/camera/lighting/
// composition/background/quality content (per-item render_recipe overrides
// merged across the 5 selected components would realistically produce
// content this size — see R-03's audit finding that this was the single
// largest raw layer in the real render, at 740 tokens including
// negativeRules, which Sprint R-04 now extracts into its own layer).
const masterRecipe: MasterRenderRecipe = {
  camera: { ...DEFAULT_GLOBAL_RENDER_POLICY.camera },
  pose: {
    stance: 'Natural standing pose, weight evenly distributed, arms relaxed at sides',
    head: 'Facing camera, neutral relaxed expression, chin level',
  },
  lighting: {
    key: 'Soft diffused studio key light from front-left, minimal harsh shadow',
    fill: 'Gentle fill from front-right to preserve garment texture without flattening it',
  },
  composition: {
    focus_area: 'Entire garment silhouette, chest plaket, collar, and cuffs all in sharp focus',
    negative_space: 'Balanced margin around subject, no tight crop on any edge',
  },
  focus: {},
  fabricBehavior: {},
  visibilityRules: {
    feet: 'Fully visible, no crop at ankle or hem',
    hands: 'Visible at sides, not obscuring garment details',
  },
  garment: {},
  fabricIdentity: {},
  stitching: {},
  embroidery: {},
  background: { setting: 'Neutral seamless studio backdrop, soft gradient, no distracting elements' },
  quality: { ...DEFAULT_GLOBAL_RENDER_POLICY.quality, rendering: 'Photorealistic, natural fabric behavior, no plastic/CGI look' },
  style: {},
  negativeRules: [...DEFAULT_GLOBAL_RENDER_POLICY.negativeRules],
  lockRules: [],
  sources: entries.map((e) => ({ itemId: e.itemId, category: e.category, priority: e.priority })),
  composedAt: new Date().toISOString(),
}

const ALL_ASSET_INSTRUCTIONS: Record<'model' | 'collar' | 'plaket' | 'pocket', AssetInstructionLayer> = {
  model: { id: 'asset_instruction:model', label: 'Model Reference Instruction', content: MODEL_REFERENCE_SILHOUETTE_INSTRUCTION },
  collar: { id: 'asset_instruction:collar', label: 'Collar Reference Instruction', content: COLLAR_REFERENCE_SHAPE_INSTRUCTION },
  plaket: { id: 'asset_instruction:plaket', label: 'Plaket Reference Instruction', content: PLAKET_REFERENCE_SHAPE_INSTRUCTION },
  pocket: { id: 'asset_instruction:pocket', label: 'Pocket Reference Instruction', content: POCKET_REFERENCE_SHAPE_INSTRUCTION },
}

function runScenario(label: string, referenceBackedCategories: Set<MasterDataCategory>, assetInstructions: AssetInstructionLayer[]) {
  // Reference-First Cleanup — buildPromptLayers no longer prunes garment
  // text by reference-backed status (there's no narrative text left to
  // prune); `referenceBackedCategories` is kept as a parameter here only
  // for this script's own scenario labeling/logging below.
  const layers = buildPromptLayers({
    entries,
    masterRecipe,
    identityTemplate: LAYER1_IDENTITY_TEMPLATE,
    assetInstructions,
  })
  const result = compressPromptByLayers(layers, 1200)

  const lookCuttingSelected = entries.some((e) => e.category === 'look_cutting')
  const requiredPriorityZeroIds = [
    'identity',
    'negative_rules',
    'model_thobe',
    'material',
    'material_color',
    ...(lookCuttingSelected ? ['look_cutting'] : []),
    ...assetInstructions.map((a) => a.id),
  ]
  const p0Check = validatePriorityZeroIntact(result.layerReport, requiredPriorityZeroIds)

  console.log(`\n${'='.repeat(80)}\n${label}\n${'='.repeat(80)}`)
  console.log(`Reference-backed categories: [${Array.from(referenceBackedCategories).join(', ') || 'none'}]`)
  console.log(`Active asset instructions:   [${assetInstructions.map((a) => a.label).join(', ') || 'none'}]`)
  console.log(`Render allowed (Priority 0 fit): ${result.ok ? 'YES' : `NO — ${result.error}`}`)
  if (!result.ok) return result

  console.log(`Priority 0 intact before OpenAI: ${p0Check.valid ? 'YES' : `NO — missing: ${p0Check.missing.join(', ')}`}`)
  console.log(`\nFinal Token: ${result.totalTokens}`)
  console.table(
    result.layerReport.map((r) => ({
      layer: r.label,
      priority: r.priority,
      rawTokens: r.tokens,
      included: r.included,
      truncated: r.truncated,
    })),
  )

  const eliminated = result.layerReport.filter((r) => !r.included && r.tokens > 0)
  console.log(`Layer dieliminasi (had content, not sent): [${eliminated.map((r) => r.label).join(', ') || 'none'}]`)

  console.log('\nFinal Prompt:')
  console.log(result.compressed)

  return result
}

// ---------------------------------------------------------------------
// Scenario A — BEFORE / fallback (Sprint R-04 requirement #5): no Hero
// Image active for any category. Must behave exactly like pre-Reference-
// First pipeline — full DNA text everywhere, no asset instructions.
// ---------------------------------------------------------------------
const before = runScenario('SCENARIO A — BEFORE (no Hero Image active, full fallback)', new Set(), [])

// ---------------------------------------------------------------------
// Scenario B — AFTER / Reference-First fully active: all 4 eligible
// categories (Model Thobe, Kerah, Plaket, Saku) have an approved, active
// Hero Image this render. Manset has no reference mechanism at all (never
// eligible — aiAssetComposer/composer.ts only ever defines 4 reference
// types) so it must stay full DNA in BOTH scenarios; that is the fallback
// guarantee, not a bug.
// ---------------------------------------------------------------------
const after = runScenario(
  'SCENARIO B — AFTER (Model Thobe + Kerah + Plaket + Saku all Hero-Image-backed)',
  new Set<MasterDataCategory>(['model_thobe', 'kerah', 'plaket', 'saku']),
  [ALL_ASSET_INSTRUCTIONS.model, ALL_ASSET_INSTRUCTIONS.collar, ALL_ASSET_INSTRUCTIONS.plaket, ALL_ASSET_INSTRUCTIONS.pocket],
)

if (before.ok && after.ok) {
  console.log(`\n${'='.repeat(80)}\nBEFORE vs AFTER\n${'='.repeat(80)}`)
  console.log(`Total token BEFORE: ${before.totalTokens}`)
  console.log(`Total token AFTER:  ${after.totalTokens}`)
  console.log(`Delta:              ${after.totalTokens - before.totalTokens}`)

  const beforeById = new Map(before.layerReport.map((r) => [r.id, r]))
  const afterById = new Map(after.layerReport.map((r) => [r.id, r]))
  const allIds = new Set([...Array.from(beforeById.keys()), ...Array.from(afterById.keys())])
  console.table(
    Array.from(allIds).map((id) => ({
      layer: beforeById.get(id)?.label ?? afterById.get(id)?.label,
      before_rawTokens: beforeById.get(id)?.tokens ?? '—',
      before_included: beforeById.get(id)?.included ?? false,
      after_rawTokens: afterById.get(id)?.tokens ?? '—',
      after_included: afterById.get(id)?.included ?? false,
    })),
  )
}
