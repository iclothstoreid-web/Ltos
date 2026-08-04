// DRY-RUN COMPRESSION VALIDATION (QA ONLY, NO OPENAI SPEND) — 2026-07-31
//
// Sprint PR-06 validation, Phase 1: re-runs Stages 1-5 of the real pipeline
// (DNA Resolver -> Capability Engine -> Recipe Composer -> Prompt Builder ->
// Layer Compression) against the exact same real design_master_options rows
// used in scripts/finalRenderTest.ts (2026-07-30 PAT-01 run), to confirm the
// packLayers() rewrite in src/lib/design/promptBuilder/compression.ts fixes
// the Plaket/Saku starvation bug BEFORE spending real OpenAI credit on a
// re-render. Stage 6 (generateImage) is intentionally never called here.
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
import { validateComponentDna } from '../src/lib/design/promptArchitectureV2/dnaValidator'
import { evaluateCapability } from '../src/lib/design/capabilityEngine/engine'
import type { UnresolvedComponent } from '../src/lib/design/capabilityEngine/engine'
import { LAYER1_IDENTITY_TEMPLATE } from '../src/lib/design/promptArchitectureV2/layers'
import { composeAiAssets, validateCollarReference } from '../src/lib/design/aiAssetComposer/composer'
import { GLOBAL_BASE_HERO_IMAGE_URL } from '../src/lib/design/renderEngine/baseHero'

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

const SAUDI_MODERN = stub({
  id: '3ea66afd-30e0-4bf6-9411-14defab8e9be',
  name: 'Saudi Modern',
  category: 'model_thobe',
  is_active: true,
  photo_url: 'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/model_thobe/3ea66afd-30e0-4bf6-9411-14defab8e9be.jpg',
  dna_color_id: null,
  ai_dna: {"status":"needs_regeneration","version":2,"geometry":{"fit":"Standard fit, natural drape","collar":"Not defined by Model Thobe — reserved for selected Collar DNA","length":"138cm, ankle-length, straight full-length hem","sleeve":"Standard set-in sleeve base construction connected naturally to shoulder","length_cm":138,"silhouette":"Ankle-length, straight modern cut","construction":"Single-piece full length body panel, straight side seams, natural shoulder, moderate body volume"},"metadata":{"approvedAt":null,"approvedBy":null,"generatedAt":"2026-07-28T14:04:50.544106+00:00","sourceImage":null},"materials":{"note":"Base fabric defined separately by the selected bahan (material) item — not by Model Thobe."},"placement":{"symmetry":"Perfect bilateral symmetry.","center_axis":"Strong centered front alignment.","body_balance":"Balanced left and right proportions.","garment_focus":"Entire body acts as base canvas for modular DNA.","vertical_flow":"Continuous uninterrupted vertical line.","reserved_component_area":{"cuff":true,"collar":true,"pocket":true,"placket":true,"accessory":true,"embroidery":true}},"stitching":{"main_seam":"Clean straight seam.","side_seam":"Continuous side seam.","hem_finish":"Clean folded hem.","overall_finish":"Clean tailoring.","thread_visibility":"Hidden where possible.","construction_stitch":"Standard lockstitch.","top_stitch_visibility":"Minimal."},"appearance":{"movement":"Natural vertical fabric fall.","complexity":"Minimal.","proportion":"Balanced vertical proportion emphasizing long continuous garment.","silhouette":"Straight modern Saudi silhouette.","back_balance":"Centered and symmetrical.","visual_focus":"Body silhouette and clean drape.","front_balance":"Centered and symmetrical.","overall_shape":"Minimal, clean.","design_language":"Modern Islamic menswear.","surface_character":"Minimal visual interruption."},"construction":{"main_panel":"Straight continuous body panel from shoulder to hem without segmented construction.","body_volume":"Moderate body volume intended to follow Look Cutting DNA.","sleeve_base":"Standard set-in sleeve construction connected naturally to shoulder.","front_surface":"Clean uninterrupted front body reserved for modular DNA components.","hem_structure":"Straight full-length hem with balanced front and back length.","body_structure":"Single-piece full length thobe body with clean uninterrupted front and back panels.","side_structure":"Straight vertical side seams following natural body line.","shoulder_structure":"Natural shoulder without padding or exaggerated shape."},"negativeRules":[]},
  render_recipe: {"pose":{},"focus":{},"camera":{},"status":"configured","version":2,"lighting":{},"composition":{},"negativeRules":[],"fabricBehavior":{},"renderPriority":[],"visibilityRules":{}},
})

