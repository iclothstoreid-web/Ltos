'use client'

import type { DesignSelections } from './types'

interface OrderSummaryPanelProps {
  selections: DesignSelections
  chest: number | null
  waist: number | null
}

export function OrderSummaryPanel({ selections, chest, waist }: OrderSummaryPanelProps) {
  const ratio = chest && waist ? Math.round((chest / waist) * 100) / 100 : null

  return (
    <aside className="w-[25%] h-full bg-white border-l-[0.5px] border-[#c4c7c7] flex flex-col">
      <div className="p-8 border-b-[0.5px] border-[#c4c7c7]">
        <h3 className="font-sans text-sm text-[#151c27] uppercase tracking-[0.2em]">Live Summary</h3>
      </div>
      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        <section className="space-y-4">
          <span className="text-xs text-[#444748] font-sans uppercase">Selected Model</span>
          <div className="p-3 bg-[#f9f9ff] border border-[#c4c7c7]/30">
            <p className="font-sans text-sm text-[#151c27]">{selections.model}</p>
            <p className="text-xs text-[#444748] mt-1">
              {selections.fabric} · {selections.color}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="font-sans text-xs text-[#444748] uppercase">Production Metrics</h4>
          {/* No fabric-usage/complexity calculator exists in this repo —
              Stitch's specific figures ("3.45m est.", "Bespoke I") would be
              permanent fake data, so this shows an honest not-yet-available
              placeholder in the same card layout. */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#f0f3ff] border border-[#c4c7c7]/20">
              <span className="text-[10px] text-[#444748] uppercase">Usage</span>
              <p className="font-sans text-sm text-[#151c27]">Belum dihitung</p>
            </div>
            <div className="p-3 bg-[#f0f3ff] border border-[#c4c7c7]/20">
              <span className="text-[10px] text-[#444748] uppercase">Complexity</span>
              <p className="font-sans text-sm text-[#151c27]">Belum dihitung</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="font-sans text-xs text-[#444748] uppercase">Inventory Status</h4>
          {/* No inventory table exists — kept as a clearly-labeled
              not-connected state, ready to wire to real stock data later. */}
          <div className="p-4 bg-[#f0f3ff] border border-dashed border-[#c4c7c7] text-center">
            <p className="text-xs text-[#444748]">Inventory belum terhubung</p>
          </div>
        </section>

        <div className="p-4 bg-[#1b1c1a] text-[#c7c7c3] rounded-sm">
          <div className="flex gap-2 mb-2">
            <span className="material-symbols-outlined text-sm">info</span>
            <span className="font-sans text-xs uppercase tracking-wider">Artisan Note</span>
          </div>
          <p className="text-[11px] leading-relaxed italic">
            {ratio
              ? `The '${selections.model}' silhouette features a tapered shoulder profile. Recommended for the customer's current chest-to-waist ratio (${ratio}).`
              : `The '${selections.model}' silhouette features a tapered shoulder profile. Chest-to-waist ratio needs a saved measurement to compute.`}
          </p>
        </div>
      </div>
    </aside>
  )
}
