// PR-07 — AI DESIGN DNA INFORMATION DENSITY OPTIMIZATION — 2026-07-31
//
// Computes real BEFORE/AFTER token counts for the 11 production AI Design
// DNA rows using the EXACT same formatRecord (serializer.ts) and
// estimateTokens (compression.ts) functions the live pipeline uses, so the
// reduction numbers in the report are grounded in the real prompt math, not
// an estimate. Only the 6 fields resolver.ts's AI_DNA_GARMENT_FIELDS
// actually reads (geometry/construction/appearance/materials/stitching/
// placement) + negativeRules are measured — those are the only parts of
// ai_dna that ever reach the render prompt.
//
// This script is scratch-only: never committed, deleted after use.

const WORDS_PER_TOKEN = 1 / 1.3
function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 0
  return Math.ceil(words.length * (1 / WORDS_PER_TOKEN))
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(', ')
  if (typeof value === 'object') return formatRecord(value as Record<string, unknown>)
  return String(value)
}
function formatRecord(record: Record<string, unknown> | null | undefined): string {
  return Object.keys(record ?? {})
    .sort()
    .map((key) => {
      const value = formatValue((record as Record<string, unknown>)?.[key])
      return value ? `${key}: ${value}` : ''
    })
    .filter(Boolean)
    .join(', ')
}

const GARMENT_FIELDS = ['geometry', 'construction', 'appearance', 'materials', 'stitching', 'placement'] as const

interface RowVariant {
  name: string
  category: string
  garment: Record<string, unknown> // the 6 AI_DNA_GARMENT_FIELDS, as ai_dna would carry them (color rows use `appearance` here; resolver renames to `color` only for warna_bahan, doesn't change token count)
  negativeRules: string[]
}

function garmentTokens(garment: Record<string, unknown>): number {
  const parts = GARMENT_FIELDS.map((f) => {
    const v = garment[f]
    if (v === undefined || v === null || v === '') return ''
    if (typeof v === 'string') return `${f}: ${v}`
    return `${f}: ${formatRecord(v as Record<string, unknown>)}`
  }).filter(Boolean)
  return estimateTokens(parts.join(', '))
}
function negativeRulesTokens(rules: string[]): number {
  return estimateTokens(rules.join(', '))
}

function emitUpdate(id: string, name: string, paths: { path: string[]; value: unknown }[]) {
  if (paths.length === 0) {
    console.log(`\n-- ${name} (${id}): no changes, skipped`)
    return
  }
  let expr = 'ai_dna'
  paths.forEach(({ path, value }) => {
    const sqlLiteral = `'${JSON.stringify(value).replace(/'/g, "''")}'`
    expr = `jsonb_set(${expr}, '{${path.join(',')}}', ${sqlLiteral}::jsonb)`
  })
  console.log(`\n-- ${name}\nUPDATE design_master_options SET ai_dna = ${expr} WHERE id = '${id}';`)
}

function report(label: string, before: RowVariant, after: RowVariant) {
  const bG = garmentTokens(before.garment)
  const aG = garmentTokens(after.garment)
  const bN = negativeRulesTokens(before.negativeRules)
  const aN = negativeRulesTokens(after.negativeRules)
  const bTotal = bG + bN
  const aTotal = aG + aN
  const reduction = bTotal === 0 ? 0 : ((bTotal - aTotal) / bTotal) * 100
  console.log(`\n${'='.repeat(70)}\n${label}\n${'='.repeat(70)}`)
  console.log(`Garment fields:  ${bG} -> ${aG} tokens`)
  console.log(`negativeRules:   ${bN} -> ${aN} tokens`)
  console.log(`TOTAL:           ${bTotal} -> ${aTotal} tokens   (${reduction.toFixed(1)}% reduction)`)
}

// ===========================================================================
// Below: BEFORE = verbatim from production (fetched 2026-07-31). AFTER = the
// PR-07 optimized text. Only garment fields + negativeRules included, since
// those are the only parts resolver.ts ever reads into the render prompt.
// ===========================================================================

// ---- warna_bahan: Black ----
report(
  'Black (warna_bahan)',
  { name: 'Black', category: 'warna_bahan', negativeRules: [], garment: { appearance: "Deep black tone, near-zero reflectivity. Undertone: neutral-cool with slight depth. Absorbs light completely — visual weight and presence. Matte finish, minimal sheen. No color bleed, no graying. Consistent darkness across all fabric surfaces. Visual characteristic: solid, grounding, maximum contrast. Sharp definition when paired with lighter elements. Lighting interaction: light-absorptive, reveals texture through shadow only. Creates bold silhouette. Color code: #1A1A1A (pure black). Specification: zero-brightness, maximum saturation darkness. Professional, formal, timeless visual impact." } },
  { name: 'Black', category: 'warna_bahan', negativeRules: [], garment: { appearance: "Deep black tone, near-zero reflectivity, undertone neutral-cool. Absorbs light completely, matte finish with minimal sheen. No color bleed, no graying — consistent darkness across all fabric surfaces. Light-absorptive: reveals texture through shadow only, creating strong contrast and sharp definition against lighter elements. Color code #1A1A1A (pure black)." } }
)

// ---- warna_bahan: Maroon ----
report(
  'Maroon (warna_bahan)',
  { name: 'Maroon', category: 'warna_bahan', negativeRules: [], garment: { appearance: "Deep maroon tone, burgundy-red with brown undertone. Rich saturation with moderate light-absorptive quality. Visual characteristic: warm, formal, premium. Not bright red — dark, grounded, sophisticated. Matte finish. Consistent color across fabric surfaces. Lighting interaction: reveals warm red undertone through reflection and shadow. Creates visual depth and prestige. Color code: #800020 (classic maroon). Specification: deep red-brown, never bright, always warm-formal. Visual impact: elegance, formality, richness. Pairs well with neutral and cool tones." } },
  { name: 'Maroon', category: 'warna_bahan', negativeRules: [], garment: { appearance: "Deep maroon tone, burgundy-red with brown undertone. Rich saturation, moderate light-absorptive quality — not bright red. Matte finish, consistent color across fabric surfaces. Lighting interaction reveals warm red undertone through reflection and shadow. Color code #800020 (classic maroon)." } }
)