const LORENZO = stub({
  id: '976794cd-3a4a-4d16-9e02-9efe0eda7699',
  name: 'Lorenzo Premium Gold Class',
  category: 'bahan',
  is_active: true,
  photo_url: 'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/bahan/976794cd-3a4a-4d16-9e02-9efe0eda7699.jfif',
  dna_color_id: null,
  ai_dna: {"status":"needs_regeneration","version":1,"geometry":{"angle":"Twill diagonal yang halus, teksiur seragam di seluruh permukaan","height":"Panjang custom sesuai dengan model thobe (138cm untuk Saudi Modern)","silhouette":"Wool-blend twill dengan struktur medium-weight, drape terkontrol namun lembut","proportions":"Medium-weight yang memberikan body cukup untuk maintain shape sepanjang penggunaan, tidak limp namun tidak overly rigid"},"metadata":{"note":"Base material definition untuk premium wool-blend. Warna akan di-specify per variant di warna_bahan part.","approvedAt":"2026-07-27T08:00:00Z","approvedBy":"Design Team","generatedAt":"2026-07-27T07:48:40Z","sourceImage":"reference-lorenzo-premium-swatch.jpg"},"materials":{"facing":"Sama dengan primary material (jika ada facing, akan di-apply dari component part)","primary":"Wool-blend twill 60 wool / 40 synthetic, medium weight ~250-280 gsm","interlining":"Lightweight interfacing untuk supporting seams saja"},"placement":{"relation_to_body":"Relaxed fit yang maintain shape, natural drape di sekitar body, tidak clinging","position_on_garment":"Entire garment body - wraps around full torso, sleeves, dan body length"},"stitching":{"stitch_type":"Machine-sewn throughout, clean seam finish dengan double-lock stitch","thread_color_rule":"Thread color sesuai dengan warna pilihan customer (dari warna_bahan part)","visible_seam_treatment":"Jahitan visible dan prominent di surface"},"appearance":{"visual_character":"Wool-blend formal wear","surface_treatment":"Matte finish dengan micro-dimensional texture, smooth, tidak flat, subtle sheen response terhadap cahaya","construction_visible":"Jahitan jelas terlihat di surface, seam lines crisp dan clean, topstitching precise"},"construction":{"facing_type":"Tidak ada facing khusus untuk base material","interlining":"Minimal - hanya untuk struktur supporting areas jika diperlukan","pattern_type":"Continuous fabric roll, no piecing","seam_placement":"Standard body seams (shoulder, side, center front)"},"negativeRules":["Jangan render fabric sebagai flat atau lifeless","Jangan render sebagai glossy atau terlalu shiny - maintain matte aesthetic","Jangan render wrinkles yang tidak natural atau exaggerated","Jangan render stiff atau rigid appearance - tetap maintain soft controlled drape","Jangan override texture dengan artificial effects"]},
  render_recipe: {"pose":{"neck_angle":"Straight, relaxed, looking slightly forward","chest_position":"Natural, symmetrical, relaxed posture","subject_orientation":"Facing camera, neutral natural stance"},"focus":{"focus_point":"Center chest area untuk show fabric behavior dan texture clarity","depth_of_field":"Medium depth, slight blur background, sharp focus pada fabric texture dan seam details"},"style":{"photorealism":"Professional tailoring product photography, realistic fabric rendering","lighting_setup":"Studio lighting, premium product aesthetic"},"camera":{"angle":"Soft directional 45° angle untuk capture twill texture detail","focus":"Fabric texture, weave pattern, dan natural drape behavior","distance":"Medium full-body shot untuk show overall drape dan fabric behavior"},"status":"configured","quality":{"crispness":"Crisp edges, clean seam rendering, sharp focus pada fabric pattern","resolution":"Ultra high definition 4K, sharp textile detail"},"version":1,"lighting":{"intensity":"Bright namun soft, tidak harsh - preserve luxury aesthetic","color_temperature":"Neutral daylight ~5500K untuk natural color accuracy","key_light_position":"Soft directional front-left 45 angle, slightly above eye level"},"background":{"color":"Warm neutral gray atau soft white","style":"Soft studio blur, clean neutral"},"composition":{"balance":"Symmetrical, even weight distribution left-right","framing":"Centered full body, balanced composition"},"negativeRules":["Jangan render dengan harsh shadows yang obscure fabric detail","Jangan create glare atau blown-out highlights","Jangan render fabric sebagai flat satu warna - show texture dimensionality","Jangan override lighting dengan unrealistic reflections","Jangan render wrinkles atau creases yang tidak natural","Jangan distort fabric pattern atau weave structure"],"fabricBehavior":{"drape":"Gentle natural folds, soft controlled drape menunjukkan fabric weight dan body","fold_pattern":"Natural soft folds di seams, maintained structure tanpa artificial creases","light_interaction":"Matte twill surface dengan subtle sheen response, micro-dimensional texture terlihat, no glare"},"renderPriority":1,"visibilityRules":{"what_is_hidden":"Interior seams hidden, backing details minimal","what_is_visible":"Entire fabric surface, full body visible, seams visible, texture detail crisp"}},
})

