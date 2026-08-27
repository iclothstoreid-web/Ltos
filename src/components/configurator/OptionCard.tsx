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

// WCAG relative luminance — used to decide whether a colour swatch needs a
// visible outline (light swatches disappearing against the dark card) and
// which colour the selected-check contrasts against.
function isLightHex(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return false
  const n = parseInt(m[1], 16)
  const toLin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const lum = 0.2126 * toLin((n >> 16) & 255) + 0.7152 * toLin((n >> 8) & 255) + 0.0722 * toLin(n & 255)
  return lum > 0.6
}

// Sprint DS-UX — full-width card sized for the panel's 2-column grid
// (photo) / 3–4-column grid (swatch). Native <input type="radio"/"checkbox">
// under a styled <label> keeps tab order, arrow-key nav, Space/Enter
// toggling and aria-checked for free; the input is `sr-only` so it stays
// focusable and `focus-within` carries the visible ring.
//
// Colour swatch (Sprint DS-UX follow-up): the actual colour IS the visual —
// a solid `option.colorHex` fill, with the human-readable name below and no
// 3-letter code anywhere. Light colours get an inset outline so they don't
// vanish against the dark card; the selected check flips to a light glyph
// on light swatches so it stays visible.
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
  const hex = isSwatch ? option.colorHex : null
  const light = hex ? isLightHex(hex) : false

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
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-luxury-navy"
        {...(hex ? { style: { backgroundColor: hex } } : {})}
      >
        {option.photoUrl ? (
          <ConfiguratorThumb
            photoUrl={option.photoUrl}
            alt=""
            size={isSwatch ? 112 : 260}
            quality={isSwatch ? 62 : 70}
            className="h-full w-full object-cover"
          />
        ) : hex ? (
          // solid colour fill — inset outline keeps light swatches defined
          <span
            className={`absolute inset-0 rounded-[inherit] ${light ? 'ring-1 ring-inset ring-black/15' : 'ring-1 ring-inset ring-white/10'}`}
          />
        ) : isSwatch ? (
          // colour with no hex set yet in Owner OS
          <span className="font-luxury-sans text-lg text-luxury-taupe">—</span>
        ) : (
          <span className="px-1 text-center font-luxury-sans text-[11px] uppercase tracking-[0.08em] text-luxury-taupe">
            Tanpa Foto
          </span>
        )}

        {checked && (
          <span
            className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold shadow ${
              light ? 'bg-luxury-navy-deep text-luxury-gold' : 'bg-luxury-gold text-luxury-black'
            }`}
          >
            ✓
          </span>
        )}
      </span>

      <span
        className={`px-2 py-1.5 font-luxury-sans leading-tight ${
          isSwatch ? 'text-[11px]' : 'text-xs'
        } ${checked ? 'text-luxury-ivory' : 'text-luxury-taupe group-hover:text-luxury-ivory'} line-clamp-2`}
      >
        {option.name}
      </span>
    </label>
  )
})
