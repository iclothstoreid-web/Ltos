'use client'

import type { DesignSpecification, DesignSpecOptionRef } from '@/lib/designSpecification/types'
import { EstimasiHargaPanel } from './EstimasiHargaPanel'

interface DesignSummaryPanelProps {
  specification: DesignSpecification
}

const OPTION_ROWS: Array<{ label: string; key: keyof DesignSpecification }> = [
  { label: 'Model', key: 'model' },
  { label: 'Bahan', key: 'fabric' },
  { label: 'Warna', key: 'color' },
  { label: 'Potongan', key: 'lookCutting' },
  { label: 'Kerah', key: 'collar' },
  { label: 'Manset', key: 'cuff' },
  { label: 'Saku', key: 'pocket' },
  { label: 'Kancing', key: 'button' },
  { label: 'Bordir', key: 'embroidery' },
  { label: 'Handmade Zig-Zag', key: 'handmadeZigzag' },
]

// Design Studio's second (and now only remaining) function alongside
// building the Design Specification itself — a clean, read-only recap.
// Sourced directly from the same DesignSpecification object DesignStudio-
// Workspace persists, so this is always in sync with what gets saved; it
// never has its own separate copy of the selections.
export function DesignSummaryPanel({ specification }: DesignSummaryPanelProps) {
  return (
    <aside className="w-[25%] h-full bg-white border-l-[0.5px] border-[#c4c7c7] flex flex-col">
      <EstimasiHargaPanel priceSnapshot={specification.priceSnapshot} />
      <div className="p-8 border-b-[0.5px] border-[#c4c7c7]">
        <h3 className="font-sans text-sm text-[#151c27] uppercase tracking-[0.2em]">Ringkasan Desain</h3>
      </div>
      <div className="flex-1 min-h-0 p-6 space-y-4 overflow-y-auto">
        {OPTION_ROWS.map(row => {
          const ref = specification[row.key] as DesignSpecOptionRef | null
          return (
            <div key={row.label} className="flex justify-between items-start gap-3 border-b border-[#c4c7c7]/20 pb-3">
              <span className="font-sans text-xs text-[#444748] uppercase tracking-wide whitespace-nowrap">
                {row.label}
              </span>
              <span className="font-sans text-sm text-[#151c27] text-right">{ref?.name ?? '—'}</span>
            </div>
          )
        })}

        <div className="flex justify-between items-start gap-3 border-b border-[#c4c7c7]/20 pb-3">
          <span className="font-sans text-xs text-[#444748] uppercase tracking-wide whitespace-nowrap">
            Kecepatan Produksi
          </span>
          <span className="font-sans text-sm text-[#151c27] text-right">
            {specification.estimatedProductionSpeed || '—'}
          </span>
        </div>

        <div className="pt-1">
          <span className="font-sans text-xs text-[#444748] uppercase tracking-wide block mb-2">Catatan Desain</span>
          <p className="font-sans text-sm text-[#151c27] leading-relaxed whitespace-pre-wrap">
            {specification.notes || 'Belum ada catatan.'}
          </p>
        </div>
      </div>
    </aside>
  )
}