const BLACK = stub({
  id: '8fd8a98d-4ce3-4ad7-938e-fe2d06656f81',
  name: 'Black',
  category: 'warna_bahan',
  is_active: true,
  photo_url: null,
  dna_color_id: 'f8eddbd3-dd59-406f-9d98-293e6f6fccd4',
  ai_dna: {"tone":"Deep black","status":"approved","version":1,"undertone":"neutral-cool","brightness":"minimum","saturation":"zero","description":"Deep black tone, near-zero reflectivity, undertone neutral-cool. Absorbs light completely, matte finish with minimal sheen. No color bleed, no graying — consistent darkness across all fabric surfaces. Light-absorptive: reveals texture through shadow only, creating strong contrast and sharp definition against lighter elements. Color code #1A1A1A (pure black)."},
  render_recipe: {"status":"configured","version":1,"rendering_approach":"Render as deep black with cool undertone. Apply directional lighting to reveal fabric grain without brightening. Shadow depth: moderate, creates dimension. Fabric interaction: light-absorptive, reveals texture through reflection only. Use subtle side lighting to prevent flat appearance. Color mood: formal, grounding, elegant. Lighting model: directional + moderate shadow. Hex: #1A1A1A."},
})

const BASIM_COLLAR = stub({
  id: '71f730db-e833-4fe0-884f-61c5d8f7175a',
  name: 'Basim Collar',
  category: 'kerah',
  is_active: true,
  photo_url: 'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/kerah/71f730db-e833-4fe0-884f-61c5d8f7175a.jpg',
  dna_color_id: null,
  ai_dna: {"status":"needs_regeneration","version":2,"geometry":{"leafShape":"Symmetrical rounded point (tidak sharp, smooth curve dari mid-leaf ke tip)","collarSpread":"Full width neck opening, balanced left-right","collarLeafHeight":"6cm","standingBaseHeight":"3.5cm"},"metadata":{"approvedBy":"system","generatedAt":"2026-07-27T06:52:23.89536+00:00","sourceImage":"kerah-classic-rounded-IMG_20260723_103748.jpg"},"materials":{"base":"White or light neutral base","type":"Lightweight cotton or cotton-poly blend","drape":"Stable drape, holds shape without stiffness"},"placement":{"leafFlow":"extends 6cm upward from base, tips rounded, symmetric left-right","rotation":"0° tilt—no forward/backward angle","baseHeight":"3.5cm measured from neck seam upward","anchorPoint":"Collar base sits exactly at neck opening seam of thobe body","positioning":"Centered on front-neck, standing perpendicular to chest"},"appearance":"Clean geometry, minimal detail, smooth surface, no texture manipulation","construction":{"layers":"2-ply: outer face fabric + inner interfaced backing","foldLine":"clean 180° fold from base to leaf edge","leafEdge":"rounded finish, no raw seam visible (bound or turned)","anchorPoint":"rigid, anchored at neck seam","centerBackSeam":"single vertical line"},"negativeRules":["tidak sharp pada ujung","tidak kusut atau tidak rapi","tidak ter-manipulasi texture","tidak ada raw seam di edge"]},
  render_recipe: {"status":"configured","version":1,"metadata":{"specificationPrompt":"Standing collar, 3.5cm base + 6cm rounded leaf, centered at neck seam, symmetric, smooth white cotton, clean perpendicular positioning, no floating or twist, clear collar-body separation."},"placement":{"leafFlow":"extends 6cm upward from base, tips rounded, symmetric left-right","rotation":"0° tilt—no forward/backward angle","baseHeight":"3.5cm measured from neck seam upward","anchorPoint":"Collar base sits exactly at neck opening seam of thobe body","positioning":"Centered on front-neck, standing perpendicular to chest"},"negativeRules":["Collar floating or detached","Leaf pointing sideways or downward","Collar twisted or asymmetric","Harsh shadow lines at base","tidak merge ke body","tidak ada floating"],"renderPriority":["placement_lock","edge_separation","lighting_match"],"blendInstructions":{"shadow":"Under-collar shadow at base anchor (realistic depth)","lighting":"Match neck/chest lighting of thobe base","fabricTexture":"White cotton smooth finish, slight sheen variation","edgeSeparation":"Collar edge must show clear separation from body (not merge into fabric)"}},
})

