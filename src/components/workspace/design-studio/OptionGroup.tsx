'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { EmptyOptionsState } from './EmptyOptionsState'
import { CatalogCard, CatalogGrid } from './CatalogCard'
import { NONE_SELECTION, isNoneSelection } from './types'

interface OptionGroupProps {
  // Optional: only needed when this OptionGroup is a sub-section inside an
  // Accordion that already covers two categories at once (Kerah & Manset,
  // Saku & Plaket, Bordir & Handmade Zig-Zag) — the Accordion's own title
  // already labels a single-category group (see ButtonSelector,
  // LookCuttingSelector, ModelSelector), so passing one there would just
  // duplicate it.
  label?: string
  options: MasterDataOption[]
  selected: string
  onSelect: (value: string) => void
  onViewSpec?: (option: MasterDataOption) => void
  // Support Optional Selection — only categories where skipping the
  // component is a genuine tailoring choice pass this (see OPTIONAL_FIELDS
  // in ./types.ts). Renders a real, always-selectable "(None)" card at the
  // top, never a placeholder — picking it resolves to `null` downstream
  // (see buildSpecification.ts's resolveOption), same as every other
  // skipped pilihan, with no dummy master data row involved.
  allowNone?: boolean
}

// Shared visual catalog grid, extracted so every accordion pilihan (and any
// pair shown side-by-side, like Kerah & Manset) reuses the same CatalogCard
// markup instead of duplicating it. Single Source of Truth for how a
// master-data option is rendered as something selectable.
export function OptionGroup({ label, options, selected, onSelect, onViewSpec, allowNone }: OptionGroupProps) {
  return (
    <div>
      {label && <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">{label}</p>}
      {options.length === 0 && !allowNone ? (
        <EmptyOptionsState label={label} />
      ) : (
        <div className="space-y-2">
          {options.length === 0 && <EmptyOptionsState label={label} />}
          <CatalogGrid>
            {allowNone && (
              <CatalogCard
                name="(None)"
                icon="block"
                selected={isNoneSelection(selected)}
                onSelect={() => onSelect(NONE_SELECTION)}
              />
            )}
            {options.map(option => (
              <CatalogCard
                key={option.id}
                name={option.name}
                description={option.selling_points[0] ?? null}
                imageUrl={option.photo_url}
                selected={selected === option.name}
                onSelect={() => onSelect(option.name)}
                onViewSpec={onViewSpec ? () => onViewSpec(option) : undefined}
              />
            ))}
          </CatalogGrid>
        </div>
      )}
    </div>
  )
}