// ---- warna_bahan: Navy ----
report(
  'Navy (warna_bahan)',
  { name: 'Navy', category: 'warna_bahan', negativeRules: [], garment: { appearance: "Deep navy blue tone, rich saturation. Undertone: cool, with slight red undertone (navy red-edge). Not pure blue — contains slight burgundy depth. Visual characteristic: sophisticated, authoritative, professional. Absorbs light like black but retains blue identity. Matte finish. Consistent color across fabric — no fading or graying. Lighting interaction: moderate light-absorptive, reveals subtle blue undertone in shadows. Creates visual weight without severity. Color code: #000080 (true navy). Specification: deep blue, never bright, always authoritative. Visual impact: trust, formality, premium feel." } },
  { name: 'Navy', category: 'warna_bahan', negativeRules: [], garment: { appearance: "Deep navy blue tone, rich saturation. Undertone cool with slight red edge — not pure blue, slight burgundy depth. Light-absorptive similar to black but retains blue identity, revealing subtle blue undertone in shadows; never renders as bright blue. Matte finish, consistent color across fabric, no fading or graying. Color code #000080 (true navy)." } }
)

// ---- warna_bahan: Putih Clean ----
report(
  'Putih Clean (warna_bahan)',
  { name: 'Putih Clean', category: 'warna_bahan', negativeRules: [], garment: { appearance: "Pure white tone, high saturation and brightness. Undertone: neutral-cool. Reflective surface quality — catches light evenly without yellowing or graying. Clean, sharp, minimal visual noise. Consistent matte finish when rendered on fabric. No warmth, no darkness — maximum visibility and contrast. Crisp edges when placed against darker components. Visual characteristic: pristine, medical-grade clarity. Lighting interaction: non-absorptive, reflects ambient light uniformly. Color code: #FFFFFF (RGB 255,255,255). Specification: absolute white, no tint." } },
  { name: 'Putih Clean', category: 'warna_bahan', negativeRules: [], garment: { appearance: "Pure white tone, high saturation and brightness, undertone neutral-cool. Reflective, non-absorptive surface — reflects ambient light evenly and uniformly, without yellowing, graying, or tint. Consistent matte finish when rendered on fabric. No warmth, no darkness — maximum visibility and contrast, crisp edges against darker components. Color code #FFFFFF (RGB 255,255,255)." } }
)

// ---- kerah: Basim Collar ----
report(
  'Basim Collar (kerah)',
  { name: 'Basim Collar', category: 'kerah', negativeRules: ["tidak sharp pada ujung","tidak kusut atau tidak rapi","tidak ter-manipulasi texture","tidak ada raw seam di edge"], garment: {
    geometry: { leafShape: "Symmetrical rounded point (tidak sharp, smooth curve dari mid-leaf ke tip)", collarSpread: "Full width neck opening, balanced left-right", collarLeafHeight: "6cm", standingBaseHeight: "3.5cm" },
    materials: { base: "White or light neutral base", type: "Lightweight cotton or cotton-poly blend", drape: "Stable drape, holds shape without stiffness" },
    placement: { leafFlow: "extends 6cm upward from base, tips rounded, symmetric left-right", rotation: "0° tilt—no forward/backward angle", baseHeight: "3.5cm measured from neck seam upward", anchorPoint: "Collar base sits exactly at neck opening seam of thobe body", positioning: "Centered on front-neck, standing perpendicular to chest" },
    appearance: "Modern formal: clean geometry, minimal detail, smooth surface, no texture manipulation",
    construction: { layers: "2-ply: outer face fabric + inner interfaced backing", foldLine: "clean 180° fold from base to leaf edge", leafEdge: "rounded finish, no raw seam visible (bound or turned)", anchorPoint: "rigid, anchored at neck seam", centerBackSeam: "single vertical line" },
  } },
  { name: 'Basim Collar', category: 'kerah', negativeRules: ["tidak sharp pada ujung","tidak kusut atau tidak rapi","tidak ter-manipulasi texture","tidak ada raw seam di edge"], garment: {
    geometry: { leafShape: "Symmetrical rounded point (tidak sharp, smooth curve dari mid-leaf ke tip)", collarSpread: "Full width neck opening, balanced left-right", collarLeafHeight: "6cm", standingBaseHeight: "3.5cm" },
    materials: { base: "White or light neutral base", type: "Lightweight cotton or cotton-poly blend", drape: "Stable drape, holds shape without stiffness" },
    placement: { leafFlow: "extends 6cm upward from base, tips rounded, symmetric left-right", rotation: "0° tilt—no forward/backward angle", baseHeight: "3.5cm measured from neck seam upward", anchorPoint: "Collar base sits exactly at neck opening seam of thobe body", positioning: "Centered on front-neck, standing perpendicular to chest" },
    appearance: "Clean geometry, minimal detail, smooth surface, no texture manipulation",
    construction: { layers: "2-ply: outer face fabric + inner interfaced backing", foldLine: "clean 180° fold from base to leaf edge", leafEdge: "rounded finish, no raw seam visible (bound or turned)", anchorPoint: "rigid, anchored at neck seam", centerBackSeam: "single vertical line" },
  } }
)