const PLAKET_HEXAGONAL = stub({
  id: '10eb5b65-18f0-4f7d-9642-6b48d50d3e46',
  name: 'Plaket Hexagonal',
  category: 'plaket',
  is_active: true,
  photo_url: null,
  dna_color_id: null,
  ai_dna: {"status":"approved","version":2,"geometry":{"angle":"Vertical straight band; hexagon endpoint points directly downward (180° from neckline).","height":"Neckline to upper abdomen, 40cm total. Hexagon endpoint begins ~37cm from neckline, ends at 40cm.","silhouette":"Straight vertical band with 6-sided hexagon endpoint at the base — not a triangle or diamond, exactly 6 edges forming a precise geometric closure.","proportions":"Width 4cm; length 40cm (neckline to upper abdomen). Hexagon endpoint width matches the 4cm top-edge width; endpoint depth (top to bottom vertex) ~2.5-3cm.","endpoint_shape":"Regular hexagon rotated 180° (inverted STOP-sign silhouette): flat horizontal top edge, 4 angled sides, sharp pointed vertex at bottom-center.","endpoint_reference":"Defining visual feature — must remain clearly visible and unmistakably 6-sided, not simplified to a triangle or point.","endpoint_construction":{"top_edge":"Flat horizontal line, parallel to neckline, width matches the 4cm plaket body width — the hexagon's longest flat side.","bottom_vertex":"Single sharp pointed vertex at center-bottom; all 4 angled sides converge here (not rounded, not flattened).","upper_left_side":"Diagonal from top-left corner, descending 45° toward center-bottom.","lower_left_side":"Continues from upper-left diagonal, meeting the bottom vertex at 45°.","upper_right_side":"Mirror of upper-left: diagonal from top-right corner, descending 45° toward center-bottom.","lower_right_side":"Mirror of lower-left, meeting the bottom vertex at 45°."}},"metadata":{"note":"Precise 6-sided hexagon endpoint. Geometric design feature requiring exact AI rendering. NOT triangle approximation.","approvedAt":"2026-07-27T11:30:00Z","approvedBy":"Deka Kurniawan","generatedAt":"2026-07-27T11:30:00Z","sourceImage":"Plaket hexagonal close-up reference (2026-07-27)","reference_shape":"STOP sign rotated 180°, hexagon geometry"},"materials":{"facing":"Cotton poplin or structured twill.","primary":"Firm structured cotton, matching body fabric.","interlining":"Medium-weight structured interfacing (Pellon Peltex equivalent) for geometric precision and point vertex support."},"placement":{"relation_to_body":"Sits absolutely flat, hexagon geometry maintained without drooping or distortion.","position_on_garment":"Centered on front opening. Hexagon endpoint sits perfectly centered horizontally."},"stitching":{"stitch_type":"Centerline vertical topstitch, full 40cm length. Double horizontal frame lines at top edge and ~37cm (hexagon top). Optional angled topstitches may emphasize the hexagon sides.","thread_color_rule":"Darker thread on light fabric for clear line definition, emphasizing hexagon precision.","visible_seam_treatment":"Topstitching is prominent design feature. Hexagon shape must be clearly visible and precise."},"appearance":{"visual_character":"Geometric precision — hexagon endpoint is a deliberate design feature, not an accidental shape.","surface_treatment":"Crisp, flat structured finish with blade-sharp edges — not rounded, not soft.","construction_visible":"Double parallel horizontal topstitching frames the top edge and near the endpoint. Vertical centerline topstitch runs the full length. 4 angled topstitches may frame the hexagon sides. All lines sharp and crisp."},"construction":{"facing_type":"Single-layer structured facing, hidden interior.","interlining":"Medium-weight structured interfacing (18-20gsm minimum) to maintain hexagon geometric precision. Especially critical at point vertex to prevent drooping.","pattern_type":"Structured plaket strip with geometric 6-sided hexagon endpoint cap.","seam_placement":"Centered on front opening. Hexagon endpoint centered horizontally (symmetrical left-right).","endpoint_construction_method":"Hexagon shape precision-cut during pattern layout; all 6 edges stitched for geometric accuracy. Interlining keeps the point vertex sharp, without drooping or rounding."},"negativeRules":["CRITICAL: Do NOT render endpoint as triangle (3 sides). Must be hexagon (6 sides).","CRITICAL: Do NOT render endpoint as diamond or 4-sided shape. Must be 6-sided hexagon.","CRITICAL: Do NOT round or soften the hexagon endpoint. All edges must be crisp and geometric.","CRITICAL: Do NOT render 5-sided or 7-sided shape. Exactly 6 sides required.","Do NOT soften or blur topstitch lines defining hexagon geometry.","Do NOT render drooping or sagging point vertex. Point must be sharp and defined.","Do NOT distort hexagon proportions (top edge width should match lower sides length).","Do NOT add fraying or rough edges to hexagon endpoint.","Do NOT render wrinkles or creases on hexagon endpoint area.","Do NOT render excessive fabric puckering around hexagon shape."]},
  render_recipe: {"pose":{"neck_angle":"Straight, natural neck. Body must be perfectly aligned to show hexagon endpoint true geometry.","chest_position":"Symmetrical, centered. Hexagon endpoint centered horizontally in frame.","subject_orientation":"Facing camera directly. Hexagon endpoint must be centered and symmetric in frame (no tilting or rotation)."},"focus":{"focus_point":"All 6 hexagon edges simultaneously in sharp focus. Bottom vertex sharpest point of entire image.","depth_of_field":"Sharp focus on hexagon endpoint (especially point vertex and all 6 edges). Slight blur to body above and background."},"style":{"photorealism":"Premium formal wear product photography. Geometric precision construction evident. Studio-quality lighting.","lighting_setup":"Professional studio 3-light: key light (45° frontal), fill light (opposite side subtle), back light (rim light on body edges). Lighting designed to reveal all 6 hexagon edges with equal definition."},"camera":{"angle":"Flat frontal perpendicular to garment. Camera must show hexagon endpoint in true geometric perspective (no angle foreshortening).","focus":"Hexagon endpoint precision and geometry clarity. All 6 edges must be clearly visible and distinct.","distance":"Medium shot capturing full 40cm plaket length and complete hexagon endpoint geometry."},"status":"configured","quality":{"crispness":"Maximum sharpness on all hexagon edges. Zero soft-focus. Point vertex sharpest detail in entire image.","resolution":"Ultra high definition (4K+) for edge geometry clarity. Hexagon edges must be crisp at pixel level."},"version":2,"lighting":{"intensity":"Bright enough to show geometric edges clearly. Each hexagon edge must cast subtle shadow or highlight creating edge definition.","color_temperature":"Neutral daylight 5500K for accurate geometric edge definition and thread clarity.","key_light_position":"Flat frontal lighting (45° above, perpendicular to front plane). Lighting positioned to reveal all 6 hexagon edges with equal clarity. No shadows across endpoint."},"background":{"color":"Neutral (light gray, off-white) not competing with topstitch thread or hexagon edge definition.","style":"Soft studio blur, neutral background. Clean, undistracting. Focus entirely on plaket and hexagon geometry."},"composition":{"balance":"Symmetric, centered composition. Hexagon is focal point with plaket body as supporting context.","framing":"Hexagon endpoint centered in lower frame area. Full hexagon shape visible (top edge to bottom point). Frame shows context (plaket body above endpoint)."},"negativeRules":["CRITICAL: Do NOT render triangle. Render exactly 6-sided hexagon.","CRITICAL: Do NOT render diamond or 4-sided endpoint. Must be hexagon.","CRITICAL: Do NOT round hexagon point vertex. Vertex must be sharp and geometric.","Do NOT soften or blur hexagon edges. All 6 edges must be crisp and clear.","Do NOT distort hexagon geometry or proportions.","Do NOT render endpoint as irregular or asymmetric polygon.","Do NOT add wrinkles, creases, or fabric distortion to hexagon endpoint area.","Do NOT over-lighten or over-darken reducing edge clarity and definition.","Do NOT fail to show all 6 hexagon edges simultaneously in sharp focus.","Do NOT render approximation or simplification (e.g., triangle instead of hexagon) — hexagon is required exactly."],"fabricBehavior":{"drape":"Plaket sits absolutely flat. Hexagon endpoint area shows NO wrinkles, creases, or puckering. Structured, rigid appearance.","fold_pattern":"Plaket area maintains perfect flatness. Hexagon geometry preserved without fabric distortion.","light_interaction":"Topstitch threads catch light creating fine line definition. Hexagon edges show clear definition through thread contrast and subtle shadow."},"renderPriority":3,"visibilityRules":{"what_is_hidden":"Interior facing (hidden). Interlining structure (hidden). Back seams and body construction (hidden). Any fabric folds or wrinkles (hidden — must be flat).","what_is_visible":"Entire plaket length (40cm). All 6 hexagon endpoint edges visible and distinct. Hexagon top-edge, 4 angled sides, bottom sharp point all clearly shown. Centerline topstitch visible. Optional frame topstitches visible."},"hexagon_rendering_priority":{"symmetry":"Left-right symmetry must be perfect. Top edge width must visually match angled sides length.","edge_clarity":"Each of 6 hexagon edges must be crisp, clear, and geometrically precise. NOT soft or rounded.","comparison_check":"Final render must look like STOP sign rotated 180° (hexagon), NOT triangle, NOT diamond, NOT irregular polygon.","vertex_definition":"Bottom point vertex must be sharp, precise, centered. Zero rounding or blunting."}},
})

