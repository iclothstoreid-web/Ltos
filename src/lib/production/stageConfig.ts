import type { PatternTemplate, ProductionStage, StageRecord } from './types'

// Locked order per the master prompt. Index in this array is what
// `complete_stage` uses server-side to decide the next stage too — keep in
// sync with the `v_stage_order` array in the `complete_stage` SQL function.
export const STAGE_ORDER: ProductionStage[] = [
  'material_prep',
  'pattern_formulation',
  'cutting',
  'sewing',
  'qc',
  'finishing',
  'packing',
  'shipping',
]

export const STAGE_LABELS: Record<ProductionStage, string> = {
  material_prep: 'Persiapan Material',
  pattern_formulation: 'Formulasi Pola',
  cutting: 'Pemotongan Kain',
  sewing: 'Penjahitan',
  qc: 'Pemeriksaan Kualitas',
  finishing: 'Finishing',
  packing: 'Packing',
  shipping: 'Pengiriman',
}

// Every stage captures a single evidence photo on completion, including
// Formulasi Pola (its foto documents the finished pattern formulation work).
export const STAGES_WITH_EVIDENCE: ProductionStage[] = [
  'material_prep',
  'pattern_formulation',
  'cutting',
  'sewing',
  'qc',
  'finishing',
  'packing',
  'shipping',
]

// Formulasi Pola layers an extra work-content panel (template + editable
// pattern sizes, shown before the completion scan) on top of the shared
// operator/division/evidence/checklist/approve-return shell every stage uses.
// Pemotongan Kain, Penjahitan, and Pemeriksaan Kualitas layer a read-only
// reference panel (the saved Formulasi Pola output, plus confirmation of the
// immediately preceding stage) the same way, but without an edit/save action.
export const STAGES_WITH_CUSTOM_PANEL: ProductionStage[] = [
  'pattern_formulation',
  'cutting',
  'sewing',
  'qc',
  'finishing',
  'packing',
  'shipping',
]

// QC's final verification gate, shown after the completion scan — per the
// master prompt's own 5-point checklist for Pemeriksaan Kualitas.
export const QC_CHECKLIST_ITEMS = [
  'Ukuran sesuai formulasi',
  'Jahitan sesuai standar',
  'Tidak ada cacat kain',
  'Aksesori lengkap',
  'Siap masuk Finishing',
]

export const NON_QC_CHECKLIST_ITEM = 'Pekerjaan tahap ini selesai sesuai standar'

// Sourced from the Persiapan Material Stitch export — concrete content the
// master prompt itself left unspecified for this stage.
export const MATERIAL_PREP_CHECKLIST_ITEMS = [
  'Warna kain sesuai pesanan',
  'Tidak ada cacat pada serat/warna',
  'Ukuran panjang/lebar mencukupi',
  'Aksesori (Kancing, Label, Benang) Lengkap',
]

// Formulasi Pola's final verification gate, shown after the completion scan
// — focused on formulation completeness, consistency with body measurements,
// and readiness to hand off to Pemotongan Kain.
export const PATTERN_FORMULATION_CHECKLIST_ITEMS = [
  'Seluruh 12 ukuran pola telah diformulasikan',
  'Ukuran pola telah dibandingkan dan konsisten dengan ukuran tubuh customer',
  'Template ukuran yang dipilih sudah sesuai preferensi customer',
  'Catatan formulator sudah diperiksa dan lengkap',
  'Data ukuran pola siap diserahkan ke tahap Pemotongan Kain',
]

// Pemotongan Kain's final verification gate, shown after the completion
// scan — sourced from the master prompt's own example list.
export const CUTTING_CHECKLIST_ITEMS = [
  'Pola sesuai formulasi',
  'Arah serat kain sesuai',
  'Seluruh panel kain lengkap',
  'Tidak ada kesalahan potong',
  'Siap masuk Penjahitan',
]