// ---- manset: Sudas Cuff ----
report(
  'Sudas Cuff (manset)',
  { name: 'Sudas Cuff', category: 'manset', negativeRules: ["Jangan render oversized atau undersized cuff","Jangan distort cuff shape","Jangan render cuff wrinkled atau puckered","Jangan render cuff gaping dari sleeve","Jangan render cuff limp atau drooping","Jangan render cuff terputus dari sleeve"], garment: {
    geometry: { angle: "Wraps horizontal around sleeve end, perpendicular terhadap sleeve axis", height: "4cm cuff depth ketika dipasang pada wrist", silhouette: "Rectangular cuff dengan rounded corners, wraps around sleeve end", proportions: "Width 7cm, height 4cm, circumference adjustable sesuai sleeve" },
    materials: { facing: "Lightweight cotton atau blend matching body", primary: "Same sebagai body fabric (inherited dari bahan part)", interlining: "Lightweight fusible interfacing" },
    placement: { relation_to_body: "Sits snug pada sleeve end, functional closure point", position_on_garment: "Sleeve end, wraps around wrist area" },
    stitching: { stitch_type: "Machine-sewn topstitched edge, clean finish", thread_color_rule: "Thread color match dengan body fabric", visible_seam_treatment: "Edge topstitch visible, interior seams hidden" },
    appearance: { visual_character: "Simple formal cuff, clean aesthetic, minimal detail, functional closure", surface_treatment: "Flat crisp finish, pressed appearance, smooth surface", construction_visible: "Edge stitching visible, seam lines subtle, fold lines natural" },
    construction: { facing_type: "Single layer facing pada inner cuff", interlining: "Lightweight interfacing untuk maintain crisp edge", pattern_type: "Standard single-layer cuff construction", seam_placement: "Attached ke sleeve end, seam hidden di dalam fold" },
  } },
  { name: 'Sudas Cuff', category: 'manset', negativeRules: ["Jangan render oversized atau undersized cuff","Jangan distort cuff shape","Jangan render cuff wrinkled atau puckered","Jangan render cuff gaping dari sleeve","Jangan render cuff limp atau drooping","Jangan render cuff terputus dari sleeve"], garment: {
    geometry: { angle: "Wraps horizontal around sleeve end, perpendicular terhadap sleeve axis", height: "4cm cuff depth ketika dipasang pada wrist", silhouette: "Rectangular cuff dengan rounded corners, wraps around sleeve end", proportions: "Width 7cm, height 4cm, circumference adjustable sesuai sleeve" },
    materials: { facing: "Lightweight cotton atau blend matching body", primary: "Same sebagai body fabric (inherited dari bahan part)", interlining: "Lightweight fusible interfacing" },
    placement: { relation_to_body: "Sits snug pada sleeve end, functional closure point", position_on_garment: "Sleeve end, wraps around wrist area" },
    stitching: { stitch_type: "Machine-sewn topstitched edge, clean finish", thread_color_rule: "Thread color match dengan body fabric", visible_seam_treatment: "Edge topstitch visible, interior seams hidden" },
    appearance: { visual_character: "Simple formal cuff, minimal detail, functional closure", surface_treatment: "Flat, crisp, pressed finish; smooth surface", construction_visible: "Edge stitching visible, seam lines subtle, fold lines natural" },
    construction: { facing_type: "Single layer facing pada inner cuff", interlining: "Lightweight interfacing untuk maintain crisp edge", pattern_type: "Standard single-layer cuff construction", seam_placement: "Attached ke sleeve end, seam hidden di dalam fold" },
  } }
)

// ---- bahan: Lorenzo Premium Gold Class ----
report(
  'Lorenzo Premium Gold Class (bahan)',
  { name: 'Lorenzo', category: 'bahan', negativeRules: ["Jangan render fabric sebagai flat atau lifeless","Jangan render sebagai glossy atau terlalu shiny - maintain matte aesthetic","Jangan render wrinkles yang tidak natural atau exaggerated","Jangan render stiff atau rigid appearance - tetap maintain soft controlled drape","Jangan override texture dengan artificial effects"], garment: {
    geometry: { angle: "Twill diagonal yang halus, teksiur seragam di seluruh permukaan", height: "Panjang custom sesuai dengan model thobe (138cm untuk Saudi Modern)", silhouette: "Wool-blend twill dengan struktur medium-weight, drape terkontrol namun lembut", proportions: "Medium-weight yang memberikan body cukup untuk maintain shape sepanjang penggunaan, tidak limp namun tidak overly rigid" },
    materials: { facing: "Sama dengan primary material (jika ada facing, akan di-apply dari component part)", primary: "Wool-blend twill 60 wool / 40 synthetic, medium weight ~250-280 gsm", interlining: "Lightweight interfacing untuk supporting seams saja" },
    placement: { relation_to_body: "Relaxed fit yang maintain shape, natural drape di sekitar body, tidak clinging", position_on_garment: "Entire garment body - wraps around full torso, sleeves, dan body length" },
    stitching: { stitch_type: "Machine-sewn throughout, clean seam finish dengan double-lock stitch", thread_color_rule: "Thread color sesuai dengan warna pilihan customer (dari warna_bahan part)", visible_seam_treatment: "Jahitan visible dan prominent di surface (premium construction detail)" },
    appearance: { visual_character: "Premium wool-blend formal wear, elegant dan sophisticated, matte finish dengan subtle sheen", surface_treatment: "Matte finish dengan micro-dimensional texture, smooth dan refined, tidak flat, subtle sheen response terhadap cahaya", construction_visible: "Jahitan jelas terlihat di surface (premium aesthetic), seam lines crisp dan clean, topstitching precise" },
    construction: { facing_type: "Tidak ada facing khusus untuk base material", interlining: "Minimal - hanya untuk struktur supporting areas jika diperlukan", pattern_type: "Continuous fabric roll, no piecing", seam_placement: "Standard body seams (shoulder, side, center front)" },
  } },
  { name: 'Lorenzo', category: 'bahan', negativeRules: ["Jangan render fabric sebagai flat atau lifeless","Jangan render sebagai glossy atau terlalu shiny - maintain matte aesthetic","Jangan render wrinkles yang tidak natural atau exaggerated","Jangan render stiff atau rigid appearance - tetap maintain soft controlled drape","Jangan override texture dengan artificial effects"], garment: {
    geometry: { angle: "Twill diagonal yang halus, teksiur seragam di seluruh permukaan", height: "Panjang custom sesuai dengan model thobe (138cm untuk Saudi Modern)", silhouette: "Wool-blend twill dengan struktur medium-weight, drape terkontrol namun lembut", proportions: "Medium-weight yang memberikan body cukup untuk maintain shape sepanjang penggunaan, tidak limp namun tidak overly rigid" },
    materials: { facing: "Sama dengan primary material (jika ada facing, akan di-apply dari component part)", primary: "Wool-blend twill 60 wool / 40 synthetic, medium weight ~250-280 gsm", interlining: "Lightweight interfacing untuk supporting seams saja" },
    placement: { relation_to_body: "Relaxed fit yang maintain shape, natural drape di sekitar body, tidak clinging", position_on_garment: "Entire garment body - wraps around full torso, sleeves, dan body length" },
    stitching: { stitch_type: "Machine-sewn throughout, clean seam finish dengan double-lock stitch", thread_color_rule: "Thread color sesuai dengan warna pilihan customer (dari warna_bahan part)", visible_seam_treatment: "Jahitan visible dan prominent di surface" },
    appearance: { visual_character: "Wool-blend formal wear", surface_treatment: "Matte finish dengan micro-dimensional texture, smooth, tidak flat, subtle sheen response terhadap cahaya", construction_visible: "Jahitan jelas terlihat di surface, seam lines crisp dan clean, topstitching precise" },
    construction: { facing_type: "Tidak ada facing khusus untuk base material", interlining: "Minimal - hanya untuk struktur supporting areas jika diperlukan", pattern_type: "Continuous fabric roll, no piecing", seam_placement: "Standard body seams (shoulder, side, center front)" },
  } }
)