const PATCH_POCKET = stub({
  id: '2de82004-99a5-4e1e-a5e0-787c9cbac3a5',
  name: 'Patch Pocket Topstitched Medium',
  category: 'saku',
  is_active: true,
  photo_url: 'gs://localtailor-design-studio/saku/patch-topstitched-medium-v1.jpg',
  dna_color_id: null,
  ai_dna: {"style":"patch","status":"approved","opening":{"type":"plain_opening_no_closure","depth_cm":8,"mouth_behavior":"sits_flat_no_gape","opening_width_cm":7.5,"opening_height_cm":1.2},"version":1,"geometry":{"shape":"rectangle_rounded_corners","width_cm":8.5,"height_cm":10.5,"aspect_ratio":"vertical_emphasis_0.81","seam_allowance":"0.7cm_included","corner_radius_mm":3},"placement":{"anchor":"upper_body_front_panel","location":"chest_left_or_side","offset_from_armhole":"2.0cm"},"stitching":{"method":"topstitch","thread_type":"matching_or_subtle_contrast","line_quality":"even_tension_no_skips","stitch_pattern":"straight_parallel_to_edge","stitch_distance_mm":2.5},"proportion":{"visual_weight":"secondary_accent","dominance_rule":"never_larger_than_button_closure","scale_to_chest_width":"1.2x_standard_torso"},"variant_id":"saku_patch_topstitched_med_v1","construction":{"layers":"single_layer_tacked_at_base","tack_points":"top_corners_and_base_center","tack_thread":"matching_to_fabric","grain_direction":"vertical_aligned"},"context_rules":["Pocket is functional accent — must not overshadow main garment silhouette","Topstitch must be crisp, even tension, no skipped stitches","Pocket mouth opening must sit flush, zero gaping or pulling","Rounded corner arc is critical — not sharp (ugly), not oversized (cartoon)","Vertical grain alignment maintains visual proportion","Must look intentional, not slapped-on"],"edge_treatment":{"method":"topstitch","thread_type":"matching_or_subtle_contrast","line_quality":"even_tension_no_skips","stitch_pattern":"straight_parallel_to_edge","stitch_distance_mm":2.5},"fabric_interaction":{"puckering":"forbidden","shadow_depth":"minimal_2_3mm","wrinkle_permission":"allowed_at_base_only","drape_characteristic":"subtle_natural_fold_at_opening"}},
  render_recipe: {"status":"configured","version":1,"target_model":"gpt-image-1","quality_gates":[{"gate":"topstitch_visibility","rule":"Stitching line must be crisp and clearly visible at normal viewing distance","fail_condition":"blurry, faded, or invisible topstitch"},{"gate":"topstitch_evenness","rule":"Stitch spacing must be consistent (±0.5mm variation acceptable)","fail_condition":"gaps, irregular spacing, or tension puckering"},{"gate":"corner_curve","rule":"Rounded corners must follow natural arc, 3mm radius ±0.5mm","fail_condition":"sharp corners, over-rounded (>4mm), or distorted curve"},{"gate":"opening_flatness","rule":"Pocket mouth opening must lay flat against fabric surface","fail_condition":"gaping, artificial separation, or fabric pulling"},{"gate":"fabric_consistency","rule":"Pocket fabric must match texture and drape of surrounding base photo","fail_condition":"plastic look, waxy sheen, or obvious seam"},{"gate":"lighting_alignment","rule":"Shadows and highlights must align with base photo lighting direction","fail_condition":"contradictory light source, harsh shadows, or artificial glow"},{"gate":"boundary_respect","rule":"Pocket integration must stay within masked region, no spillover to garment body","fail_condition":"artifact at mask boundary, body alteration, or bleeding"}],"regional_mask":{"feather_type":"soft_gaussian","width_percent":15,"height_percent":20,"center_x_percent":12,"center_y_percent":25,"feather_radius_percent":8},"render_method":"regional_masked_overlay","base_reference":"full_garment_photo_flat_lay","context_to_gpt":{"instruction_primary":"Render a patch pocket with topstitch detailing into the masked region. Preserve all fabric texture, weave, and lighting from the base photo.","instruction_detailed":["Render ONLY the pocket shape, topstitching line, and minimal shadow at base","Match fabric texture exactly from surrounding base photo","Preserve lighting angle and intensity from original photo","Topstitch line must be: crisp, evenly-spaced, parallel to all edges","Corners must be: naturally rounded (3mm arc), not sharp, not over-curved","Opening mouth must be: flat, no artificial gap or pulling","Do NOT alter garment body outside the mask","Do NOT introduce new lighting or shadow that contradicts base"]},"component_scope":"pocket_outline_topstitch_shadow_only","iteration_strategy":{"attempt_limit":5,"target_pass_rate":"3_of_5_minimum","remediation_trigger":"if_2_consecutive_fails_pause_and_revise"}},
})

