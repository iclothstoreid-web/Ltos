'use client'

import { SPEC_SHEET_PAPER_LABELS, type SpecSheetPaperSize } from '@/lib/production/specSheetPaper'

interface PrintDialogProps {
  size: SpecSheetPaperSize
  onSizeChange: (size: SpecSheetPaperSize) => void
  exporting: 'print' | 'pdf' | null
  error: string | null
  onPrint: () => void
  onDownloadPdf: () => void
  onClose: () => void
}

const SIZES: SpecSheetPaperSize[] = ['a4', 'a5', 'a6']

// Reusable size-picker + Print/PDF actions modal — Pattern Formulation is the
// first caller, but per the master prompt's "component dapat langsung
// digunakan kembali" requirement this takes no Pattern-Formulation-specific
// props, so QC/Delivery can reuse it later against their own print-area node.
export function PrintDialog({ size, onSizeChange, exporting, error, onPrint, onDownloadPdf, onClose }: PrintDialogProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/50">
          <p className="font-caslon text-lg text-on-surface">Cetak Spesifikasi Produksi</p>
          <button
            type="button"
            onClick={onClose}
            className="material-symbols-outlined text-secondary/80 hover:text-on-surface transition-colors"
            aria-label="Tutup"
          >
            close
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="font-hanken text-[10px] uppercase tracking-widest text-secondary mb-2">
              Ukuran Kertas
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSizeChange(s)}
                  className={`py-2 font-hanken text-sm font-semibold rounded-lg border transition-colors ${
                    size === s
                      ? 'bg-on-surface text-white border-on-surface'
                      : 'bg-transparent text-secondary border-outline-variant/60 hover:border-on-surface'
                  }`}
                >
                  {SPEC_SHEET_PAPER_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="font-hanken text-xs text-error">{error}</p>}

          <div className="space-y-2">
            <button
              type="button"
              onClick={onPrint}
              disabled={exporting !== null}
              className="w-full flex items-center justify-center gap-2 bg-on-surface text-white py-3
                         font-hanken text-sm font-semibold uppercase tracking-widest hover:bg-amber-mid
                         transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              {exporting === 'print' ? 'Menyiapkan...' : 'Cetak'}
            </button>
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={exporting !== null}
              className="w-full flex items-center justify-center gap-2 bg-transparent text-on-surface py-3
                         font-hanken text-sm font-semibold uppercase tracking-widest border border-outline-variant/60
                         hover:border-on-surface transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              {exporting === 'pdf' ? 'Membuat PDF...' : 'Unduh PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