// ---- model_thobe: Saudi Modern ----
report(
  'Saudi Modern (model_thobe)',
  { name: 'Saudi Modern', category: 'model_thobe', negativeRules: [], garment: {
    geometry: { fit: "Standard fit, natural drape", collar: "Not defined by Model Thobe — reserved for selected Collar DNA", length: "138cm, ankle-length, straight full-length hem", sleeve: "Standard set-in sleeve base construction connected naturally to shoulder", length_cm: 138, silhouette: "Ankle-length, straight modern cut", construction: "Single-piece full length body panel, straight side seams, natural shoulder, moderate body volume" },
    materials: { note: "Recommended base fabric per Owner: 60/40 wool blend. Cross-referenced in bahan.Lorenzo Premium Gold Class (geometry.height already cites \"138cm untuk Saudi Modern\"). Actual fabric for a given order is still selected independently via the bahan category at order time." },
    placement: { symmetry: "Perfect bilateral symmetry.", center_axis: "Strong centered front alignment.", body_balance: "Balanced left and right proportions.", garment_focus: "Entire body acts as base canvas for modular DNA.", vertical_flow: "Continuous uninterrupted vertical line.", reserved_component_area: { cuff: true, collar: true, pocket: true, placket: true, accessory: true, embroidery: true } },
    stitching: { main_seam: "Clean straight seam.", side_seam: "Continuous side seam.", hem_finish: "Clean folded hem.", overall_finish: "Premium clean tailoring.", thread_visibility: "Hidden where possible.", construction_stitch: "Standard lockstitch.", top_stitch_visibility: "Minimal." },
    appearance: { movement: "Natural vertical fabric fall.", complexity: "Minimal.", proportion: "Balanced vertical proportion emphasizing long continuous garment.", silhouette: "Straight modern Saudi silhouette.", back_balance: "Centered and symmetrical.", visual_focus: "Body silhouette and clean drape.", front_balance: "Centered and symmetrical.", overall_shape: "Minimal, clean, elegant and timeless.", design_language: "Premium modern Islamic menswear.", surface_character: "Minimal visual interruption." },
    construction: { main_panel: "Straight continuous body panel from shoulder to hem without segmented construction.", body_volume: "Moderate body volume intended to follow Look Cutting DNA.", sleeve_base: "Standard set-in sleeve construction connected naturally to shoulder.", front_surface: "Clean uninterrupted front body reserved for modular DNA components.", hem_structure: "Straight full-length hem with balanced front and back length.", body_structure: "Single-piece full length thobe body with clean uninterrupted front and back panels.", side_structure: "Straight vertical side seams following natural body line.", shoulder_structure: "Natural shoulder without padding or exaggerated shape." },
  } },
  { name: 'Saudi Modern', category: 'model_thobe', negativeRules: [], garment: {
    geometry: { fit: "Standard fit, natural drape", collar: "Not defined by Model Thobe — reserved for selected Collar DNA", length: "138cm, ankle-length, straight full-length hem", sleeve: "Standard set-in sleeve base construction connected naturally to shoulder", length_cm: 138, silhouette: "Ankle-length, straight modern cut", construction: "Single-piece full length body panel, straight side seams, natural shoulder, moderate body volume" },
    materials: { note: "Base fabric defined separately by the selected bahan (material) item — not by Model Thobe." },
    placement: { symmetry: "Perfect bilateral symmetry.", center_axis: "Strong centered front alignment.", body_balance: "Balanced left and right proportions.", garment_focus: "Entire body acts as base canvas for modular DNA.", vertical_flow: "Continuous uninterrupted vertical line.", reserved_component_area: { cuff: true, collar: true, pocket: true, placket: true, accessory: true, embroidery: true } },
    stitching: { main_seam: "Clean straight seam.", side_seam: "Continuous side seam.", hem_finish: "Clean folded hem.", overall_finish: "Clean tailoring.", thread_visibility: "Hidden where possible.", construction_stitch: "Standard lockstitch.", top_stitch_visibility: "Minimal." },
    appearance: { movement: "Natural vertical fabric fall.", complexity: "Minimal.", proportion: "Balanced vertical proportion emphasizing long continuous garment.", silhouette: "Straight modern Saudi silhouette.", back_balance: "Centered and symmetrical.", visual_focus: "Body silhouette and clean drape.", front_balance: "Centered and symmetrical.", overall_shape: "Minimal, clean.", design_language: "Modern Islamic menswear.", surface_character: "Minimal visual interruption." },
    construction: { main_panel: "Straight continuous body panel from shoulder to hem without segmented construction.", body_volume: "Moderate body volume intended to follow Look Cutting DNA.", sleeve_base: "Standard set-in sleeve construction connected naturally to shoulder.", front_surface: "Clean uninterrupted front body reserved for modular DNA components.", hem_structure: "Straight full-length hem with balanced front and back length.", body_structure: "Single-piece full length thobe body with clean uninterrupted front and back panels.", side_structure: "Straight vertical side seams following natural body line.", shoulder_structure: "Natural shoulder without padding or exaggerated shape." },
  } }
)