const SUDAS_CUFF = stub({
  id: '45b09ccf-8e2c-4a08-aa3d-0745c697c793',
  name: 'Sudas Cuff',
  category: 'manset',
  is_active: true,
  photo_url: 'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/master-data-photos/manset/45b09ccf-8e2c-4a08-aa3d-0745c697c793.jpg',
  dna_color_id: null,
  ai_dna: {"status":"needs_regeneration","version":1,"geometry":{"angle":"Wraps horizontal around sleeve end, perpendicular terhadap sleeve axis","height":"4cm cuff depth ketika dipasang pada wrist","silhouette":"Rectangular cuff dengan rounded corners, wraps around sleeve end","proportions":"Width 7cm, height 4cm, circumference adjustable sesuai sleeve"},"metadata":{"note":"Simple standard cuff untuk UAT. Detail fine-tuning bisa dilakukan setelah render test.","approvedAt":"2026-07-27T09:30:00Z","approvedBy":"Claude","generatedAt":"2026-07-27T09:30:00Z","sourceImage":"standard-cuff-reference.jpg"},"materials":{"facing":"Lightweight cotton atau blend matching body","primary":"Same sebagai body fabric (inherited dari bahan part)","interlining":"Lightweight fusible interfacing"},"placement":{"relation_to_body":"Sits snug pada sleeve end, functional closure point","position_on_garment":"Sleeve end, wraps around wrist area"},"stitching":{"stitch_type":"Machine-sewn topstitched edge, clean finish","thread_color_rule":"Thread color match dengan body fabric","visible_seam_treatment":"Edge topstitch visible, interior seams hidden"},"appearance":{"visual_character":"Simple formal cuff, minimal detail, functional closure","surface_treatment":"Flat, crisp, pressed finish; smooth surface","construction_visible":"Edge stitching visible, seam lines subtle, fold lines natural"},"construction":{"facing_type":"Single layer facing pada inner cuff","interlining":"Lightweight interfacing untuk maintain crisp edge","pattern_type":"Standard single-layer cuff construction","seam_placement":"Attached ke sleeve end, seam hidden di dalam fold"},"negativeRules":["Jangan render oversized atau undersized cuff","Jangan distort cuff shape","Jangan render cuff wrinkled atau puckered","Jangan render cuff gaping dari sleeve","Jangan render cuff limp atau drooping","Jangan render cuff terputus dari sleeve"]},
  render_recipe: {"pose":{"neck_angle":"Natural","chest_position":"Natural, relaxed","subject_orientation":"Arm slightly forward, wrist visible untuk show cuff clearly"},"focus":{"focus_point":"Cuff edge, seam line detail","depth_of_field":"Shallow to moderate, sharp focus pada cuff"},"style":{"photorealism":"Product photography detail level","lighting_setup":"Studio lighting highlighting cuff"},"camera":{"angle":"Slightly angled untuk show cuff 3D structure","focus":"Cuff detail, edge finish, seam lines","distance":"Close-up pada wrist dan sleeve end area"},"status":"configured","quality":{"crispness":"Sharp focus pada cuff edges","resolution":"High definition"},"version":1,"lighting":{"intensity":"Bright namun soft","color_temperature":"Neutral daylight ~5500K","key_light_position":"Soft directional 45 degrees untuk show cuff detail"},"background":{"color":"Neutral background","style":"Soft blur focusing pada cuff"},"composition":{"balance":"Balanced, cuff detail jelas","framing":"Cuff centered dalam frame, wrist area focused"},"negativeRules":["Jangan render cuff dengan harsh shadows","Jangan render cuff wrinkled","Jangan render cuff gaping","Jangan blur seam detail","Jangan render cuff limp","Jangan render cuff terputus dari sleeve","Jangan add unrealistic details"],"fabricBehavior":{"drape":"Cuff sits snug pada sleeve end","fold_pattern":"Natural fold kalau ada, structured","light_interaction":"Edge stitching catches light, thread visible"},"renderPriority":3,"visibilityRules":{"what_is_hidden":"Interior facing, backing","what_is_visible":"Entire cuff, opening, seam lines, edge finish"}},
})

