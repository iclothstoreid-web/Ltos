'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { EmptyOptionsState } from './EmptyOptionsState'
import { CatalogCard, CatalogGrid } from './CatalogCard'

interface ColorSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (color: string) => void
  onViewSpec: (option: MasterDataOption) => void
  // Color UI (Final UI & Prompt Adjustment, 2026-08-08) — Supplier Color
  // Code shown as the visible card label instead of the color's catalog
  // name, keyed by option.id. Display-only: `onSelect`/`selected` below are
  // still keyed by `option.name`, exactly as before this change — the value
  // the render pipeline ultimately receives is unchanged. Falls back to
  // `option.name` when no code is mapped for the current Fabric (e.g.
  // Material Color hasn't been configured yet for that pairing), so the
  // dropdown is never left with a blank label. Optional/defaults to `{}` so
  // any other caller of this component keeps working unchanged.
  colorCodeByOptionId?: Record<string, string>
}

// Options come from the 'warna_bahan' master data category; the swatch hex
// lives in each option's `metadata.hex` instead of a hardcoded name->hex
// map. Uses the same CatalogCard every other selector uses (Single Source
// of Truth) — a solid-color swatch fills the card's image area instead of
// a photo, since a hex color has no meaningful "picture" of its own.
export function ColorSelector({ options, selected, onSelect, onViewSpec, colorCodeByOptionId = {} }: ColorSelectorProps) {
  if (options.length === 0) {
    return <EmptyOptionsState label="Warna Bahan" />
  }

  return (
    <CatalogGrid>
      {options.map(option => (
        <CatalogCard
          key={option.id}
          name={colorCodeByOptionId[option.id] ?? option.name}
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