// ---- plaket: Plaket Hexagonal ----
report(
  'Plaket Hexagonal (plaket)',
  { name: 'Plaket Hexagonal', category: 'plaket', negativeRules: ["CRITICAL: Do NOT render endpoint as triangle (3 sides). Must be hexagon (6 sides).","CRITICAL: Do NOT render endpoint as diamond or 4-sided shape. Must be 6-sided hexagon.","CRITICAL: Do NOT round or soften the hexagon endpoint. All edges must be crisp and geometric.","CRITICAL: Do NOT render 5-sided or 7-sided shape. Exactly 6 sides required.","Do NOT soften or blur topstitch lines defining hexagon geometry.","Do NOT render drooping or sagging point vertex. Point must be sharp and defined.","Do NOT distort hexagon proportions (top edge width should match lower sides length).","Do NOT add fraying or rough edges to hexagon endpoint.","Do NOT render wrinkles or creases on hexagon endpoint area.","Do NOT render excessive fabric puckering around hexagon shape."], garment: {
    geometry: { angle: "Vertical straight band. Hexagon endpoint point faces directly downward (180° from neckline).", height: "Neckline base to upper abdomen terminus (40cm total). Hexagon endpoint begins ~37cm from neckline, terminates at ~40cm.", silhouette: "Straight vertical band with 6-sided geometric hexagon endpoint at base. NOT triangle. NOT diamond. Exactly 6 edges forming precise geometric closure.", proportions: "Width: 4cm. Length: 40cm neckline to upper abdomen. Hexagon endpoint width matches top-edge width (4cm). Endpoint depth (top to bottom vertex): ~2.5-3cm.", endpoint_shape: "Regular hexagon rotated 180° (STOP sign shape upside-down): flat horizontal top edge, 4 angled middle sides, sharp pointed vertex at bottom center.", endpoint_reference: "Imagine a STOP sign (octagon), rotate it 180°, remove 2 sides to create hexagon: you get this shape. Flat edge at top, geometric angled sides, sharp point at bottom.", endpoint_construction: { top_edge: "Flat horizontal line, parallel to neckline, width exactly matches plaket body width (4cm). This is the hexagon's longest flat side.", bottom_vertex: "Single sharp pointed vertex at exact center-bottom. All 4 angled sides converge to this single point (NOT rounded, NOT flattened).", lower_left_side: "Diagonal line continuing from upper-left, meeting lower-right at center bottom point. Maintains 45° descent angle.", upper_left_side: "Diagonal line from top-left corner descending at 45° angle toward center-bottom.", lower_right_side: "Diagonal line continuing from upper-right, meeting lower-left at center bottom point. Maintains 45° descent angle.", upper_right_side: "Diagonal line from top-right corner descending at 45° angle toward center-bottom. Mirror of upper-left." } },
    materials: { facing: "Cotton poplin or structured twill.", primary: "Firm structured cotton, matching body fabric.", interlining: "Medium-weight structured interfacing (Pellon Peltex equivalent) for geometric precision and point vertex support." },
    placement: { relation_to_body: "Sits absolutely flat. Hexagon geometry maintained without drooping or distortion. Formal structured appearance.", position_on_garment: "Centered on front opening. Hexagon endpoint sits perfectly centered horizontally." },
    stitching: { stitch_type: "Centerline vertical topstitch full 40cm length. Double horizontal frame lines at top edge and ~37cm (hexagon top). Possible angled topstitches emphasizing hexagon sides (optional geometric frame effect).", thread_color_rule: "Darker thread on light fabric for line definition. Thread color emphasizes hexagon geometry precision.", visible_seam_treatment: "Topstitching is prominent design feature. Hexagon shape must be clearly visible and precise." },
    appearance: { visual_character: "Geometric precision, formal structured, mathematical symmetry. Hexagon endpoint is deliberate design feature (NOT accidental shape).", surface_treatment: "Ultra-crisp structured finish. Hexagon endpoint has blade-sharp edges (NOT rounded, NOT soft). Flat surface with perfect edge definition.", construction_visible: "Double parallel horizontal topstitching frames top edge and bottom near-endpoint. Vertical centerline topstitch runs full length emphasizing symmetry. 4 angled topstitches may frame hexagon sides creating geometric emphasis. All lines sharp, crisp, clearly defined." },
    construction: { facing_type: "Single-layer structured facing, hidden interior.", interlining: "Medium-weight structured interfacing (18-20gsm minimum) to maintain hexagon geometric precision. Especially critical at point vertex to prevent drooping.", pattern_type: "Structured plaket strip with geometric 6-sided hexagon endpoint cap.", seam_placement: "Centered on front opening. Hexagon endpoint centered horizontally (symmetrical left-right).", endpoint_construction_method: "Hexagon shape precision-cut during pattern layout. All 6 edges carefully stitched to maintain geometric accuracy. Interlining supports sharp point vertex without drooping or rounding." },
  } },
  { name: 'Plaket Hexagonal', category: 'plaket', negativeRules: ["CRITICAL: Do NOT render endpoint as triangle (3 sides). Must be hexagon (6 sides).","CRITICAL: Do NOT render endpoint as diamond or 4-sided shape. Must be 6-sided hexagon.","CRITICAL: Do NOT round or soften the hexagon endpoint. All edges must be crisp and geometric.","CRITICAL: Do NOT render 5-sided or 7-sided shape. Exactly 6 sides required.","Do NOT soften or blur topstitch lines defining hexagon geometry.","Do NOT render drooping or sagging point vertex. Point must be sharp and defined.","Do NOT distort hexagon proportions (top edge width should match lower sides length).","Do NOT add fraying or rough edges to hexagon endpoint.","Do NOT render wrinkles or creases on hexagon endpoint area.","Do NOT render excessive fabric puckering around hexagon shape."], garment: {
    geometry: { angle: "Vertical straight band; hexagon endpoint points directly downward (180° from neckline).", height: "Neckline to upper abdomen, 40cm total. Hexagon endpoint begins ~37cm from neckline, ends at 40cm.", silhouette: "Straight vertical band with 6-sided hexagon endpoint at the base — not a triangle or diamond, exactly 6 edges forming a precise geometric closure.", proportions: "Width 4cm; length 40cm (neckline to upper abdomen). Hexagon endpoint width matches the 4cm top-edge width; endpoint depth (top to bottom vertex) ~2.5-3cm.", endpoint_shape: "Regular hexagon rotated 180° (inverted STOP-sign silhouette): flat horizontal top edge, 4 angled sides, sharp pointed vertex at bottom-center.", endpoint_reference: "Defining visual feature — must remain clearly visible and unmistakably 6-sided, not simplified to a triangle or point.", endpoint_construction: { top_edge: "Flat horizontal line, parallel to neckline, width matches the 4cm plaket body width — the hexagon's longest flat side.", bottom_vertex: "Single sharp pointed vertex at center-bottom; all 4 angled sides converge here (not rounded, not flattened).", upper_left_side: "Diagonal from top-left corner, descending 45° toward center-bottom.", lower_left_side: "Continues from upper-left diagonal, meeting the bottom vertex at 45°.", upper_right_side: "Mirror of upper-left: diagonal from top-right corner, descending 45° toward center-bottom.", lower_right_side: "Mirror of lower-left, meeting the bottom vertex at 45°." } },
    materials: { facing: "Cotton poplin or structured twill.", primary: "Firm structured cotton, matching body fabric.", interlining: "Medium-weight structured interfacing (Pellon Peltex equivalent) for geometric precision and point vertex support." },
    placement: { relation_to_body: "Sits absolutely flat, hexagon geometry maintained without drooping or distortion.", position_on_garment: "Centered on front opening. Hexagon endpoint sits perfectly centered horizontally." },
    stitching: { stitch_type: "Centerline vertical topstitch, full 40cm length. Double horizontal frame lines at top edge and ~37cm (hexagon top). Optional angled topstitches may emphasize the hexagon sides.", thread_color_rule: "Darker thread on light fabric for clear line definition, emphasizing hexagon precision.", visible_seam_treatment: "Topstitching is prominent design feature. Hexagon shape must be clearly visible and precise." },
    appearance: { visual_character: "Geometric precision — hexagon endpoint is a deliberate design feature, not an accidental shape.", surface_treatment: "Crisp, flat structured finish with blade-sharp edges — not rounded, not soft.", construction_visible: "Double parallel horizontal topstitching frames the top edge and near the endpoint. Vertical centerline topstitch runs the full length. 4 angled topstitches may frame the hexagon sides. All lines sharp and crisp." },
    construction: { facing_type: "Single-layer structured facing, hidden interior.", interlining: "Medium-weight structured interfacing (18-20gsm minimum) to maintain hexagon geometric precision. Especially critical at point vertex to prevent drooping.", pattern_type: "Structured plaket strip with geometric 6-sided hexagon endpoint cap.", seam_placement: "Centered on front opening. Hexagon endpoint centered horizontally (symmetrical left-right).", endpoint_construction_method: "Hexagon shape precision-cut during pattern layout; all 6 edges stitched for geometric accuracy. Interlining keeps the point vertex sharp, without drooping or rounding." },
  } }
)

