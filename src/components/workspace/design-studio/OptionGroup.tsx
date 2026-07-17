'use client'

import type { MasterDataOption } from '@/lib/design/masterData'

interface OptionGroupProps {
  label: string
  options: MasterDataOption[]
  selected: string
  onSelect: (value: string) => void
}

// Shared pill-button group, extracted so any accordion that shows two
// side-by-side pilihan (Kerah & Manset, Saku & Plaket, ...) can reuse the
// same markup instead of duplicating it per pair.
export function OptionGroup({ label, options, selected, onSelect }: OptionGroupProps) {
  return (
    <div>
      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = selected === option.name
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.name)}
              className={`px-3 py-2 font-sans text-sm text-left border transition-all ${
                active
                  ? 'border-[#775a19] bg-[#775a19]/5 text-[#151c27]'
                  : 'border-[#c4c7c7]/60 text-[#444748] hover:border-[#775a19]/40'
              }`}
            >
              {option.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