const CUSTOMER_PHOTO_URL =
  'https://vdgkbzpdgmlzyxaiznka.supabase.co/storage/v1/object/public/consultation-photos/b295247f-faba-4e09-acc0-7d5abd162347/front-1785236836789.jpg'

const SELECTIONS: { componentType: string; option: MasterDataOption }[] = [
  { componentType: 'model_thobe', option: SAUDI_MODERN },
  { componentType: 'bahan', option: LORENZO },
  { componentType: 'warna_bahan', option: BLACK },
  { componentType: 'kerah', option: BASIM_COLLAR },
  { componentType: 'plaket', option: PLAKET_HEXAGONAL },
  { componentType: 'saku', option: PATCH_POCKET },
  { componentType: 'manset', option: SUDAS_CUFF },
]

function main() {
  const rowsById = new Map<string, MasterDataOption>(SELECTIONS.map((s) => [s.option.id, s.option]))

  console.log('='.repeat(80))
  console.log('DRY-RUN COMPRESSION VALIDATION — PR-06 (no OpenAI call)')
  console.log('='.repeat(80))

  const componentsMissing: { componentId: string; componentType: string; reason: string }[] = []
  const resolved: { option: MasterDataOption; recipe: RenderRecipe }[] = []

  SELECTIONS.forEach(({ componentType, option }) => {
    // Architecture Lock (2026-08-04) — Model Thobe is catalog-only now,
    // excluded from DNA resolution entirely (mirrors route.ts exactly).
    if (option.category === 'model_thobe') return
    const input: DNAResolverInput = { itemId: option.id, category: option.category, aiDna: option.ai_dna, renderRecipe: option.render_recipe }
    const { recipe, ready, errors } = resolveDNA(input)
    if (!ready || !recipe) {
      componentsMissing.push({ componentId: option.id, componentType, reason: `"${option.name}" — ${errors.join(' ')}` })
      return
    }
    resolved.push({ option, recipe })
  })
  console.log(`Resolved ${resolved.length}/${SELECTIONS.length}`)

  const componentDnaResults = SELECTIONS.filter((s) => s.option.id !== SAUDI_MODERN.id).map((s) => {
    const v = validateComponentDna({ itemId: s.option.id, category: s.option.category, aiDna: s.option.ai_dna })
    return { itemId: s.option.id, category: s.option.category, valid: v.valid }
  })
  const collarOptionRaw = rowsById.get(BASIM_COLLAR.id) ?? null
  const composedAssets = composeAiAssets({ customerPhotoUrl: CUSTOMER_PHOTO_URL, collarOption: collarOptionRaw })
  const baseHeroAvailable = GLOBAL_BASE_HERO_IMAGE_URL !== null
  validateCollarReference({ collarOption: collarOptionRaw, composed: composedAssets })

  const unresolvedComponents: UnresolvedComponent[] = componentsMissing.map((m) => ({ itemId: m.componentId, category: m.componentType, reason: m.reason }))
  const capability = evaluateCapability({
    customerPhotoPresent: true,
    baseHeroAvailable,
    componentDnaResults,
    unresolvedComponents,
  })
  console.log(`CAPABILITY: mode=${capability.mode} score=${capability.capabilityScore}%`)
  if (capability.mode === 'BLOCKED') {
    console.log(`BLOCKED — ${capability.blockedReason}`)
    return
  }

  const entries: RenderRecipeEntry[] = resolved.map(({ option, recipe }, index) => ({ itemId: option.id, category: option.category, recipe, priority: index }))
  const masterRecipe = composeRenderRecipe({ entries, policy: DEFAULT_GLOBAL_RENDER_POLICY })
  const instruction = buildRenderInstruction(masterRecipe)
  const instructionValidation = validateRenderInstruction(instruction)
  console.log(`Instruction valid: ${instructionValidation.valid} ${instructionValidation.errors.join(' | ')}`)
  if (!instruction) return
  serializeOpenAI({ instruction })

  const promptLayers = buildPromptLayers({ entries, masterRecipe, identityTemplate: LAYER1_IDENTITY_TEMPLATE })
  const layerCompression = compressPromptByLayers(promptLayers)
  console.log('\nLayer report:')
  console.table(layerCompression.layerReport)

  if (!layerCompression.ok) {
    console.log(`FAILED: ${layerCompression.error}`)
    return
  }

  const lookCuttingSelected = entries.some((e) => e.category === 'look_cutting')
  const requiredPriorityZeroIds = ['identity', 'material', 'material_color', ...(lookCuttingSelected ? ['look_cutting'] : [])]
  const priorityZeroCheck = validatePriorityZeroIntact(layerCompression.layerReport, requiredPriorityZeroIds)
  console.log(`\nPriority 0 intact: ${priorityZeroCheck.valid}`)

  const plaketRow = layerCompression.layerReport.find((r) => r.id === 'component:plaket')
  const sakuRow = layerCompression.layerReport.find((r) => r.id === 'component:saku')
  const allP1Included = layerCompression.layerReport.filter((r) => r.priority === 1).every((r) => r.included)

  console.log('\n=== PR-06 VALIDATION ===')
  console.log(`component:plaket included=${plaketRow?.included} truncated=${plaketRow?.truncated} tokens=${plaketRow?.tokens}`)
  console.log(`component:saku   included=${sakuRow?.included} truncated=${sakuRow?.truncated} tokens=${sakuRow?.tokens}`)
  console.log(`ALL selected (Priority 1) components included: ${allP1Included}`)
  console.log(`Total tokens used: ${layerCompression.totalTokens}`)

  const containsHexagonMention = layerCompression.compressed.toLowerCase().includes('hexagon')
  const containsPocketMention = layerCompression.compressed.toLowerCase().includes('pocket') || layerCompression.compressed.toLowerCase().includes('patch')
  console.log(`Compressed prompt mentions "hexagon": ${containsHexagonMention}`)
  console.log(`Compressed prompt mentions pocket/patch: ${containsPocketMention}`)

  console.log(`\nVERDICT: ${plaketRow?.included && sakuRow?.included && allP1Included ? 'PASS' : 'FAIL'}`)
}

main()