// ---- plaket: Plaket Straight Formal ----
report(
  'Plaket Straight Formal (plaket)',
  { name: 'Plaket Straight Formal', category: 'plaket', negativeRules: ["Do not render plaket with wrinkles, creases, or fabric puckering.","Do not over-complicate endpoint—keep straight or gently rounded, no faceted geometry.","Do not blur or soften topstitch centerline—must be sharp and clearly visible.","Do not render plaket drooping, sagging, or losing structure.","Do not add decorative elements (buttons, embroidery, appliqué).","Do not render fraying, rough edges, or unfinished seams.","Do not distort width or length proportions.","Do not render excessive wrinkles in body around plaket—body may fold, but plaket area stays crisp."], garment: {
    geometry: { angle: "Vertical straight alignment, perpendicular to garment front plane.", height: "Neckline (base) to upper abdomen (termination). Total structured band coverage 40cm.", silhouette: "Straight vertical band with perpendicular or soft-rounded endpoint. Parallel edges maintained throughout length, no geometric complexity.", proportions: "Width: 4cm (compact, refined). Length: 40cm from neckline termination to upper abdomen." },
    materials: { facing: "Cotton poplin or structured cotton twill, weight-matched to interfacing.", primary: "Firm structured cotton, matching body fabric or light contrast (white on sky blue, etc.)", interlining: "Medium-weight structured interfacing (Pellon Peltex or equivalent) for geometric precision." },
    placement: { relation_to_body: "Sits absolutely flat against body surface. Crisp and structured appearance, formal wear standard.", position_on_garment: "Centered vertically on garment front opening. Plaket band runs symmetrically, bisecting front closure." },
    stitching: { stitch_type: "Single vertical centerline topstitch (0.5-1mm width) running full 40cm length. Optional: double horizontal frame lines at top (neckline level) and bottom (abdomen terminus), 2-3mm parallel gap.", thread_color_rule: "Darker thread (navy, charcoal) on light fabric (white, cream, pale blue) for sharp line definition. Match thread if monochromatic design intended.", visible_seam_treatment: "Topstitch is primary design feature—crisp, clean, double-lock stitching with no puckering or tension inconsistency." },
    appearance: { visual_character: "Minimal, elegant, refined geometric. Formal structured appearance emphasizing cleanliness and precision over decorative detail.", surface_treatment: "Ultra-crisp structured finish. Flat surface with sharp edge definition. Matte thread creates fine line contrast on light fabric.", construction_visible: "Single vertical centerline topstitch (prominent feature). Optional thin double-frame horizontal lines at neckline and abdomen terminus. All stitching lines sharp, crisp, clearly defined." },
    construction: { facing_type: "Single-layer structured facing, hidden on interior.", interlining: "Medium-weight structured interfacing (minimum 18-20gsm) for maintained crispness and blade-sharp edges.", pattern_type: "Straight body with perpendicular or gently-rounded endpoint (no faceted geometry).", seam_placement: "Centered on front opening, symmetrical left-right balance." },
  } },
  { name: 'Plaket Straight Formal', category: 'plaket', negativeRules: ["Do not render plaket with wrinkles, creases, or fabric puckering.","Do not over-complicate endpoint—keep straight or gently rounded, no faceted geometry.","Do not blur or soften topstitch centerline—must be sharp and clearly visible.","Do not render plaket drooping, sagging, or losing structure.","Do not add decorative elements (buttons, embroidery, appliqué).","Do not render fraying, rough edges, or unfinished seams.","Do not distort width or length proportions.","Do not render excessive wrinkles in body around plaket—body may fold, but plaket area stays crisp."], garment: {
    geometry: { angle: "Vertical straight alignment, perpendicular to garment front plane.", height: "Neckline (base) to upper abdomen (termination). Total structured band coverage 40cm.", silhouette: "Straight vertical band with perpendicular or soft-rounded endpoint. Parallel edges maintained throughout length, no geometric complexity.", proportions: "Width 4cm. Length 40cm, neckline to upper abdomen." },
    materials: { facing: "Cotton poplin or structured cotton twill, weight-matched to interfacing.", primary: "Firm structured cotton, matching body fabric or light contrast (white on sky blue, etc.)", interlining: "Medium-weight structured interfacing (Pellon Peltex or equivalent) for geometric precision." },
    placement: { relation_to_body: "Sits absolutely flat against body surface, crisp and structured.", position_on_garment: "Centered vertically on garment front opening. Plaket band runs symmetrically, bisecting front closure." },
    stitching: { stitch_type: "Single vertical centerline topstitch (0.5-1mm width) running full 40cm length. Optional: double horizontal frame lines at top (neckline level) and bottom (abdomen terminus), 2-3mm parallel gap.", thread_color_rule: "Darker thread (navy, charcoal) on light fabric (white, cream, pale blue) for sharp line definition. Match thread if monochromatic design intended.", visible_seam_treatment: "Topstitch is the primary design feature — clean double-lock stitching with no puckering or tension inconsistency." },
    appearance: { visual_character: "Minimal, geometric — emphasizes cleanliness and precision over decorative detail.", surface_treatment: "Crisp, flat structured finish with sharp edge definition. Matte thread creates fine line contrast on light fabric.", construction_visible: "Single vertical centerline topstitch. Optional thin double-frame horizontal lines at neckline and abdomen terminus. All stitching lines sharp and clearly defined." },
    construction: { facing_type: "Single-layer structured facing, hidden on interior.", interlining: "Medium-weight structured interfacing (minimum 18-20gsm) for maintained crispness and blade-sharp edges.", pattern_type: "Straight body with perpendicular or gently-rounded endpoint (no faceted geometry).", seam_placement: "Centered on front opening, symmetrical left-right balance." },
  } }
)

