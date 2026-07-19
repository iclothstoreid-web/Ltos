'use client'

import { useState } from 'react'
import type { Material, MaterialCategory } from '@/lib/inventory/types'

interface CatalogSidebarProps {
  categories: MaterialCategory[]
  materials: Material[]
  activeCategoryId: string | null
  adding: boolean
  onCancelAdd: () => void
  onSelectCategory: (id: string | null) => void
  onCreateCategory: (name: string) => Promise<void>
}

// "Tambah Katalog" now lives in MaterialHeader — `adding` is controlled by
// the parent workspace so the header button and this inline form share one
// source of truth instead of the sidebar owning its own trigger.
export function CatalogSidebar({ categories, materials, activeCategoryId, adding, onCancelAdd, onSelectCategory, onCreateCategory }: CatalogSidebarProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const countFor = (categoryId: string | null) =>
    categoryId === null ? materials.length : materials.filter(m => m.category_id === categoryId).length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onCreateCategory(name)
      setName('')
      onCancelAdd()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-64 border-r border-outline-variant/40 pr-4 flex flex-col gap-4 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto shrink-0">
      <h3 className="font-serif text-label font-bold text-secondary uppercase tracking-[0.2em] px-1 mt-2">Daftar Katalog</h3>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-body flex items-center justify-between transition-all ${
              activeCategoryId === null
                ? 'bg-surface shadow-sm border border-outline-variant/60 text-on-surface font-semibold'
                : 'text-secondary hover:bg-surface/60 hover:text-on-surface'
            }`}
          >
            Semua <span className="text-label font-bold bg-primary/5 px-2 py-0.5 rounded-full">{countFor(null)}</span>
          </button>
        </li>
        {categories.map(cat => (
          <li key={cat.id}>
            <button
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-body flex items-center justify-between transition-all ${
                activeCategoryId === cat.id
                  ? 'bg-surface shadow-sm border border-outline-variant/60 text-on-surface font-semibold'
                  : 'text-secondary hover:bg-surface/60 hover:text-on-surface'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-label opacity-60 shrink-0">{countFor(cat.id)}</span>
            </button>
          </li>
        ))}
      </ul>

      {adding && (
        <form onSubmit={handleSubmit} className="mt-2 mx-1 flex flex-col gap-2">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama katalog"
            className="border-b border-outline-variant bg-transparent py-2 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="decision-primary flex-1 !py-2 disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={onCancelAdd} className="decision-secondary flex-1 !py-2">
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
