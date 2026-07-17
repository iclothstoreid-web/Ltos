'use client'

import type { MasterDataOption } from '@/lib/design/masterData'

interface ButtonSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (button: string) => void
}

// Options come from the 'aksesori' master data category — this is the
// "Kancing & Aksesori" pilihan (button/accessory style).
export function ButtonSelector({ options, selected, onSelect }: ButtonSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const active = selected === option.name
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.name)}
            className={`px-3 py-2 font-sans text-sm border transition-all ${
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
  )
}
