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

// Native <input type="radio"/"checkbox"> under a styled <label> — tab order,
// arrow-key navigation within a radio group, Space/Enter toggling, and
// aria-checked all come from the browser for free instead of a hand-rolled
// listbox. The input is visually hidden (`sr-only`, not display:none) so it
// stays focusable; `focus-within` on the label carries the visible focus
// ring since the real focus target is invisible.
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
      className={`group relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-2 text-center transition focus-within:ring-2 focus-within:ring-luxury-gold/70 focus-within:ring-offset-2 focus-within:ring-offset-luxury-navy-deep ${
        checked ? 'border-luxury-gold bg-luxury-gold/10' : 'border-luxury-gold/15 hover:border-luxury-gold/40'
      } ${isSwatch ? 'w-16' : 'w-20'}`}
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
        className={`flex items-center justify-center overflow-hidden bg-luxury-navy ${
          isSwatch ? 'h-12 w-12 rounded-full' : 'h-14 w-14 rounded-md'
        }`}
      >
        {option.photoUrl ? (
          <ConfiguratorThumb
            photoUrl={option.photoUrl}
            alt=""
            size={isSwatch ? 48 : 64}
            quality={68}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-luxury-sans text-[9px] text-luxury-taupe">
            {isSwatch ? option.name.slice(0, 2).toUpperCase() : 'No Photo'}
          </span>
        )}
      </span>
      <span className="line-clamp-1 font-luxury-sans text-[10px] text-luxury-ivory">{option.name}</span>
      {checked && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-luxury-gold text-[9px] text-luxury-black"
        >
          ✓
        </span>
      )}
    </label>
  )
})
