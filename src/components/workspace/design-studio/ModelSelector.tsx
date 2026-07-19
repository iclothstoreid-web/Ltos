'use client'

import type { MasterDataOption } from '@/lib/design/masterData'

interface ModelSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (model: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

// The Stitch reference uses hotlinked photo thumbnails per model — replaced
// with a neutral icon swatch (same rationale as Check-In/Measurement: no
// third-party demo image URLs embedded in a real repo). Options come from
// the 'model_thobe' master data category, not a hardcoded list.
export function ModelSelector({ options, selected, onSelect, onViewSpec }: ModelSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map(option => {
        const active = selected === option.name
        return (
          <label key={option.id} className="relative cursor-pointer group">
            <input
              type="radio"
              name="model"
              checked={active}
              onChange={() => onSelect(option.name)}
              className="peer hidden"
            />
            <div
              className={`border-[0.5px] p-2 transition-all ${
                active ? 'border-[#775a19] bg-[#775a19]/5' : 'border-[#c4c7c7]'
              }`}
            >
              <div className="h-40 bg-[#dce2f3] mb-2 flex items-center justify-center">
                {option.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
                  <img src={option.photo_url} alt={option.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-[#775a19]/40 group-hover:text-[#775a19]/70 transition-colors">
                    checkroom
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="font-sans text-sm block text-center text-[#151c27]">{option.name}</span>
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    onViewSpec(option)
                  }}
                  aria-label={`Lihat Spesifikasi ${option.name}`}
                  className="material-symbols-outlined text-[14px] text-[#775a19]/60 hover:text-[#775a19]"
                >
                  info
                </button>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
