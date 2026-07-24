'use client'

import type { PriceSnapshot } from '@/lib/designSpecification/types'
import type { MasterDataCategory } from '@/lib/design/masterData'
import { formatRupiah as rupiah } from '@/lib/format/money'

interface EstimasiHargaPanelProps {
  priceSnapshot: PriceSnapshot
}

// Mirrors DesignSummaryPanel's OPTION_ROWS labels (same right-hand sidebar,
// same vocabulary) — Plaket added since that panel omits it.
const CATEGORY_LABELS: Record<MasterDataCategory, string> = {
  model_thobe: 'Model',
  look_cutting: 'Potongan',
  bahan: 'Bahan',
  warna_bahan: 'Warna',
  kerah: 'Kerah',
  manset: 'Manset',
  plaket: 'Plaket',
  saku: 'Saku',
  aksesori: 'Kancing',
  bordir: 'Bordir',
  handmade_zigzag: 'Handmade Zig-Zag',
}

// Read-only display of the PriceSnapshot buildDesignSpecification() already
// computes (see DesignStudioWorkspace's liveSpecification) — never
// recalculates its own price, so it can never drift from what persist()
// saves as the actual Price Snapshot.
export function EstimasiHargaPanel({ priceSnapshot }: EstimasiHargaPanelProps) {
  return (
    <div className="p-6 border-b-[0.5px] border-[#c4c7c7]">
      <h3 className="font-sans text-sm text-[#151c27] uppercase tracking-[0.2em] mb-4">Estimasi Harga</h3>

      <div className="space-y-3">
        {priceSnapshot.lines.length === 0 && (
          <p className="font-sans text-xs text-[#444748] italic">Belum ada pilihan.</p>
        )}
        {priceSnapshot.lines.map(line => (
          <div key={line.category} className="flex justify-between items-start gap-3">
            <div>
              <p className="font-sans text-[10px] text-[#444748] uppercase tracking-wide">
                {CATEGORY_LABELS[line.category]}
              </p>
              <p className="font-sans text-sm text-[#151c27]">{line.optionName}</p>
            </div>
            <span className="font-sans text-sm text-[#151c27] whitespace-nowrap">{rupiah(line.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 mt-4 border-t-[0.5px] border-[#c4c7c7]">
        <span className="font-sans text-xs text-[#151c27] uppercase tracking-widest font-bold">
          Total Estimasi
        </span>
        <span className="font-sans text-base text-[#151c27] font-bold">{rupiah(priceSnapshot.total)}</span>
      </div>
    </div>
  )
}
