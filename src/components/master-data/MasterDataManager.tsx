'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  MASTER_DATA_CATEGORIES,
  MASTER_DATA_NAME_LABEL,
  masterDataCategoryLabel,
  createMasterDataOption,
  updateMasterDataOption,
  updateMasterDataOptionPrice,
  deactivateMasterDataOption,
  deleteMasterDataOption,
  swapMasterDataOptionOrder,
  uploadMasterDataPhoto,
} from '@/lib/design/masterData'
import type { MasterOptionsByCategory, MasterDataOption, MasterDataCategory } from '@/lib/design/masterData'
import { AiDesignDnaSection } from './AiDesignDnaSection'
import { markDnaNeedsRegeneration } from '@/lib/design/aiDna/types'
import type { AiDesignDna } from '@/lib/design/aiDna/types'
import { RenderRecipeSection } from './RenderRecipeSection'

interface MasterDataManagerProps {
  initialOptions: MasterOptionsByCategory
}

interface SpecRow {
  key: string
  value: string
}

function metadataToRows(metadata: Record<string, string>): SpecRow[] {
  return Object.entries(metadata).map(([key, value]) => ({ key, value }))
}

function rowsToMetadata(rows: SpecRow[]): Record<string, string> {
  const metadata: Record<string, string> = {}
  rows.forEach(row => {
    const key = row.key.trim()
    if (key) metadata[key] = row.value
  })
  return metadata
}

