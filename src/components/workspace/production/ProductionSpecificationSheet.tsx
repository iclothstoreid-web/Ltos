import type { DesignSelections } from '@/components/workspace/design-studio/types'
import type { MeasurementFields, MeasurementKey } from '@/components/workspace/measurement/types'
import type { PatternTemplate } from '@/lib/production/types'
import { FIELD_LABELS } from './PatternFormulationPanel'
import { PATTERN_TEMPLATE_LABELS } from '@/lib/production/stageConfig'
import { SPEC_SHEET_PAPER_WIDTH_PX, type SpecSheetPaperSize } from '@/lib/production/specSheetPaper'

interface ProductionSpecificationSheetProps {
  size: SpecSheetPaperSize
  orderNumber: string
  customerName: string | null
  design: DesignSelections | null
  template: PatternTemplate | null
  patternMeasurements: MeasurementFields | null
  customerPhotoUrl: string | null
}

// The Production Specification Sheet — single source of truth document for
// Cutting/Sewing/QC, combining Fitter's design choices (packet.design) with
// Formulator's FINAL pattern measurements (packet.pattern_formulation). Same
// off-screen-node-shared-by-print-and-PDF pattern as EstimatePrintView: one
// DOM node, isolated by #production-spec-sheet-print-area in globals.css,
// captured by html2canvas for both "Unduh PDF" and "Bagikan WhatsApp", and
// pulled on-screen by the same CSS rule when window.print() fires. No AI
// Render section — that pipeline doesn't exist yet anywhere in the app
// (confirmed placeholder in MediaProduksiCard), so it's omitted rather than
// shown as broken/fake.
export function ProductionSpecificationSheet({
  size,
  orderNumber,
  customerName,
  design,
  template,
  patternMeasurements,
  customerPhotoUrl,
}: ProductionSpecificationSheetProps) {
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const width = SPEC_SHEET_PAPER_WIDTH_PX[size]

  const designRows: Array<[string, string]> = design
    ? [
        ['Model Baju', design.model],
        ['Model Kerah', design.collar],
        ['Model Saku', design.pocket],
        ['Model Placket', design.plaket],
        ['Model Tangan', design.cuff],
      ].filter(([, value]) => Boolean(value)) as Array<[string, string]>
    : []

  return (
    <div
      id="production-spec-sheet-print-area"
      style={{ width }}
      className="fixed top-0 -left-[9999px] bg-white text-on-surface p-10 font-sans"
    >
      <div className="flex items-center justify-between pb-5 border-b-2 border-on-surface">
        <div>
          <p className="font-serif text-xl tracking-tight">LOCAL TAILOR</p>
          <p className="text-[9px] uppercase tracking-[0.25em] text-secondary mt-1">
            Production Specification Sheet
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest text-secondary">Nomor Order</p>
          <p className="text-sm font-medium">{orderNumber}</p>
          <p className="text-[9px] uppercase tracking-widest text-secondary mt-2">Tanggal Produksi</p>
          <p className="text-sm font-medium">{today}</p>
        </div>
      </div>

      <div className="mt-5 mb-7">
        <p className="text-[9px] uppercase tracking-widest text-secondary">Nama Customer</p>
        <p className="text-xl font-serif mt-1">{customerName || '—'}</p>
      </div>

      {designRows.length > 0 && (
        <div className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3 pb-2 border-b border-on-surface">
            Design Specification
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {designRows.map(([label, value]) => (
              <div key={label}>
                <p className="text-[9px] uppercase tracking-widest text-secondary">{label}</p>
                <p className="text-sm font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3 pb-2 border-b border-on-surface">
          Final Production Measurement
        </p>
        {!patternMeasurements ? (
          <p className="text-sm text-secondary">Belum ada data formulasi pola.</p>
        ) : (
          <>
            {template && (
              <p className="text-sm mb-3">
                Template: <strong>{PATTERN_TEMPLATE_LABELS[template]}</strong>
              </p>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {(Object.keys(FIELD_LABELS) as Array<MeasurementKey>).map(key => (
                <div key={key} className="flex items-baseline justify-between border-b border-outline-variant pb-1">
                  <span className="text-xs text-secondary">{FIELD_LABELS[key]}</span>
                  <span className="text-sm font-bold">{patternMeasurements[key] || '—'} cm</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {customerPhotoUrl && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3 pb-2 border-b border-on-surface">
            Reference Images
          </p>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-secondary mb-2">Foto Customer</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- captured
                by html2canvas into a static PNG, next/image's runtime
                optimization doesn't apply here */}
            <img
              src={customerPhotoUrl}
              alt="Foto Customer"
              className="w-40 h-40 object-cover rounded border border-outline-variant"
              crossOrigin="anonymous"
            />
          </div>
        </div>
      )}
    </div>
  )
}
