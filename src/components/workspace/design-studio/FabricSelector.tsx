'use client'

import type { MasterDataOption } from '@/lib/design/masterData'

interface FabricSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (fabric: string) => void
}

// The Stitch reference shows specific stock numbers ("Ready to produce 5
// Thobes", "2 THOBES LEFT") — this repo has no inventory table at all, so
// showing those exact figures would be permanent fake data. The card shell/
// layout is kept identical; the stock badge is an honest "not connected yet"
// placeholder, ready to wire to a real inventory source later. Options come
// from the 'bahan' master data category.
export function FabricSelector({ options, selected, onSelect }: FabricSelectorProps) {
  return (
    <div className="space-y-4">
      {options.map(option => {
        const active = selected === option.name
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.name)}
            className={`w-full flex items-center gap-4 p-4 bg-white border text-left transition-all ${
              active ? 'border-[#775a19]' : 'border-[#c4c7c7]/40'
            }`}
          >
            <div className="w-16 h-16 bg-[#1c1b1b] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white/40">texture</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-sans text-sm text-[#151c27]">{option.name}</h4>
                <span className="font-sans text-[10px] text-[#444748] uppercase whitespace-nowrap">
                  Stok belum terhubung
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
