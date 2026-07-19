'use client'

import type { MasterDataOption } from '@/lib/design/masterData'

interface LookCuttingSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (value: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

// Own panel per the brief ("Look Cutting menjadi bagian dari Design
// Selection... letakkan sebagai panel tersendiri"). Options come from the
// 'look_cutting' master data category (default seed: Slim/Standard/Regular
// Fit) — this choice rides along in the Order snapshot as a reference for
// Production's Formulasi Pola stage, without altering that stage itself.
export function LookCuttingSelector({ options, selected, onSelect, onViewSpec }: LookCuttingSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const active = selected === option.name
        return (
          <div key={option.id} className="relative">
            <button
              type="button"
              onClick={() => onSelect(option.name)}
              className={`px-3 py-2 pr-7 font-sans text-sm border transition-all ${
                active
                  ? 'border-[#775a19] bg-[#775a19]/5 text-[#151c27]'
                  : 'border-[#c4c7c7]/60 text-[#444748] hover:border-[#775a19]/40'
              }`}
            >
              {option.name}
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onViewSpec(option)
              }}
              aria-label={`Lihat Spesifikasi ${option.name}`}
              className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-[#775a19]/60 hover:text-[#775a19]"
            >
              info
            </button>
          </div>
        )
      })}
    </div>
  )
}
