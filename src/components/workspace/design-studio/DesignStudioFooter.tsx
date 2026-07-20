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
    <footer className="fixed bottom-0 left-0 right-0 lg:h-24 bg-[#151c27] text-white z-50 flex flex-wrap lg:flex-nowrap items-center px-4 sm:px-8 lg:px-16 py-3 lg:py-0 gap-4 lg:gap-8">
      <div className="flex-1 flex items-center gap-4 sm:gap-8 flex-wrap min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase text-[#858383] tracking-widest">Model</span>
          <span className="font-sans text-sm truncate">{selections.model}</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-white/20" />
        <div className="hidden sm:flex flex-col min-w-0">
          <span className="text-[10px] uppercase text-[#858383] tracking-widest">Bahan & Warna</span>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colorHex }} />
            <span className="font-sans text-sm truncate">
              {selections.fabric} · {selections.color}
            </span>
          </div>
        </div>
        <div className="hidden lg:block w-px h-8 bg-white/20" />
        <div className="hidden lg:flex flex-col">
          <span className="text-[10px] uppercase text-[#858383] tracking-widest">Estimasi Biaya</span>
          {/* No pricing/quotation calculator exists — an honest placeholder
              instead of Stitch's fixed "SAR 3,450.00" figure. */}
          <span className="font-sans text-sm text-[#e9c176]">Estimasi belum tersedia</span>
        </div>
      </div>

      <div className="w-full lg:w-auto flex gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="flex-1 lg:flex-none px-4 sm:px-8 py-3 lg:py-4 bg-[#1c1b1b] border border-white/20 text-white font-sans text-xs sm:text-sm
                     uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-40"
        >
          Simpan Cetak Biru
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={loading}
          className="flex-1 lg:flex-none px-4 sm:px-10 py-3 lg:py-4 bg-[#ffdea5] text-[#261900] font-sans text-xs sm:text-sm uppercase tracking-widest
                     flex items-center justify-center gap-2 sm:gap-3 hover:bg-[#e9c176] transition-colors group disabled:opacity-40 whitespace-nowrap"
        >
          {loading ? 'Menyimpan...' : 'Lanjutkan ke Tinjauan Konsultasi'}
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
            arrow_right_alt
          </span>
        </button>
      </div>
    </footer>
  )
}
