'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  createCategory,
  createMaterial,
  fetchCategories,
  fetchMaterialIdsUsedInDesign,
  fetchMaterials,
  updateMaterial,
} from '@/lib/inventory/materials'
import { adjustStock } from '@/lib/inventory/stock'
import { notifyLowStock } from '@/lib/inventory/notifications'
import { materialStockStatus } from '@/lib/inventory/types'
import type { Material, MaterialCategory } from '@/lib/inventory/types'
import { CatalogSidebar } from './CatalogSidebar'
import { MaterialGrid } from './MaterialGrid'
import { MaterialDetailDrawer } from './MaterialDetailDrawer'
import { StockMovementModal } from './StockMovementModal'
import { MaterialFormModal } from './MaterialFormModal'
import { MaterialHeader, type MaterialFilter } from './MaterialHeader'
import { MaterialSummaryStrip } from './MaterialSummaryStrip'

interface MaterialWorkspaceProps {
  initialCategories: MaterialCategory[]
  initialMaterials: Material[]
}

type StockModalMode = 'stock_in' | 'stock_out' | null

export function MaterialWorkspace({ initialCategories, initialMaterials }: MaterialWorkspaceProps) {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState(initialCategories)
  const [materials, setMaterials] = useState(initialMaterials)
  const [usedInFitterIds, setUsedInFitterIds] = useState<Set<string>>(new Set())
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MaterialFilter>(null)
  const [addingCategory, setAddingCategory] = useState(false)

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  const [stockModalMode, setStockModalMode] = useState<StockModalMode>(null)
  const [formMaterial, setFormMaterial] = useState<Material | 'new' | null>(null)

  useEffect(() => {
    fetchMaterialIdsUsedInDesign(supabase).then(setUsedInFitterIds).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deep-link support: ?q= (Fitter's "Lihat Detail Material", search by
  // name), ?material= (open drawer directly), ?filter=menipis|reserved
  // (Owner OS / Dashboard notices), ?action=add-material (Dashboard's
  // Tambah Material quick action).
  useEffect(() => {
    const q = searchParams.get('q')
    const materialId = searchParams.get('material')
    const filterParam = searchParams.get('filter')
    const action = searchParams.get('action')

    if (q) setSearch(q)
    if (filterParam === 'menipis' || filterParam === 'reserved') setFilter(filterParam)
    if (materialId) setSelectedMaterialId(materialId)
    else if (q) {
      const match = initialMaterials.find(m => m.name.toLowerCase() === q.toLowerCase())
      if (match) setSelectedMaterialId(match.id)
    }
    if (action === 'add-material') setFormMaterial('new')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refreshMaterials() {
    const rows = await fetchMaterials(supabase)
    setMaterials(rows)
    return rows
  }

  const filteredMaterials = useMemo(() => {
    let rows = materials
    if (activeCategoryId) rows = rows.filter(m => m.category_id === activeCategoryId)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(m => m.name.toLowerCase().includes(q) || (m.sku ?? '').toLowerCase().includes(q))
    }
    if (filter === 'menipis') rows = rows.filter(m => materialStockStatus(m) !== 'aman')
    if (filter === 'reserved') rows = rows.filter(m => m.reserved_stock > 0)
    return rows
  }, [materials, activeCategoryId, search, filter])

  const summary = useMemo(
    () => ({
      totalMaterial: categories.length,
      totalItem: materials.length,
      lowStock: materials.filter(m => materialStockStatus(m) !== 'aman').length,
      reservedMaterial: materials.reduce((sum, m) => sum + m.reserved_stock, 0),
    }),
    [materials, categories]
  )

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId) ?? null

  function closeDrawer() {
    setSelectedMaterialId(null)
    router.replace('/inventory/material')
  }

  async function handleCreateCategory(name: string) {
    await createCategory(supabase, name)
    setCategories(await fetchCategories(supabase))
  }

  async function handleCreateMaterial(params: Parameters<typeof createMaterial>[1]) {
    await createMaterial(supabase, params)
    await refreshMaterials()
  }

  async function handleUpdateMaterial(id: string, params: Parameters<typeof updateMaterial>[2]) {
    await updateMaterial(supabase, id, { ...params, is_active: true })
    await refreshMaterials()
  }

  async function handleStockMovement(materialId: string, mode: 'stock_in' | 'stock_out', params: { quantity: number; notes: string }) {
    const updated = await adjustStock(supabase, {
      materialId,
      movementType: mode,
      quantity: params.quantity,
      notes: params.notes || undefined,
    })
    await refreshMaterials()
    if (updated.available_stock <= updated.min_stock) {
      notifyLowStock({
        materialId: updated.id,
        materialName: updated.name,
        availableStock: updated.available_stock,
        minStock: updated.min_stock,
        unit: updated.unit,
      })
    }
  }

  return (
    <div>
      <MaterialHeader
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        onAddCategory={() => setAddingCategory(true)}
        onAddItem={() => setFormMaterial('new')}
      />

      <MaterialSummaryStrip
        totalMaterial={summary.totalMaterial}
        totalItem={summary.totalItem}
        lowStock={summary.lowStock}
        reservedMaterial={summary.reservedMaterial}
      />

      <div className="flex gap-8">
        <CatalogSidebar
          categories={categories}
          materials={materials}
          activeCategoryId={activeCategoryId}
          adding={addingCategory}
          onCancelAdd={() => setAddingCategory(false)}
          onSelectCategory={setActiveCategoryId}
          onCreateCategory={handleCreateCategory}
        />

        <MaterialGrid
          materials={filteredMaterials}
          usedInFitterIds={usedInFitterIds}
          onSelectMaterial={setSelectedMaterialId}
        />

        {selectedMaterial && (
          <MaterialDetailDrawer
            material={selectedMaterial}
            onClose={closeDrawer}
            onEdit={() => setFormMaterial(selectedMaterial)}
            onStockIn={() => setStockModalMode('stock_in')}
            onStockOut={() => setStockModalMode('stock_out')}
          />
        )}

        {selectedMaterial && stockModalMode && (
          <StockMovementModal
            material={selectedMaterial}
            mode={stockModalMode}
            onClose={() => setStockModalMode(null)}
            onSubmit={params => handleStockMovement(selectedMaterial.id, stockModalMode, params)}
          />
        )}

        {formMaterial && (
          <MaterialFormModal
            categories={categories}
            material={formMaterial === 'new' ? null : formMaterial}
            defaultCategoryId={activeCategoryId}
            onClose={() => setFormMaterial(null)}
            onSubmit={async params => {
              if (formMaterial === 'new') {
                await handleCreateMaterial(params)
              } else {
                await handleUpdateMaterial(formMaterial.id, params)
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
