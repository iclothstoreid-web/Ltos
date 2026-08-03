'use client'

import { useState } from 'react'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import type { PatternFormulation, StageRecord } from '@/lib/production/types'
import type { SpecSheetPaperSize } from '@/lib/production/specSheetPaper'
import { triggerSpecSheetPrint, generateSpecSheetPdfBlob, downloadPdfBlob } from '@/lib/production/specSheetPdf'
import { PatternReferenceCard } from './PatternReferenceCard'
import { ProductionSpecificationSheet } from './ProductionSpecificationSheet'
import { PrintDialog } from './PrintDialog'
import { WhatsAppShareButton } from './WhatsAppShareButton'

interface PatternFormulationCardProps {
  patternFormulation: PatternFormulation | null
  stageRecords: StageRecord[]
  orderNumber: string
  customerName: string | null
  design: DesignSelections | null
  customerPhotoUrl: string | null
}

// Sprint 01 Task 4/4.5 — operator's Formulasi Pola reference for the stages
// that don't already surface it inline in their own working panel
// (Cutting/Sewing/QC keep their embedded PatternReferenceCard, right where
// those operators are working — this fills the gap for Material Prep/
// Finishing/Packing/Shipping instead of duplicating it). Just a titled
// wrapper — PatternReferenceCard itself owns the click-to-fullscreen
// behavior, so both this card and the inline usages share the exact same
// expand/viewer mechanism instead of each wiring their own.
//
// Production Specification Sheet sprint — Print/Share WhatsApp added here per
// the master prompt ("Card Pattern Formulation / AVP Produksi"). Buttons are
// disabled until a formulation actually exists — printing/sharing an empty
// document isn't useful and there's nothing yet to be the "single source of
// truth" the sheet is meant to be.
export function PatternFormulationCard({
  patternFormulation,
  stageRecords,
  orderNumber,
  customerName,
  design,
  customerPhotoUrl,
}: PatternFormulationCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [size, setSize] = useState<SpecSheetPaperSize>('a4')
  const [exporting, setExporting] = useState<'print' | 'pdf' | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handlePrint() {
    setExporting('print')
    setError(null)
    triggerSpecSheetPrint(size, () => setExporting(null))
  }

  async function handleDownloadPdf() {
    setExporting('pdf')
    setError(null)
    try {
      const blob = await generateSpecSheetPdfBlob(size)
      downloadPdfBlob(blob, `Spesifikasi-Produksi-${orderNumber}.pdf`)
    } catch {
      setError('Gagal membuat PDF.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-caslon text-xl text-on-surface">Formulasi Pola</h3>
        {patternFormulation && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="material-symbols-outlined text-secondary/80 hover:text-on-surface transition-colors"
              aria-label="Print"
              title="Print"
            >
              print
            </button>
          </div>
        )}
      </div>

      <PatternReferenceCard patternFormulation={patternFormulation} stageRecords={stageRecords} />

      {patternFormulation && (
        <div className="mt-4">
          <WhatsAppShareButton orderNumber={orderNumber} size={size} />
        </div>
      )}

      <ProductionSpecificationSheet
        size={size}
        orderNumber={orderNumber}
        customerName={customerName}
        design={design}
        template={patternFormulation?.template ?? null}
        patternMeasurements={patternFormulation?.pattern_measurements ?? null}
        customerPhotoUrl={customerPhotoUrl}
      />

      {dialogOpen && (
        <PrintDialog
          size={size}
          onSizeChange={setSize}
          exporting={exporting}
          error={error}
          onPrint={handlePrint}
          onDownloadPdf={handleDownloadPdf}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  )
}
