'use client'

import type { MasterDataOption } from '@/lib/design/masterData'

interface ColorSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (color: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

// Options come from the 'warna_bahan' master data category; the swatch hex
// lives in each option's `metadata.hex` instead of a hardcoded name->hex map.
export function ColorSelector({ options, selected, onSelect, onViewSpec }: ColorSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {options.map(option => {
        const active = selected === option.name
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.name)}
            className="group flex flex-col items-center gap-2"
          >
            <div
              className={`w-10 h-10 rounded-full border border-[#c4c7c7] group-hover:scale-110 transition-transform ring-2 ring-offset-2 ${
                active ? 'ring-[#775a19]' : 'ring-transparent'
              }`}
              style={{ backgroundColor: option.metadata.hex || '#c4c7c7' }}
            />
            <span className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-sans text-[#444748]">{option.name}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={e => {
                  e.stopPropagation()
                  onViewSpec(option)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                    onViewSpec(option)
                  }
                }}
                aria-label={`Lihat Spesifikasi ${option.name}`}
                className="material-symbols-outlined text-[12px] text-[#775a19]/60 hover:text-[#775a19]"
              >
                info
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
