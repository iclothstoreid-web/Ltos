'use client'

import type { MasterDataOption } from '@/lib/design/masterData'

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

// Inventory -> Fitter App (READ only): now wired to real stock, matched by
// name against the Inventory workspace's `materials` table. An option with
// no matching material (not catalogued in Inventory yet) keeps the honest
// "Stok belum terhubung" placeholder instead of fabricating a number.
// Options come from the 'bahan' master data category.
export function FabricSelector({ options, selected, materialStock, onSelect, onViewSpec }: FabricSelectorProps) {
  return (
    <div className="space-y-4">
      {options.map(option => {
        const active = selected === option.name
        const stock = materialStock[option.name]
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.name)}
            className={`w-full flex items-center gap-4 p-4 bg-white border text-left transition-all ${
              active ? 'border-[#775a19]' : 'border-[#c4c7c7]/40'
            }`}
          >
            <div className="w-16 h-16 bg-[#1c1b1b] flex items-center justify-center shrink-0 overflow-hidden">
              {option.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
                <img src={option.photo_url} alt={option.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-white/40">texture</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-1">
                  <h4 className="font-sans text-sm text-[#151c27]">{option.name}</h4>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={e => {
                      e.stopPropagation()
                      onViewSpec(option)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.stopPropagation()
                        onViewSpec(option)
                      }
                    }}
                    aria-label={`Lihat Spesifikasi ${option.name}`}
                    className="material-symbols-outlined text-[14px] text-[#775a19]/60 hover:text-[#775a19]"
                  >
                    info
                  </span>
                </div>
                {stock ? (
                  <span
                    className={`font-sans text-[10px] uppercase whitespace-nowrap ${
                      stock.available_stock <= stock.min_stock ? 'text-[#ba1a1a]' : 'text-[#006c49]'
                    }`}
                  >
                    {stock.available_stock.toLocaleString('id-ID')} {stock.unit} tersedia
                    {stock.available_stock <= stock.min_stock ? ' · Menipis' : ''}
                  </span>
                ) : (
                  <span className="font-sans text-[10px] text-[#444748] uppercase whitespace-nowrap">
                    Stok belum terhubung
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
