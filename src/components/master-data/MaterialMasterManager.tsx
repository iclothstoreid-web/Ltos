'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Material, MaterialCategory } from '@/lib/inventory/types'
import {
  createCategory,
  createMaterial,
  deleteCategory,
  fetchCategories,
  fetchMaterials,
  updateCategory,
  updateMaterial,
} from '@/lib/inventory/materials'
import { formatRupiah } from '@/lib/format/money'
import type { DnaColor } from '@/lib/design/dnaColors'
import { fetchActiveDnaColors } from '@/lib/design/dnaColors'
import type { MaterialColor } from '@/lib/design/materialColors'
import {
  addMaterialColor,
  deactivateMaterialColor,
  fetchMaterialColorsForMaterial,
} from '@/lib/design/materialColors'

interface MaterialMasterManagerProps {
  initialMaterials: Material[]
  categories: MaterialCategory[]
}

interface IdentityFormState {
  name: string
  category_id: string
  supplier: string
  price: string
  sku: string
}

const EMPTY_FORM: IdentityFormState = {
  name: '',
  category_id: '',
  supplier: '',
  price: '',
  sku: '',
}

// Material Master (Sprint K LOCK V1 §6-7) -- identity-only view of the same
// `materials` table Inventory's Material page manages. This page never
// touches physical_stock/reserved_stock/min_stock; it only writes
// name/category_id/supplier/price/sku/is_active, passing through the
// material's existing unit/min_stock/location/photo_url unchanged on every
// save so Inventory's stock data is never disturbed. Color lives entirely in
// material_colors (Architecture Lock: DNA Color Repository + Material Color
// Mapping) — Material itself never carries a color field.
export function MaterialMasterManager({ initialMaterials, categories: initialCategories }: MaterialMasterManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deepLinkHandled = useRef(false)
  const [supabase] = useState(() => createClient())
  const [materials, setMaterials] = useState(initialMaterials)
  const [categories, setCategories] = useState(initialCategories)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newForm, setNewForm] = useState<IdentityFormState>(EMPTY_FORM)
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<IdentityFormState>(EMPTY_FORM)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')

  // Material Colors (Architecture Lock: DNA Color Repository + Material
  // Color Mapping) — dnaColors is the picker source (never a free-text/new
  // DNA input, per "Tidak boleh membuat DNA baru dari halaman Material"),
  // materialColors is the currently-open material's linked colors.
  const [dnaColors, setDnaColors] = useState<DnaColor[]>([])
  const [materialColors, setMaterialColors] = useState<MaterialColor[]>([])
  const [loadingMaterialColors, setLoadingMaterialColors] = useState(false)
  const [newColorDnaId, setNewColorDnaId] = useState('')
  const [newColorSupplierCode, setNewColorSupplierCode] = useState('')
  const [newColorSupplierName, setNewColorSupplierName] = useState('')

  useEffect(() => {
    fetchActiveDnaColors(supabase)
      .then(setDnaColors)
      .catch(err => console.error('[material-master] fetch dna colors failed', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once
  }, [])

  // Deep-link from Master Data's "Kelola Material Colors" button
  // (?materialId=...) — opens straight into that Material's edit view,
  // same as clicking "Ubah" on it directly. Only fires once per page load.
  useEffect(() => {
    if (deepLinkHandled.current) return
    const materialId = searchParams.get('materialId')
    if (!materialId) return
    const material = materials.find(m => m.id === materialId)
    if (material) {
      deepLinkHandled.current = true
      startEdit(material)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-check once materials load; startEdit is stable per render
  }, [materials])

  async function refreshMaterialColors(materialId: string) {
    setLoadingMaterialColors(true)
    try {
      setMaterialColors(await fetchMaterialColorsForMaterial(supabase, materialId))
    } catch (err) {
      console.error('[material-master] fetch material colors failed', err)
      setError('Gagal memuat Material Colors.')
    } finally {
      setLoadingMaterialColors(false)
    }
  }

  async function refresh() {
    setLoading(true)
    try {
      setMaterials(await fetchMaterials(supabase))
    } catch (err) {
      console.error('[material-master] refresh failed', err)
      setError('Gagal memuat data material.')
    } finally {
      setLoading(false)
    }
  }

  async function refreshCategories() {
    try {
      setCategories(await fetchCategories(supabase))
    } catch (err) {
      console.error('[material-master] refresh categories failed', err)
      setError('Gagal memuat data kategori.')
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    setError(null)
    try {
      await createCategory(supabase, newCategoryName)
      setNewCategoryName('')
      await refreshCategories()
    } catch (err) {
      console.error('[material-master] create category failed', err)
      setError('Gagal menambah kategori.')
    } finally {
      setCreatingCategory(false)
    }
  }

  function startEditCategory(c: MaterialCategory) {
    setEditingCategoryId(c.id)
    setEditCategoryName(c.name)
  }

  async function handleSaveEditCategory() {
    if (!editingCategoryId || !editCategoryName.trim()) return
    setError(null)
    try {
      await updateCategory(supabase, editingCategoryId, editCategoryName)
      setEditingCategoryId(null)
      await refreshCategories()
    } catch (err) {
      console.error('[material-master] update category failed', err)
      setError('Gagal mengubah kategori.')
    }
  }

  async function handleDeleteCategory(c: MaterialCategory) {
    setError(null)
    try {
      await deleteCategory(supabase, c.id)
      await refreshCategories()
    } catch (err) {
      console.error('[material-master] delete category failed', err)
      setError(err instanceof Error ? err.message : 'Gagal menghapus kategori.')
    }
  }

  async function handleCreate() {
    if (!newForm.name.trim() || !newForm.category_id) return
    setCreating(true)
    setError(null)
    try {
      await createMaterial(supabase, {
        category_id: newForm.category_id,
        name: newForm.name,
        sku: newForm.sku || null,
        unit: 'pcs',
        price: newForm.price ? Number(newForm.price) : 0,
        supplier: newForm.supplier || null,
      })
      setNewForm(EMPTY_FORM)
      await refresh()
    } catch (err) {
      console.error('[material-master] create failed', err)
      setError('Gagal menambah material.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(m: Material) {
    setEditingId(m.id)
    setEditForm({
      name: m.name,
      category_id: m.category_id,
      supplier: m.supplier || '',
      price: String(m.price),
      sku: m.sku || '',
    })
    setNewColorDnaId('')
    setNewColorSupplierCode('')
    setNewColorSupplierName('')
    setMaterialColors([])
    refreshMaterialColors(m.id)
  }

  async function handleAddMaterialColor() {
    if (!editingId || !newColorDnaId || !newColorSupplierCode.trim()) return
    setError(null)
    try {
      await addMaterialColor(supabase, {
        materialId: editingId,
        dnaColorId: newColorDnaId,
        supplierColorCode: newColorSupplierCode,
        supplierColorName: newColorSupplierName || null,
      })
      setNewColorDnaId('')
      setNewColorSupplierCode('')
      setNewColorSupplierName('')
      await refreshMaterialColors(editingId)
    } catch (err) {
      console.error('[material-master] add material color failed', err)
      setError(err instanceof Error ? err.message : 'Gagal menambah Material Color.')
    }
  }

  async function handleDeactivateMaterialColor(id: string) {
    if (!editingId) return
    setError(null)
    try {
      await deactivateMaterialColor(supabase, id)
      await refreshMaterialColors(editingId)
    } catch (err) {
      console.error('[material-master] deactivate material color failed', err)
      setError('Gagal menonaktifkan Material Color.')
    }
  }

  async function handleSaveEdit() {
    if (!editingId) return
    const original = materials.find(m => m.id === editingId)
    if (!original) return
    setLoading(true)
    setError(null)
    try {
      await updateMaterial(supabase, editingId, {
        category_id: editForm.category_id,
        name: editForm.name,
        sku: editForm.sku || null,
        unit: original.unit,
        price: editForm.price ? Number(editForm.price) : 0,
        min_stock: original.min_stock,
        location: original.location,
        photo_url: original.photo_url,
        is_active: original.is_active,
        supplier: editForm.supplier || null,
      })
      setEditingId(null)
      await refresh()
    } catch (err) {
      console.error('[material-master] update failed', err)
      setError('Gagal mengubah material.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(m: Material) {
    setLoading(true)
    setError(null)
    try {
      await updateMaterial(supabase, m.id, {
        category_id: m.category_id,
        name: m.name,
        sku: m.sku,
        unit: m.unit,
        price: m.price,
        min_stock: m.min_stock,
        location: m.location,
        photo_url: m.photo_url,
        is_active: !m.is_active,
        supplier: m.supplier,
      })
      await refresh()
    } catch (err) {
      console.error('[material-master] toggle active failed', err)
      setError('Gagal mengubah status material.')
    } finally {
      setLoading(false)
    }
  }

  function categoryName(categoryId: string): string {
    return categories.find(c => c.id === categoryId)?.name || '—'
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Material Master</h1>
          <p className="text-xs text-[#444748]">
            Nama, kategori, supplier, default cost, SKU, status, Material Colors — bukan stok.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/owner/master-data-center')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-8 max-w-3xl mx-auto space-y-8">
        {error && (
          <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded text-sm text-[#ba1a1a]">
            {error}
          </div>
        )}

        <section className="bg-white border-[0.5px] border-[#c4c7c7] p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">Kategori Material</h2>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-3">
                {editingCategoryId === c.id ? (
                  <>
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={e => setEditCategoryName(e.target.value)}
                      className="flex-1 py-1.5 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                    />
                    <div className="flex gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={handleSaveEditCategory}
                        className="text-xs text-[#755b00] hover:underline"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(null)}
                        className="text-xs text-[#444748] hover:underline"
                      >
                        Batal
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-sm">{c.name}</span>
                    <div className="flex gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditCategory(c)}
                        className="text-xs text-[#755b00] hover:underline"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus kategori "${c.name}"?`)) handleDeleteCategory(c)
                        }}
                        className="text-xs text-[#ba1a1a] hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t-[0.5px] border-[#c4c7c7]">
            <input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Nama kategori baru"
              className="flex-1 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={creatingCategory || !newCategoryName.trim()}
              className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              + Tambah Kategori
            </button>
          </div>
        </section>

        <section className="bg-white border-[0.5px] border-[#c4c7c7] p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">Tambah Material</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newForm.name}
              onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nama material"
              className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
            <select
              value={newForm.category_id}
              onChange={e => setNewForm(f => ({ ...f, category_id: e.target.value }))}
              className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            >
              <option value="">Pilih kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newForm.supplier}
              onChange={e => setNewForm(f => ({ ...f, supplier: e.target.value }))}
              placeholder="Supplier"
              className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
            <input
              type="number"
              min={0}
              value={newForm.price}
              onChange={e => setNewForm(f => ({ ...f, price: e.target.value }))}
              placeholder="Default Cost"
              className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
            <input
              type="text"
              value={newForm.sku}
              onChange={e => setNewForm(f => ({ ...f, sku: e.target.value }))}
              placeholder="SKU"
              className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newForm.name.trim() || !newForm.category_id}
            className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
          >
            {creating ? 'Menambah...' : 'Tambah'}
          </button>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">
            Daftar Material {loading && '· Memuat...'}
          </h2>
          {materials.length === 0 && <p className="text-sm text-[#444748]">Belum ada material.</p>}
          {materials.map(m => (
            <div key={m.id} className="bg-white border-[0.5px] border-[#c4c7c7] p-4">
              {editingId === m.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                    />
                    <select
                      value={editForm.category_id}
                      onChange={e => setEditForm(f => ({ ...f, category_id: e.target.value }))}
                      className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editForm.supplier}
                      onChange={e => setEditForm(f => ({ ...f, supplier: e.target.value }))}
                      placeholder="Supplier"
                      className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                    />
                    <input
                      type="number"
                      min={0}
                      value={editForm.price}
                      onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="Default Cost"
                      className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                    />
                    <input
                      type="text"
                      value={editForm.sku}
                      onChange={e => setEditForm(f => ({ ...f, sku: e.target.value }))}
                      placeholder="SKU"
                      className="py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                    />
                  </div>

                  <div className="pt-3 border-t-[0.5px] border-[#c4c7c7] space-y-2">
                    <h3 className="text-xs uppercase tracking-widest text-[#444748] font-bold">
                      Material Colors {loadingMaterialColors && '· Memuat...'}
                    </h3>
                    {materialColors.length === 0 ? (
                      <p className="text-xs text-[#444748]">Belum ada Warna terhubung.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {materialColors.map(mc => (
                          <div key={mc.id} className="flex items-center gap-2 text-xs">
                            <span
                              className="w-3 h-3 rounded-full border border-[#c4c7c7] shrink-0"
                              style={{ backgroundColor: mc.dna_colors?.hex || '#c4c7c7' }}
                            />
                            <span className="flex-1">
                              {mc.dna_colors?.name ?? 'DNA Color'} — {mc.supplier_color_code}
                              {mc.supplier_color_name ? ` (${mc.supplier_color_name})` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeactivateMaterialColor(mc.id)}
                              className="text-[#ba1a1a] hover:underline"
                            >
                              Nonaktifkan
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 items-center pt-1">
                      <select
                        value={newColorDnaId}
                        onChange={e => setNewColorDnaId(e.target.value)}
                        className="py-1.5 px-2 border border-[#c4c7c7] text-xs outline-none focus:border-[#755b00]"
                      >
                        <option value="">+ Add Existing DNA Color</option>
                        {dnaColors.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newColorSupplierCode}
                        onChange={e => setNewColorSupplierCode(e.target.value)}
                        placeholder="Supplier Color Code"
                        className="py-1.5 px-2 border border-[#c4c7c7] text-xs outline-none focus:border-[#755b00] w-36"
                      />
                      <input
                        type="text"
                        value={newColorSupplierName}
                        onChange={e => setNewColorSupplierName(e.target.value)}
                        placeholder="Supplier Color Name (opsional)"
                        className="py-1.5 px-2 border border-[#c4c7c7] text-xs outline-none focus:border-[#755b00] w-44"
                      />
                      <button
                        type="button"
                        onClick={handleAddMaterialColor}
                        disabled={!newColorDnaId || !newColorSupplierCode.trim()}
                        className="py-1.5 px-3 bg-[#161b29] text-white text-[10px] uppercase tracking-widest disabled:opacity-40"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="py-2 px-4 border border-[#c4c7c7] text-xs uppercase tracking-widest"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-hanken text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-[#444748]">
                      {categoryName(m.category_id)} · {m.supplier || 'Supplier belum diatur'} ·{' '}
                      {m.sku || 'SKU belum diatur'}
                    </p>
                    <p className="text-xs text-[#444748] mt-0.5">Default Cost: {formatRupiah(m.price)}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest ${
                        m.is_active ? 'bg-[#dff2df] text-[#1f6b2c]' : 'bg-[#f3d8d8] text-[#a33]'
                      }`}
                    >
                      {m.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(m)}
                      className="text-xs text-[#755b00] hover:underline"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(m)}
                      className="text-xs text-[#ba1a1a] hover:underline"
                    >
                      {m.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
