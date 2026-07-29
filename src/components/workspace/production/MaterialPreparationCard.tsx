'use client'

import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { MaterialCatalogEntry, MaterialPreparationItem } from '@/lib/production/types'
import { listMaterialCatalogForPreparation, saveMaterialPreparation } from '@/lib/production/client'

interface MaterialPreparationCardProps {
  supabase: SupabaseClient
  orderId: string
  stageRecordId: string
  fabricName: string | null
  fabricQuantityMeters: number | null
  existingItems: MaterialPreparationItem[]
  onSaved: () => void
}

interface ItemState {
  materialId: string | null
  materialName: string | null
  quantity: number | null
}

interface CategoryGroup {
  categoryId: string
  categoryName: string
  materials: MaterialCatalogEntry[]
}

function emptyItemState(): ItemState {
  return { materialId: null, materialName: null, quantity: null }
}

// Production's "Persiapan Bahan" card — Refinement sprint (see
// 20260819010000_refine_material_preparation_dynamic_categories.sql): fully
// category-driven instead of a fixed item list. One row is rendered per
// Material Category that currently has at least one active material —
// leaving a category unselected is that category's None. Adding a new
// category in Inventory (Button, Label, Patch, Elastic, ...) surfaces here
// automatically, no code change. One "Reserve Material" action commits
// every category at once, in a single save_material_preparation call.
export function MaterialPreparationCard({
  supabase,
  orderId,
  stageRecordId,
  fabricName,
  fabricQuantityMeters,
  existingItems,
  onSaved,
}: MaterialPreparationCardProps) {
  const [catalog, setCatalog] = useState<MaterialCatalogEntry[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [items, setItems] = useState<Record<string, ItemState>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedOnce, setSavedOnce] = useState(existingItems.length > 0)

  useEffect(() => {
    let cancelled = false
    listMaterialCatalogForPreparation(supabase)
      .then(rows => {
        if (!cancelled) setCatalog(rows)
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false)
      })
    return () => {
      cancelled = true
    }
    // Catalog is fetched once per stage record — orderId/stageRecordId never
    // change without this component remounting (key'd by attempt upstream).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Every active Material Category present in the catalog, in the order
  // Inventory's own sort_order/name already sorted the RPC response by —
  // this list (not a hardcoded set of keys) is what drives the card's rows.
  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const map = new Map<string, CategoryGroup>()
    for (const entry of catalog) {
      const existing = map.get(entry.category_id)
      if (existing) {
        existing.materials.push(entry)
      } else {
        map.set(entry.category_id, { categoryId: entry.category_id, categoryName: entry.category_name, materials: [entry] })
      }
    }
    return Array.from(map.values())
  }, [catalog])

  // Seed state from whatever was already saved for this attempt, falling
  // back to sensible defaults (auto-matching the customer's chosen fabric
  // to whichever category it lives in, with the Design Studio meter
  // estimate) the first time the card is opened.
  useEffect(() => {
    if (loadingCatalog) return
    setItems(prev => {
      const next: Record<string, ItemState> = { ...prev }
      for (const group of categoryGroups) {
        const existing = existingItems.find(i => i.category_id === group.categoryId)
        if (existing) {
          next[group.categoryId] = {
            materialId: existing.material_id,
            materialName: existing.material_name,
            quantity: existing.quantity,
          }
          continue
        }
        if (next[group.categoryId]) continue
        next[group.categoryId] = emptyItemState()
      }
      if (fabricName && !existingItems.length) {
        const match = catalog.find(c => c.name.toLowerCase() === fabricName.toLowerCase())
        if (match && !next[match.category_id]?.materialId) {
          next[match.category_id] = { materialId: match.id, materialName: match.name, quantity: fabricQuantityMeters }
        }
      }
      return next
    })
    // Only re-seed once the catalog is ready or the saved rows for this
    // exact attempt change — not on every keystroke against `items` itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingCatalog, existingItems, categoryGroups, catalog, fabricName, fabricQuantityMeters])

  function setMaterial(categoryId: string, materialId: string, options: MaterialCatalogEntry[]) {
    if (!materialId) {
      setItems(prev => ({ ...prev, [categoryId]: emptyItemState() }))
      return
    }
    const match = options.find(o => o.id === materialId)
    setItems(prev => ({
      ...prev,
      [categoryId]: {
        materialId,
        materialName: match?.name ?? null,
        quantity: prev[categoryId]?.quantity ?? 1,
      },
    }))
  }

  function setQuantity(categoryId: string, quantity: number | null) {
    setItems(prev => ({ ...prev, [categoryId]: { ...prev[categoryId], quantity } }))
  }

  async function handleReserve() {
    setSaving(true)
    setError(null)
    try {
      await saveMaterialPreparation(supabase, {
        orderId,
        stageRecordId,
        items: categoryGroups.map(group => {
          const state = items[group.categoryId] ?? emptyItemState()
          const used = !!state.materialId
          return {
            categoryId: group.categoryId,
            categoryName: group.categoryName,
            materialId: state.materialId,
            materialName: state.materialName,
            quantity: used ? state.quantity : null,
            used,
          }
        }),
      })
      setSavedOnce(true)
      onSaved()
    } catch (err) {
      console.error('[material-preparation] save failed', err)
      setError('Gagal menyimpan Persiapan Bahan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-6 pb-6 border-b border-[#c6c6cc] space-y-5">
      <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">Persiapan Bahan</p>

      {loadingCatalog && (
        <p className="font-hanken text-xs text-[#76777d]">Memuat katalog Inventory...</p>
      )}

      {!loadingCatalog && categoryGroups.length === 0 && (
        <p className="font-hanken text-xs text-[#76777d]">
          Belum ada Material Category dengan material aktif di Inventory.
        </p>
      )}

      {categoryGroups.map(group => {
        const state = items[group.categoryId] ?? emptyItemState()
        const stockInfo = state.materialId
          ? group.materials.find(m => m.id === state.materialId)
          : undefined
        return (
          <div key={group.categoryId}>
            <label className="font-hanken text-xs text-[#161b29] font-semibold block mb-1">
              {group.categoryName}
            </label>
            <select
              value={state.materialId ?? ''}
              onChange={e => setMaterial(group.categoryId, e.target.value, group.materials)}
              className="w-full py-2 mb-2 bg-transparent border-b border-[#c6c6cc] focus:border-[#755b00]
                         outline-none font-hanken text-sm text-[#161b29] transition-colors"
            >
              <option value="">— None —</option>
              {group.materials.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.available_stock.toLocaleString('id-ID')} {o.unit} tersedia)
                </option>
              ))}
            </select>
            {state.materialId && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={state.quantity ?? ''}
                  onChange={e => setQuantity(group.categoryId, e.target.value === '' ? null : Number(e.target.value))}
                  placeholder={`Jumlah (${stockInfo?.unit ?? ''})`}
                  className="w-full p-2 font-hanken text-sm text-[#161b29] border border-[#c6c6cc] outline-none focus:border-[#755b00]"
                />
              </div>
            )}
          </div>
        )
      })}

      {error && <p className="font-hanken text-xs text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleReserve}
        disabled={saving || loadingCatalog || categoryGroups.length === 0}
        className="w-full bg-[#161b29] text-white py-3 font-hanken text-sm font-semibold
                   uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-50"
      >
        {saving ? 'Menyimpan...' : savedOnce ? 'Perbarui Reservasi' : 'Reserve Material'}
      </button>
    </div>
  )
}
