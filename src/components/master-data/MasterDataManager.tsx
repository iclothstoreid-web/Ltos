'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  MASTER_DATA_CATEGORIES,
  MASTER_DATA_CATEGORY_LABELS,
  createMasterDataOption,
  updateMasterDataOption,
  deactivateMasterDataOption,
} from '@/lib/design/masterData'
import type { MasterDataCategory, MasterOptionsByCategory, MasterDataOption } from '@/lib/design/masterData'

interface MasterDataManagerProps {
  initialOptions: MasterOptionsByCategory
}

// Admin/Owner-only screen for the 9 Design Studio pilihan categories, all
// backed by the single `design_master_options` table. Functions match the
// brief exactly: Tambah (create), Ubah (edit name/hex), Nonaktifkan (soft
// disable) — no delete, so Order history referencing an old name stays intact.
export function MasterDataManager({ initialOptions }: MasterDataManagerProps) {
  const router = useRouter()
  const supabase = createClient()

  const [options, setOptions] = useState(initialOptions)
  const [activeCategory, setActiveCategory] = useState<MasterDataCategory>(MASTER_DATA_CATEGORIES[0])
  const [newName, setNewName] = useState('')
  const [newHex, setNewHex] = useState('#775a19')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingHex, setEditingHex] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isColorCategory = activeCategory === 'warna_bahan'
  const rows = options[activeCategory]

  async function refreshCategory(category: MasterDataCategory) {
    const { data, error: fetchError } = await supabase
      .from('design_master_options')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      return
    }
    setOptions(prev => ({ ...prev, [category]: (data ?? []) as MasterDataOption[] }))
  }

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createMasterDataOption(supabase, {
        category: activeCategory,
        name: newName,
        metadata: isColorCategory ? { hex: newHex } : {},
      })
      setNewName('')
      setNewHex('#775a19')
      await refreshCategory(activeCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah data.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(option: MasterDataOption) {
    setEditingId(option.id)
    setEditingName(option.name)
    setEditingHex(option.metadata.hex || '#775a19')
  }

  async function handleSaveEdit(id: string) {
    if (!editingName.trim()) return
    setSaving(true)
    setError(null)
    try {
      await updateMasterDataOption(supabase, id, {
        name: editingName,
        metadata: isColorCategory ? { hex: editingHex } : {},
      })
      setEditingId(null)
      await refreshCategory(activeCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(id: string) {
    setSaving(true)
    setError(null)
    try {
      await deactivateMasterDataOption(supabase, id)
      await refreshCategory(activeCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menonaktifkan data.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-16 justify-between">
        <div>
          <h1 className="font-caslon text-2xl">Kelola Master Data</h1>
          <p className="text-sm text-[#444748] mt-1">Sumber data pilihan Design Studio</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs uppercase tracking-widest text-[#444748] hover:text-[#151c27] transition-colors"
        >
          Kembali
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-16 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {MASTER_DATA_CATEGORIES.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category)
                setEditingId(null)
                setError(null)
              }}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all ${
                activeCategory === category
                  ? 'border-[#775a19] bg-[#775a19]/5 text-[#151c27]'
                  : 'border-[#c4c7c7]/60 text-[#444748] hover:border-[#775a19]/40'
              }`}
            >
              {MASTER_DATA_CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-[#fdecea] border-[0.5px] border-[#c0392b] p-3">
            <p className="text-xs text-[#c0392b]">{error}</p>
          </div>
        )}

        <div className="bg-white border-[0.5px] border-[#c4c7c7]/40 mb-8">
          {rows.length === 0 && (
            <p className="p-6 text-sm text-[#444748]">Belum ada data untuk kategori ini.</p>
          )}
          {rows.map(option => (
            <div
              key={option.id}
              className="flex items-center gap-4 px-6 py-4 border-b border-[#c4c7c7]/20 last:border-b-0"
            >
              {editingId === option.id ? (
                <>
                  <input
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="flex-1 border-b border-[#775a19] bg-transparent py-1 text-sm outline-none"
                  />
                  {isColorCategory && (
                    <input
                      type="color"
                      value={editingHex}
                      onChange={e => setEditingHex(e.target.value)}
                      className="w-8 h-8 border-none p-0"
                    />
                  )}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveEdit(option.id)}
                    className="text-xs uppercase tracking-widest text-[#775a19] hover:underline disabled:opacity-50"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-xs uppercase tracking-widest text-[#444748] hover:underline"
                  >
                    Batal
                  </button>
                </>
              ) : (
                <>
                  {isColorCategory && (
                    <div
                      className="w-6 h-6 rounded-full border border-[#c4c7c7] shrink-0"
                      style={{ backgroundColor: option.metadata.hex || '#c4c7c7' }}
                    />
                  )}
                  <span className={`flex-1 text-sm ${option.is_active ? '' : 'text-[#444748] line-through'}`}>
                    {option.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-widest px-2 py-1 ${
                      option.is_active ? 'text-[#2e7d32] bg-[#2e7d32]/10' : 'text-[#444748] bg-[#444748]/10'
                    }`}
                  >
                    {option.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(option)}
                    className="text-xs uppercase tracking-widest text-[#444748] hover:text-[#151c27] transition-colors"
                  >
                    Ubah
                  </button>
                  {option.is_active && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleDeactivate(option.id)}
                      className="text-xs uppercase tracking-widest text-[#c0392b] hover:underline disabled:opacity-50"
                    >
                      Nonaktifkan
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={`Tambah ${MASTER_DATA_CATEGORY_LABELS[activeCategory]} baru`}
            className="flex-1 border-b border-[#c4c7c7] bg-transparent py-2 text-sm outline-none focus:border-[#775a19]"
          />
          {isColorCategory && (
            <input
              type="color"
              value={newHex}
              onChange={e => setNewHex(e.target.value)}
              className="w-8 h-8 border-none p-0"
            />
          )}
          <button
            type="button"
            disabled={saving || !newName.trim()}
            onClick={handleAdd}
            className="px-6 py-2 bg-[#151c27] text-white text-xs uppercase tracking-widest hover:bg-[#775a19] transition-colors disabled:opacity-40"
          >
            Tambah
          </button>
        </div>
      </main>
    </div>
  )
}
