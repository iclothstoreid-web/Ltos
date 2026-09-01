'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { optionCardTagline, optionCardDescription } from '@/lib/design/masterData'
import { EmptyOptionsState } from './EmptyOptionsState'
import { CatalogCard, CatalogGrid, type CatalogCardAvailabilityTone } from './CatalogCard'
import { formatRupiah } from '@/lib/format/money'

interface MaterialStockInfo {
  available_stock: number
  min_stock: number
  unit: string
}

interface FabricSelectorProps {
  options: MasterDataOption[]
  selected: string
  materialStock: Record<string, MaterialStockInfo>
  onSelect: (fabric: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

// Inventory -> Fitter App (READ only): wired to real stock, matched by name
// against the Inventory workspace's `materials` table. An option with no
// matching material (not catalogued in Inventory yet) keeps the honest
// "Stok belum terhubung" placeholder instead of fabricating a number.
// Options come from the 'bahan' master data category.
//
// Out of Stock (available_stock <= 0) is disabled outright per the
// "Pindahkan Konsumsi Inventory ke Production" business rule — Design
// Studio must read Inventory's real stock and refuse a material that has
// none left, rather than let the Fitter pick it and find out at Persiapan
// Bahan. Low Stock (available_stock <= min_stock, but > 0) stays pickable,
// just flagged. Uses the same CatalogCard every other selector uses (Single
// Source of Truth), with the stock badge mapped into its
// availabilityLabel/availabilityTone slot.
export function FabricSelector({ options, selected, materialStock, onSelect, onViewSpec }: FabricSelectorProps) {
  if (options.length === 0) {
    return <EmptyOptionsState label="Bahan" />
  }

  return (
    <CatalogGrid>
      {options.map(option => {
        const stock = materialStock[option.name]
        const outOfStock = !!stock && stock.available_stock <= 0
        const lowStock = !!stock && !outOfStock && stock.available_stock <= stock.min_stock

        const availabilityLabel = stock
          ? outOfStock
            ? 'Stok Habis'
            : `${stock.available_stock.toLocaleString('id-ID')} ${stock.unit} tersedia${lowStock ? ' · Menipis' : ''}`
          : 'Stok belum terhubung'
        const availabilityTone: CatalogCardAvailabilityTone = !stock
          ? 'neutral'
          : outOfStock
            ? 'negative'
            : lowStock
              ? 'warning'
              : 'positive'

        return (
          <CatalogCard
            key={option.id}
            name={option.name}
            tagline={optionCardTagline(option)}
            description={optionCardDescription(option)}
            imageUrl={option.photo_url}
            icon="texture"
            selected={selected === option.name}
            disabled={outOfStock}
            disabledReason={outOfStock ? 'Stok habis' : undefined}
            availabilityLabel={availabilityLabel}
            availabilityTone={availabilityTone}
            priceLabel={option.price > 0 ? formatRupiah(option.price) : null}
            onSelect={() => onSelect(option.name)}
            onViewSpec={() => onViewSpec(option)}
          />
        )
      })}
    </CatalogGrid>
  )
}
