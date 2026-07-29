'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { EmptyOptionsState } from './EmptyOptionsState'
import { NONE_SELECTION, isNoneSelection } from './types'

interface OptionGroupProps {
  label: string
  options: MasterDataOption[]
  selected: string
  onSelect: (value: string) => void
  onViewSpec?: (option: MasterDataOption) => void
  // Support Optional Selection — only categories where skipping the
  // component is a genuine tailoring choice pass this (see OPTIONAL_FIELDS
  // in ./types.ts). Renders a real, always-selectable "(None)" pill at the
  // top, never a placeholder — picking it resolves to `null` downstream
  // (see buildSpecification.ts's resolveOption), same as every other
  // skipped pilihan, with no dummy master data row involved.
  allowNone?: boolean
}

// Shared pill-button group, extracted so any accordion that shows two
// side-by-side pilihan (Kerah & Manset, Saku & Plaket, ...) can reuse the
// same markup instead of duplicating it per pair.
export function OptionGroup({ label, options, selected, onSelect, onViewSpec, allowNone }: OptionGroupProps) {
  return (
    <div>
      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">{label}</p>
      {options.length === 0 && !allowNone ? (
        <EmptyOptionsState label={label} />
      ) : (
        <div className="space-y-2">
          {options.length === 0 && <EmptyOptionsState label={label} />}
          <div className="flex flex-wrap gap-2">
            {allowNone && (
              <button
                type="button"
                onClick={() => onSelect(NONE_SELECTION)}
                className={`px-3 py-2 font-sans text-sm text-left border transition-all ${
                  isNoneSelection(selected)
                    ? 'border-[#775a19] bg-[#775a19]/5 text-[#151c27]'
                    : 'border-[#c4c7c7]/60 text-[#444748] hover:border-[#775a19]/40'
                }`}
              >
                (None)
              </button>
            )}
            {options.map(option => {
              const active = selected === option.name
              return (
                <div key={option.id} className="relative">
                  <button
                    type="button"
                    onClick={() => onSelect(option.name)}
                    className={`px-3 py-2 font-sans text-sm text-left border transition-all ${
                      active
                        ? 'border-[#775a19] bg-[#775a19]/5 text-[#151c27]'
                        : 'border-[#c4c7c7]/60 text-[#444748] hover:border-[#775a19]/40'
                    } ${onViewSpec ? 'pr-7' : ''}`}
                  >
                    {option.name}
                  </button>
                  {onViewSpec && (
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
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
