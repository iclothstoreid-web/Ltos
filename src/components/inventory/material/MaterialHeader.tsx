'use client'

import { useState } from 'react'
import { FolderPlus, Plus, Search, SlidersHorizontal } from 'lucide-react'

export type MaterialFilter = 'menipis' | 'reserved' | null

const FILTER_OPTIONS: { value: MaterialFilter; label: string }[] = [
  { value: null, label: 'Semua Status' },
  { value: 'menipis', label: 'Stok Menipis' },
  { value: 'reserved', label: 'Reserved' },
]

interface MaterialHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  filter: MaterialFilter
  onFilterChange: (value: MaterialFilter) => void
  onAddCategory: () => void
  onAddItem: () => void
}

// Panel-agnostic top bar for the Material Workspace — owns title, search,
// filter, and the two primary creation actions per the brief's HEADER
// section. Category/item panels below just render what this state selects.
export function MaterialHeader({ search, onSearchChange, filter, onFilterChange, onAddCategory, onAddItem }: MaterialHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const activeFilterLabel = FILTER_OPTIONS.find(o => o.value === filter)?.label ?? 'Semua Status'

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-headline text-on-surface tracking-tight">Material Workspace</h1>
          <p className="text-secondary text-body mt-1">Kelola seluruh material Local Tailor.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onAddCategory}
            className="decision-secondary flex items-center gap-2 !py-2.5 !px-5 normal-case tracking-normal"
          >
            <FolderPlus size={18} />
            Tambah Katalog
          </button>
          <button
            onClick={onAddItem}
            className="decision-primary flex items-center gap-2 !py-2.5 !px-5 normal-case tracking-normal"
          >
            <Plus size={18} />
            Tambah Item
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-md flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/60" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Cari material atau SKU..."
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl py-2.5 pl-11 pr-4 text-body focus:outline-none focus:ring-2 focus:ring-primary/15 placeholder:text-secondary/50 transition-all"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-body transition-all ${
              filter
                ? 'bg-primary/5 border-primary/20 text-primary font-medium'
                : 'bg-surface border-outline-variant/40 text-secondary hover:text-on-surface'
            }`}
          >
            <SlidersHorizontal size={16} />
            {activeFilterLabel}
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-outline-variant/40 rounded-xl shadow-lg z-20 py-1.5 overflow-hidden">
                {FILTER_OPTIONS.map(option => (
                  <button
                    key={option.label}
                    onClick={() => {
                      onFilterChange(option.value)
                      setFilterOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-body transition-colors ${
                      filter === option.value ? 'text-primary font-medium bg-primary/5' : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