// ---- saku: Patch Pocket Topstitched Medium (no change — already maximally dense, snake_case spec values, zero prose in the 4 fields resolver.ts reads) ----
report(
  'Patch Pocket Topstitched Medium (saku)',
  { name: 'Patch Pocket', category: 'saku', negativeRules: [], garment: {
    geometry: { shape: "rectangle_rounded_corners", width_cm: 8.5, height_cm: 10.5, aspect_ratio: "vertical_emphasis_0.81", seam_allowance: "0.7cm_included", corner_radius_mm: 3 },
    placement: { anchor: "upper_body_front_panel", location: "chest_left_or_side", offset_from_armhole: "2.0cm" },
    stitching: { method: "topstitch", thread_type: "matching_or_subtle_contrast", line_quality: "even_tension_no_skips", stitch_pattern: "straight_parallel_to_edge", stitch_distance_mm: 2.5 },
    construction: { layers: "single_layer_tacked_at_base", tack_points: "top_corners_and_base_center", tack_thread: "matching_to_fabric", grain_direction: "vertical_aligned" },
  } },
  { name: 'Patch Pocket', category: 'saku', negativeRules: [], garment: {
    geometry: { shape: "rectangle_rounded_corners", width_cm: 8.5, height_cm: 10.5, aspect_ratio: "vertical_emphasis_0.81", seam_allowance: "0.7cm_included", corner_radius_mm: 3 },
    placement: { anchor: "upper_body_front_panel", location: "chest_left_or_side", offset_from_armhole: "2.0cm" },
    stitching: { method: "topstitch", thread_type: "matching_or_subtle_contrast", line_quality: "even_tension_no_skips", stitch_pattern: "straight_parallel_to_edge", stitch_distance_mm: 2.5 },
    construction: { layers: "single_layer_tacked_at_base", tack_points: "top_corners_and_base_center", tack_thread: "matching_to_fabric", grain_direction: "vertical_aligned" },
  } }
)

// ===========================================================================
// SQL generation — surgical jsonb_set per changed path only, so every other
// key (status, version, metadata, unchanged fields) is left byte-identical.
// ===========================================================================
console.log(`\n\n${'#'.repeat(70)}\n# SQL UPDATE STATEMENTS\n${'#'.repeat(70)}`)

emitUpdate('8fd8a98d-4ce3-4ad7-938e-fe2d06656f81', 'Black', [
  { path: ['description'], value: "Deep black tone, near-zero reflectivity, undertone neutral-cool. Absorbs light completely, matte finish with minimal sheen. No color bleed, no graying — consistent darkness across all fabric surfaces. Light-absorptive: reveals texture through shadow only, creating strong contrast and sharp definition against lighter elements. Color code #1A1A1A (pure black)." },
])

emitUpdate('c1d30b1e-728f-4374-bfa7-171d9fc99c1f', 'Maroon', [
  { path: ['description'], value: "Deep maroon tone, burgundy-red with brown undertone. Rich saturation, moderate light-absorptive quality — not bright red. Matte finish, consistent color across fabric surfaces. Lighting interaction reveals warm red undertone through reflection and shadow. Color code #800020 (classic maroon)." },
])

emitUpdate('404b41ce-98cd-4c2b-8b79-6f36eac69e98', 'Navy', [
  { path: ['description'], value: "Deep navy blue tone, rich saturation. Undertone cool with slight red edge — not pure blue, slight burgundy depth. Light-absorptive similar to black but retains blue identity, revealing subtle blue undertone in shadows; never renders as bright blue. Matte finish, consistent color across fabric, no fading or graying. Color code #000080 (true navy)." },
])

emitUpdate('69a28688-4326-4d6c-9c0e-6f2706f78bc9', 'Putih Clean', [
  { path: ['description'], value: "Pure white tone, high saturation and brightness, undertone neutral-cool. Reflective, non-absorptive surface — reflects ambient light evenly and uniformly, without yellowing, graying, or tint. Consistent matte finish when rendered on fabric. No warmth, no darkness — maximum visibility and contrast, crisp edges against darker components. Color code #FFFFFF (RGB 255,255,255)." },
])

emitUpdate('71f730db-e833-4fe0-884f-61c5d8f7175a', 'Basim Collar', [
  { path: ['appearance'], value: "Clean geometry, minimal detail, smooth surface, no texture manipulation" },
])