// Penjahitan's final verification gate, shown after the completion scan —
// sourced from the master prompt's own example list.
export const SEWING_CHECKLIST_ITEMS = [
  'Seluruh panel telah dijahit',
  'Jahitan sesuai standar',
  'Tidak ada jahitan terlewat',
  'Posisi label benar',
  'Produk siap masuk Pemeriksaan Kualitas',
]

// Finishing's final verification gate, shown after the completion scan —
// per the master prompt's own 5-point checklist for Finishing.
export const FINISHING_CHECKLIST_ITEMS = [
  'Produk bersih',
  'Benang sisa sudah dirapikan',
  'Penyetrikaan selesai',
  'Label terpasang dengan benar',
  'Siap masuk Packing',
]

// Packing's final verification gate, shown after the completion scan — per
// the master prompt's own 5-point checklist for Packing.
export const PACKING_CHECKLIST_ITEMS = [
  'Produk sudah dilipat dengan benar',
  'Kemasan sesuai standar',
  'Label pengiriman sudah benar',
  'Kelengkapan produk sudah diperiksa',
  'Siap masuk Pengiriman',
]

// Pengiriman's final verification gate, shown after the completion scan —
// per the master prompt's own 5-point checklist for Pengiriman. This is the
// last stage: "Order selesai" replaces the usual "Siap masuk <next stage>".
export const SHIPPING_CHECKLIST_ITEMS = [
  'Produk sudah dikirim',
  'Data penerima sudah sesuai',
  'Kemasan diterima kurir',
  'Bukti pengiriman sudah diunggah',
  'Order selesai',
]

export function checklistItemsForStage(stage: ProductionStage): string[] {
  if (stage === 'qc') return QC_CHECKLIST_ITEMS
  if (stage === 'material_prep') return MATERIAL_PREP_CHECKLIST_ITEMS
  if (stage === 'pattern_formulation') return PATTERN_FORMULATION_CHECKLIST_ITEMS
  if (stage === 'cutting') return CUTTING_CHECKLIST_ITEMS
  if (stage === 'sewing') return SEWING_CHECKLIST_ITEMS
  if (stage === 'finishing') return FINISHING_CHECKLIST_ITEMS
  if (stage === 'packing') return PACKING_CHECKLIST_ITEMS
  if (stage === 'shipping') return SHIPPING_CHECKLIST_ITEMS
  return [NON_QC_CHECKLIST_ITEM]
}

// "Pilih Divisi" is a generic step in every stage's flow with no fixed list
// given in the brief — defaults to the workshop's own department names
// (the 8 stage labels), pre-selected to the current stage.
export const DIVISION_OPTIONS: string[] = STAGE_ORDER.map(stage => STAGE_LABELS[stage])

export const PATTERN_TEMPLATE_LABELS: Record<PatternTemplate, string> = {
  slim_fit: 'Slim Fit',
  standar: 'Standar',
  regular: 'Regular',
  custom: 'Custom',
}

// Placeholder pending real per-template tailoring offsets (confirmed with
// the user): body measurements copy through unchanged as the pattern's
// starting point, directly editable per the brief's "Ukuran Pola boleh
// diedit langsung" rule.
export const ESTIMATED_LEAD_TIME_DAYS = 14

// Finds the record to act on next: latest attempt of the first stage (in
// locked order) that isn't completed yet. Returns null once all 8 stages
// are done, or if no stage records exist yet (never opened). Shared by the
// kiosk packet page and the staff-facing production overview list so both
// agree on what "current stage" means.
export function getCurrentStageRecord(stageRecords: StageRecord[]): StageRecord | null {
  for (const stage of STAGE_ORDER) {
    const records = stageRecords.filter(r => r.stage === stage)
    if (records.length === 0) return null
    const latest = [...records].sort((a, b) => b.attempt - a.attempt)[0]
    if (latest.status !== 'completed') return latest
  }
  return null
}
