'use client'

import { memo } from 'react'
import type { ConfiguratorOption } from '@/types/configurator'
import { ConfiguratorThumb } from './preview/ConfiguratorThumb'

interface OptionCardProps {
  option: ConfiguratorOption
  groupName: string
  inputType: 'radio' | 'checkbox'
  checked: boolean
  // Takes the option id back rather than a bare () => void (W2-5) — lets a
  // whole section share ONE useCallback-memoized handler instead of a new
  // inline closure per option per render, so React.memo on this component
  // actually prevents re-renders instead of being defeated by a
  // non-referentially-stable onChange prop every time.
  onChange: (id: string) => void
  variant?: 'photo' | 'swatch'
}

// Sprint DS-UX — full-width card sized for the panel's 2-column grid
// (photo) / 3–4-column grid (swatch), photo ~2× the old 56px thumbnail so
// models/collars/cuffs are actually comparable. Native
// <input type="radio"/"checkbox"> under a styled <label> keeps tab order,
// arrow-key nav, Space/Enter toggling and aria-checked for free; the input
// is `sr-only` (not display:none) so it stays focusable, and
// `focus-within` carries the visible ring.
export const OptionCard = memo(function OptionCard({
  option,
  groupName,
  inputType,
  checked,
  onChange,
  variant = 'photo',
}: OptionCardProps) {
  const inputId = `${groupName}-${option.id}`
  const isSwatch = variant === 'swatch'

  return (
    <label
      htmlFor={inputId}
      className={`group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition focus-within:ring-2 focus-within:ring-luxury-gold/70 focus-within:ring-offset-2 focus-within:ring-offset-luxury-navy-deep ${
        checked
          ? 'border-luxury-gold bg-luxury-gold/10 ring-1 ring-luxury-gold'
          : 'border-luxury-gold/15 hover:border-luxury-gold/45 hover:bg-luxury-gold/[0.04]'
      }`}
    >
      <input
        id={inputId}
        type={inputType}
        name={inputType === 'radio' ? groupName : undefined}
        checked={checked}
        onChange={() => onChange(option.id)}
        className="sr-only"
        aria-label={option.name}
      />

      <span
        aria-hidden="true"
        className={`relative flex items-center justify-center overflow-hidden bg-luxury-navy ${
          isSwatch ? 'aspect-square' : 'aspect-square'
        }`}
      >
        {option.photoUrl ? (
          <ConfiguratorThumb
            photoUrl={option.photoUrl}
            alt=""
            size={isSwatch ? 112 : 260}
            quality={isSwatch ? 62 : 70}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="px-1 text-center font-luxury-sans text-[11px] uppercase tracking-[0.08em] text-luxury-taupe">
            {isSwatch ? option.name.slice(0, 3) : 'Tanpa Foto'}
          </span>
        )}

        {checked && (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-luxury-gold text-[11px] font-semibold text-luxury-black shadow"
          >
            ✓
          </span>
        )}
      </span>

      <span
        className={`px-2 py-1.5 font-luxury-sans leading-tight ${
          isSwatch ? 'text-[10px]' : 'text-xs'
        } ${checked ? 'text-luxury-ivory' : 'text-luxury-taupe group-hover:text-luxury-ivory'} line-clamp-2`}
      >
        {option.name}
      </span>
    </label>
  )
})
