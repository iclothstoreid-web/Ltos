'use client'

import type { DesignSelections } from './types'
import type { MasterDataOption } from '@/lib/design/masterData'

interface DesignStudioFooterProps {
  selections: DesignSelections
  colorOptions: MasterDataOption[]
  loading: boolean
  onSave: () => void
  onContinue: () => void
}

export function DesignStudioFooter({
  selections,
  colorOptions,
  loading,
  onSave,
  onContinue,
}: DesignStudioFooterProps) {
  const colorHex = colorOptions.find(c => c.name === selections.color)?.metadata.hex || '#c4c7c7'

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-[#151c27] text-white z-50 flex items-center px-16 gap-8">
      <div className="flex-1 flex items-center gap-8 flex-wrap">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-[#858383] tracking-widest">Model</span>
          <span className="font-sans text-sm">{selections.model}</span>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-[#858383] tracking-widest">Fabric & Color</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorHex }} />
            <span className="font-sans text-sm">
              {selections.fabric} · {selections.color}
            </span>
          </div>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-[#858383] tracking-widest">Est. Investment</span>
          {/* No pricing/quotation calculator exists — an honest placeholder
              instead of Stitch's fixed "SAR 3,450.00" figure. */}
          <span className="font-sans text-sm text-[#e9c176]">Estimasi belum tersedia</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="px-8 py-4 bg-[#1c1b1b] border border-white/20 text-white font-sans text-sm
                     uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-40"
        >
          Save Blueprint
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={loading}
          className="px-10 py-4 bg-[#ffdea5] text-[#261900] font-sans text-sm uppercase tracking-widest
                     flex items-center gap-3 hover:bg-[#e9c176] transition-colors group disabled:opacity-40"
        >
          {loading ? 'Menyimpan...' : 'Continue to Consultation Review'}
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
            arrow_right_alt
          </span>
        </button>
      </div>
    </footer>
  )
}
