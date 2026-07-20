'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadMaterialPhoto } from '@/lib/inventory/materials'
import type { Material, MaterialCategory } from '@/lib/inventory/types'

interface MaterialFormModalProps {
  categories: MaterialCategory[]
  material: Material | null // null = Tambah Item, present = Edit
  defaultCategoryId: string | null
  onClose: () => void
  onSubmit: (params: {
    category_id: string
    name: string
    sku: string
    unit: string
    price: number
    min_stock: number
    location: string
    photo_url?: string | null
  }) => Promise<void>
}

export function MaterialFormModal({ categories, material, defaultCategoryId, onClose, onSubmit }: MaterialFormModalProps) {
  const supabase = createClient()
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  const [categoryId, setCategoryId] = useState(material?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? '')
  const [name, setName] = useState(material?.name ?? '')
  const [sku, setSku] = useState(material?.sku ?? '')
  const [unit, setUnit] = useState(material?.unit ?? 'meter')
  const [price, setPrice] = useState(String(material?.price ?? ''))
  const [minStock, setMinStock] = useState(String(material?.min_stock ?? ''))
  const [location, setLocation] = useState(material?.location ?? '')
  const [photoUrl, setPhotoUrl] = useState<string | null>(material?.photo_url ?? null)

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !material) return
    setUploadingPhoto(true)
    try {
      const url = await uploadMaterialPhoto(supabase, { materialId: material.id, file })
      setPhotoUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah foto.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !categoryId) {
      setError('Nama dan kategori wajib diisi.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        category_id: categoryId,
        name,
        sku,
        unit,
        price: Number(price) || 0,
        min_stock: Number(minStock) || 0,
        location,
        photo_url: material ? photoUrl : undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md border border-outline-variant/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between border-b border-outline-variant/30 sticky top-0 bg-surface z-10">
          <h3 className="font-serif text-title text-on-surface">{material ? 'Edit Material' : 'Tambah Item'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-container-low rounded-full text-secondary" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {material && (
            <div>
              <label className="zone-label block mb-2">Foto</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden shrink-0 flex items-center justify-center border border-outline-variant/30">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-label text-secondary/50">?</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="decision-secondary !py-2 !px-4 disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Mengunggah...' : 'Upload File'}
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
            </div>
          )}

          <div>
            <label className="zone-label block mb-2">Kategori</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border-b border-outline-variant bg-transparent py-2.5 text-body text-on-surface outline-none focus:border-primary transition-colors"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="zone-label block mb-2">Nama</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border-b border-outline-variant bg-transparent py-2.5 text-body text-on-surface outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="zone-label block mb-2">SKU (opsional)</label>
              <input
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full border-b border-outline-variant bg-transparent py-2.5 text-body text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="zone-label block mb-2">Satuan</label>
              <input
                value={unit}
                onChange={e => setUnit(e.target.value)}
                required
                placeholder="meter, roll, pcs"
                className="w-full border-b border-outline-variant bg-transparent py-2.5 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="zone-label block mb-2">Harga (Rp)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full border-b border-outline-variant bg-transparent py-2.5 text-body text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="zone-label block mb-2">Minimum Stock</label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={e => setMinStock(e.target.value)}
                className="w-full border-b border-outline-variant bg-transparent py-2.5 text-body text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="zone-label block mb-2">Lokasi Penyimpanan (opsional)</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Warehouse A / Rack 04B"
              className="w-full border-b border-outline-variant bg-transparent py-2.5 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && <p className="text-body text-error">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="decision-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  )
}