emitUpdate('45b09ccf-8e2c-4a08-aa3d-0745c697c793', 'Sudas Cuff', [
  { path: ['appearance', 'visual_character'], value: "Simple formal cuff, minimal detail, functional closure" },
  { path: ['appearance', 'surface_treatment'], value: "Flat, crisp, pressed finish; smooth surface" },
])

emitUpdate('976794cd-3a4a-4d16-9e02-9efe0eda7699', 'Lorenzo Premium Gold Class', [
  { path: ['stitching', 'visible_seam_treatment'], value: "Jahitan visible dan prominent di surface" },
  { path: ['appearance', 'visual_character'], value: "Wool-blend formal wear" },
  { path: ['appearance', 'surface_treatment'], value: "Matte finish dengan micro-dimensional texture, smooth, tidak flat, subtle sheen response terhadap cahaya" },
  { path: ['appearance', 'construction_visible'], value: "Jahitan jelas terlihat di surface, seam lines crisp dan clean, topstitching precise" },
])

emitUpdate('3ea66afd-30e0-4bf6-9411-14defab8e9be', 'Saudi Modern', [
  { path: ['appearance', 'overall_shape'], value: "Minimal, clean." },
  { path: ['appearance', 'design_language'], value: "Modern Islamic menswear." },
  { path: ['stitching', 'overall_finish'], value: "Clean tailoring." },
  { path: ['materials', 'note'], value: "Base fabric defined separately by the selected bahan (material) item — not by Model Thobe." },
])

emitUpdate('10eb5b65-18f0-4f7d-9642-6b48d50d3e46', 'Plaket Hexagonal', [
  { path: ['geometry', 'angle'], value: "Vertical straight band; hexagon endpoint points directly downward (180° from neckline)." },
  { path: ['geometry', 'height'], value: "Neckline to upper abdomen, 40cm total. Hexagon endpoint begins ~37cm from neckline, ends at 40cm." },
  { path: ['geometry', 'silhouette'], value: "Straight vertical band with 6-sided hexagon endpoint at the base — not a triangle or diamond, exactly 6 edges forming a precise geometric closure." },
  { path: ['geometry', 'proportions'], value: "Width 4cm; length 40cm (neckline to upper abdomen). Hexagon endpoint width matches the 4cm top-edge width; endpoint depth (top to bottom vertex) ~2.5-3cm." },
  { path: ['geometry', 'endpoint_shape'], value: "Regular hexagon rotated 180° (inverted STOP-sign silhouette): flat horizontal top edge, 4 angled sides, sharp pointed vertex at bottom-center." },
  { path: ['geometry', 'endpoint_reference'], value: "Defining visual feature — must remain clearly visible and unmistakably 6-sided, not simplified to a triangle or point." },
  { path: ['geometry', 'endpoint_construction', 'top_edge'], value: "Flat horizontal line, parallel to neckline, width matches the 4cm plaket body width — the hexagon's longest flat side." },
  { path: ['geometry', 'endpoint_construction', 'bottom_vertex'], value: "Single sharp pointed vertex at center-bottom; all 4 angled sides converge here (not rounded, not flattened)." },
  { path: ['geometry', 'endpoint_construction', 'upper_left_side'], value: "Diagonal from top-left corner, descending 45° toward center-bottom." },
  { path: ['geometry', 'endpoint_construction', 'lower_left_side'], value: "Continues from upper-left diagonal, meeting the bottom vertex at 45°." },
  { path: ['geometry', 'endpoint_construction', 'upper_right_side'], value: "Mirror of upper-left: diagonal from top-right corner, descending 45° toward center-bottom." },
  { path: ['geometry', 'endpoint_construction', 'lower_right_side'], value: "Mirror of lower-left, meeting the bottom vertex at 45°." },
  { path: ['placement', 'relation_to_body'], value: "Sits absolutely flat, hexagon geometry maintained without drooping or distortion." },
  { path: ['stitching', 'stitch_type'], value: "Centerline vertical topstitch, full 40cm length. Double horizontal frame lines at top edge and ~37cm (hexagon top). Optional angled topstitches may emphasize the hexagon sides." },
  { path: ['stitching', 'thread_color_rule'], value: "Darker thread on light fabric for clear line definition, emphasizing hexagon precision." },
  { path: ['appearance', 'visual_character'], value: "Geometric precision — hexagon endpoint is a deliberate design feature, not an accidental shape." },
  { path: ['appearance', 'surface_treatment'], value: "Crisp, flat structured finish with blade-sharp edges — not rounded, not soft." },
  { path: ['appearance', 'construction_visible'], value: "Double parallel horizontal topstitching frames the top edge and near the endpoint. Vertical centerline topstitch runs the full length. 4 angled topstitches may frame the hexagon sides. All lines sharp and crisp." },
  { path: ['construction', 'endpoint_construction_method'], value: "Hexagon shape precision-cut during pattern layout; all 6 edges stitched for geometric accuracy. Interlining keeps the point vertex sharp, without drooping or rounding." },
])

emitUpdate('e0396f35-ac22-4fee-920b-53868b2b4d4a', 'Plaket Straight Formal', [
  { path: ['geometry', 'proportions'], value: "Width 4cm. Length 40cm, neckline to upper abdomen." },
  { path: ['placement', 'relation_to_body'], value: "Sits absolutely flat against body surface, crisp and structured." },
  { path: ['stitching', 'visible_seam_treatment'], value: "Topstitch is the primary design feature — clean double-lock stitching with no puckering or tension inconsistency." },
  { path: ['appearance', 'visual_character'], value: "Minimal, geometric — emphasizes cleanliness and precision over decorative detail." },
  { path: ['appearance', 'surface_treatment'], value: "Crisp, flat structured finish with sharp edge definition. Matte thread creates fine line contrast on light fabric." },
  { path: ['appearance', 'construction_visible'], value: "Single vertical centerline topstitch. Optional thin double-frame horizontal lines at neckline and abdomen terminus. All stitching lines sharp and clearly defined." },
])

emitUpdate('2de82004-99a5-4e1e-a5e0-787c9cbac3a5', 'Patch Pocket Topstitched Medium', [])