// Shared Product Knowledge Base admin — reused as-is by Owner OS
// (/owner/master-data) and Fitter (linked from CheckInSidebar /
// DesignStudioTopBar for `artisan` accounts), same page/component/service,
// no separate implementation. Every item carries: Nama, Foto, Status,
// Urutan Tampil, Tabel Spesifikasi (flexible key-value), Selling Point, and
// Catatan Internal (never shown to customers). Functions: Tambah (create),
// Ubah (edit everything), Nonaktifkan (soft disable), Hapus (hard delete,
// blocked if ever used — see deleteMasterDataOption).
//
// LOCK: categories are fixed (MASTER_DATA_CATEGORIES) — there is
// deliberately no "add category" UI. Owner/Fitter can only add/edit ITEMS
// inside an existing category (e.g. "Italian Wool" under Material), never a
// new category ("Wool"). A new category can only come from an architecture
// change (a migration extending the DB check constraint + this list).
export function MasterDataManager({ initialOptions }: MasterDataManagerProps) {
  const router = useRouter()
  const supabase = createClient()

  const [options, setOptions] = useState(initialOptions)
  const [activeCategory, setActiveCategory] = useState<MasterDataCategory>(MASTER_DATA_CATEGORIES[0])

  const [newName, setNewName] = useState('')
  const [newHex, setNewHex] = useState('#775a19')
  const [newPrice, setNewPrice] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<MasterDataCategory>(MASTER_DATA_CATEGORIES[0])
  const [editingName, setEditingName] = useState('')
  const [editingPhotoUrl, setEditingPhotoUrl] = useState<string | null>(null)
  const [editingSpecRows, setEditingSpecRows] = useState<SpecRow[]>([])
  const [editingSellingPoints, setEditingSellingPoints] = useState<string[]>([])
  const [editingInternalNotes, setEditingInternalNotes] = useState('')
  const [editingPrice, setEditingPrice] = useState('')
  // Original photo_url/ai_dna as of when this edit session opened — kept
  // separate from `editingPhotoUrl` (which mutates on a new upload) so
  // updateMasterDataOption can detect a real Hero Image change (Task 8).
  const [editingOriginalPhotoUrl, setEditingOriginalPhotoUrl] = useState<string | null>(null)
  const [editingAiDna, setEditingAiDna] = useState<AiDesignDna | null>(null)
  const [showQuickDnaPlaceholder, setShowQuickDnaPlaceholder] = useState(false)

  const [priceEditingId, setPriceEditingId] = useState<string | null>(null)
  const [priceDraft, setPriceDraft] = useState('')

  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  function formatPrice(price: number): string {
    return `Rp ${price.toLocaleString('id-ID')}`
  }

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
    return (data ?? []) as MasterDataOption[]
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
        price: Number(newPrice) || 0,
      })
      setNewName('')
      setNewHex('#775a19')
      setNewPrice('')
      const updated = await refreshCategory(activeCategory)
      // Jump straight into editing the new row so Foto/Spesifikasi/Selling
      // Point/Catatan can be filled in right away.
      const created = updated?.find(row => row.name === newName.trim())
      if (created) startEdit(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah data.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(option: MasterDataOption) {
    setEditingId(option.id)
    setEditingCategory(option.category)
    setEditingName(option.name)
    setEditingPhotoUrl(option.photo_url)
    setEditingSpecRows(metadataToRows(option.metadata))
    setEditingSellingPoints(option.selling_points.length > 0 ? option.selling_points : [])
    setEditingInternalNotes(option.internal_notes)
    setEditingPrice(String(option.price ?? 0))
    setEditingOriginalPhotoUrl(option.photo_url)
    setEditingAiDna(option.ai_dna)
    setShowQuickDnaPlaceholder(false)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function handlePhotoChange(file: File | undefined) {
    if (!file || !editingId) return
    setUploadingPhoto(true)
    setError(null)
    try {
      const url = await uploadMasterDataPhoto(supabase, { category: editingCategory, id: editingId, file })
      setEditingPhotoUrl(url)
      // Instant feedback only — the authoritative flip (Task 8) happens
      // server-side in updateMasterDataOption when Simpan is pressed,
      // comparing against editingOriginalPhotoUrl.
      setEditingAiDna(prev => (prev ? markDnaNeedsRegeneration(prev) : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah foto.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSaveEdit() {
    if (!editingId || !editingName.trim()) return
    setSaving(true)
    setError(null)
    try {
      await updateMasterDataOption(supabase, editingId, {
        name: editingName,
        metadata: rowsToMetadata(editingSpecRows),
        photo_url: editingPhotoUrl,
        selling_points: editingSellingPoints.map(point => point.trim()).filter(Boolean),
        internal_notes: editingInternalNotes,
        price: Number(editingPrice) || 0,
        currentPhotoUrl: editingOriginalPhotoUrl,
        currentAiDna: editingAiDna ?? undefined,
      })
      setEditingId(null)
      await refreshCategory(editingCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.')
    } finally {
      setSaving(false)
    }
  }

  function startPriceEdit(option: MasterDataOption) {
    setPriceEditingId(option.id)
    setPriceDraft(String(option.price ?? 0))
    setError(null)
  }

  function cancelPriceEdit() {
    setPriceEditingId(null)
  }

  async function handleUpdatePrice(id: string) {
    setSaving(true)
    setError(null)
    try {
      await updateMasterDataOptionPrice(supabase, id, Number(priceDraft) || 0)
      setPriceEditingId(null)
      await refreshCategory(activeCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui harga.')
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

  // RULE HAPUS — deleteMasterDataOption itself checks usage server-side and
  // throws MASTER_DATA_IN_USE_MESSAGE if it was ever referenced by a
  // Consultation/Order; that message surfaces as-is through the existing
  // error banner. The confirm() below only guards against an accidental
  // click, since a successful delete is irreversible (unlike Nonaktifkan).
  async function handleDelete(option: MasterDataOption) {
    if (!window.confirm(`Hapus "${option.name}" secara permanen? Tindakan ini tidak dapat dibatalkan.`)) return
    setSaving(true)
    setError(null)
    try {
      await deleteMasterDataOption(supabase, option)
      if (editingId === option.id) setEditingId(null)
      await refreshCategory(activeCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus data.')
    } finally {
      setSaving(false)
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const a = rows[index]
    const b = rows[targetIndex]
    if (!a || !b) return
    setSaving(true)
    setError(null)
    try {
      await swapMasterDataOptionOrder(
        supabase,
        { id: a.id, sort_order: a.sort_order },
        { id: b.id, sort_order: b.sort_order }
      )
      await refreshCategory(activeCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah urutan.')
    } finally {
      setSaving(false)
    }
  }

  function updateSpecRow(index: number, field: keyof SpecRow, value: string) {
    setEditingSpecRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function removeSpecRow(index: number) {
    setEditingSpecRows(prev => prev.filter((_, i) => i !== index))
  }

  function updateSellingPoint(index: number, value: string) {
    setEditingSellingPoints(prev => prev.map((point, i) => (i === index ? value : point)))
  }

  function removeSellingPoint(index: number) {
    setEditingSellingPoints(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-16 justify-between">
        <div>
          <h1 className="font-caslon text-2xl">Kelola Master Data</h1>
          <p className="text-sm text-[#444748] mt-1">Product Knowledge Base — Owner OS &amp; Fitter</p>
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
        <div className="flex flex-wrap items-center gap-2 mb-8">
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
              {masterDataCategoryLabel(category)}
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
          {rows.map((option, index) =>
            editingId === option.id ? (
              <div key={option.id} className="px-6 py-6 border-b border-[#c4c7c7]/20 last:border-b-0 space-y-5">
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Foto</p>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="w-28 h-28 bg-[#f0f0f5] border-[0.5px] border-dashed border-[#c4c7c7] flex items-center justify-center overflow-hidden relative disabled:opacity-60"
                    >
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handlePhotoChange(e.target.files?.[0])}
                      />
                      {editingPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
                        <img src={editingPhotoUrl} alt={editingName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[#c4c7c7]">add_a_photo</span>
                      )}
                      {uploadingPhoto && (
                        <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] uppercase tracking-widest">
                          Mengunggah...
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">
                          {MASTER_DATA_NAME_LABEL[editingCategory]}
                        </p>
                        <input
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="w-full border-b border-[#775a19] bg-transparent py-1 text-sm outline-none"
                        />
                      </div>
                      <div className="w-40">
                        <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Harga</p>
                        <input
                          type="number"
                          min="0"
                          value={editingPrice}
                          onChange={e => setEditingPrice(e.target.value)}
                          placeholder="0"
                          className="w-full border-b border-[#775a19] bg-transparent py-1 text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748]">
                          Tabel Spesifikasi
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditingSpecRows(prev => [...prev, { key: '', value: '' }])}
                          className="text-xs uppercase tracking-widest text-[#775a19] hover:underline"
                        >
                          + Baris
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editingSpecRows.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex items-center gap-2">
                            <input
                              value={row.key}
                              onChange={e => updateSpecRow(rowIndex, 'key', e.target.value)}
                              placeholder="Atribut"
                              className="w-1/3 border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                            />
                            {row.key.trim().toLowerCase() === 'hex' ? (
                              <input
                                type="color"
                                value={row.value || '#775a19'}
                                onChange={e => updateSpecRow(rowIndex, 'value', e.target.value)}
                                className="w-8 h-8 border-none p-0"
                              />
                            ) : (
                              <input
                                value={row.value}
                                onChange={e => updateSpecRow(rowIndex, 'value', e.target.value)}
                                placeholder="Nilai"
                                className="flex-1 border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeSpecRow(rowIndex)}
                              className="material-symbols-outlined text-[#c0392b] text-lg"
                            >
                              close
                            </button>
                          </div>
                        ))}
                        {editingSpecRows.length === 0 && (
                          <p className="text-xs text-[#444748]">Belum ada spesifikasi.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748]">
                          Selling Point / Keunggulan
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditingSellingPoints(prev => [...prev, ''])}
                          className="text-xs uppercase tracking-widest text-[#775a19] hover:underline"
                        >
                          + Poin
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editingSellingPoints.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-center gap-2">
                            <input
                              value={point}
                              onChange={e => updateSellingPoint(pointIndex, e.target.value)}
                              placeholder="Keunggulan untuk dijelaskan ke customer"
                              className="flex-1 border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                            />
                            <button
                              type="button"
                              onClick={() => removeSellingPoint(pointIndex)}
                              className="material-symbols-outlined text-[#c0392b] text-lg"
                            >
                              close
                            </button>
                          </div>
                        ))}
                        {editingSellingPoints.length === 0 && (
                          <p className="text-xs text-[#444748]">Belum ada selling point.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">
                        Catatan Internal <span className="normal-case text-[#c0392b]">(tidak tampil ke customer)</span>
                      </p>
                      <textarea
                        value={editingInternalNotes}
                        onChange={e => setEditingInternalNotes(e.target.value)}
                        rows={2}
                        className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19]"
                      />
                    </div>
                  </div>
                </div>

                {editingAiDna && (
                  <AiDesignDnaSection
                    dna={editingAiDna}
                    showQuickDnaPlaceholder={showQuickDnaPlaceholder}
                    onGenerateQuickDna={() => setShowQuickDnaPlaceholder(true)}
                  />
                )}

                <RenderRecipeSection recipe={option.render_recipe} />

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-[#151c27] text-white text-xs uppercase tracking-widest hover:bg-[#775a19] transition-colors disabled:opacity-40"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs uppercase tracking-widest text-[#444748] hover:underline"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={option.id}
                className="flex items-center gap-4 px-6 py-4 border-b border-[#c4c7c7]/20 last:border-b-0"
              >
                <div className="flex flex-col shrink-0">
                  <button
                    type="button"
                    disabled={saving || index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="material-symbols-outlined text-sm text-[#444748] disabled:opacity-20"
                  >
                    arrow_drop_up
                  </button>
                  <button
                    type="button"
                    disabled={saving || index === rows.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="material-symbols-outlined text-sm text-[#444748] disabled:opacity-20 -mt-2"
                  >
                    arrow_drop_down
                  </button>
                </div>

                {option.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
                  <img
                    src={option.photo_url}
                    alt={option.name}
                    className="w-10 h-10 object-cover border border-[#c4c7c7] shrink-0"
                  />
                ) : isColorCategory ? (
                  <div
                    className="w-6 h-6 rounded-full border border-[#c4c7c7] shrink-0"
                    style={{ backgroundColor: option.metadata.hex || '#c4c7c7' }}
                  />
                ) : (
                  <div className="w-10 h-10 border border-dashed border-[#c4c7c7] shrink-0" />
                )}

                <span className={`flex-1 text-sm ${option.is_active ? '' : 'text-[#444748] line-through'}`}>
                  {option.name}
                </span>

                {priceEditingId === option.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      autoFocus
                      value={priceDraft}
                      onChange={e => setPriceDraft(e.target.value)}
                      className="w-24 border-b border-[#775a19] bg-transparent py-1 text-sm outline-none"
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleUpdatePrice(option.id)}
                      className="text-xs uppercase tracking-widest text-[#151c27] hover:underline disabled:opacity-50"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={cancelPriceEdit}
                      className="text-xs uppercase tracking-widest text-[#444748] hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-[#151c27] shrink-0">{formatPrice(option.price ?? 0)}</span>
                )}

                <span
                  className={`text-[10px] uppercase tracking-widest px-2 py-1 ${
                    option.is_active ? 'text-[#2e7d32] bg-[#2e7d32]/10' : 'text-[#444748] bg-[#444748]/10'
                  }`}
                >
                  {option.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
                <button
                  type="button"
                  onClick={() => startPriceEdit(option)}
                  className="text-xs uppercase tracking-widest text-[#775a19] hover:underline"
                >
                  Update Harga
                </button>
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
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleDelete(option)}
                  className="text-xs uppercase tracking-widest text-[#c0392b] hover:underline disabled:opacity-50"
                >
                  Hapus
                </button>
              </div>
            )
          )}
        </div>

        <div className="flex items-center gap-4">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={`Tambah ${masterDataCategoryLabel(activeCategory)} baru (${MASTER_DATA_NAME_LABEL[activeCategory]})`}
            className="flex-1 border-b border-[#c4c7c7] bg-transparent py-2 text-sm outline-none focus:border-[#775a19]"
          />
          <input
            type="number"
            min="0"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            placeholder="Harga"
            className="w-32 border-b border-[#c4c7c7] bg-transparent py-2 text-sm outline-none focus:border-[#775a19]"
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
