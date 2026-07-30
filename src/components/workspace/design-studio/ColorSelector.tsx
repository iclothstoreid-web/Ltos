'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { EmptyOptionsState } from './EmptyOptionsState'
import { CatalogCard, CatalogGrid } from './CatalogCard'

interface ColorSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (color: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

// Options come from the 'warna_bahan' master data category; the swatch hex
// lives in each option's `metadata.hex` instead of a hardcoded name->hex
// map. Uses the same CatalogCard every other selector uses (Single Source
// of Truth) — a solid-color swatch fills the card's image area instead of
// a photo, since a hex color has no meaningful "picture" of its own.
export function ColorSelector({ options, selected, onSelect, onViewSpec }: ColorSelectorProps) {
  if (options.length === 0) {
    return <EmptyOptionsState label="Warna Bahan" />
  }

  return (
    <CatalogGrid>
      {options.map(option => (
        <CatalogCard
          key={option.id}
          name={option.name}
          description={option.selling_points[0] ?? null}
          swatchColor={option.metadata.hex || '#c4c7c7'}
          selected={selected === option.name}
          onSelect={() => onSelect(option.name)}
          onViewSpec={() => onViewSpec(option)}
        />
      ))}
    </CatalogGrid>
  )
}
