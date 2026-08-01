'use client'

import { RENDER_RECIPE_STATUS_LABELS } from '@/lib/design/renderRecipe/types'
import type { RenderRecipe } from '@/lib/design/renderRecipe/types'

interface RenderRecipeSectionProps {
  recipe: RenderRecipe | null | undefined
  onChange: (recipe: RenderRecipe) => void
}

type RecipeRecordField = 'camera' | 'pose' | 'lighting' | 'composition' | 'focus' | 'visibilityRules'

const FIELD_ORDER: RecipeRecordField[] = ['camera', 'pose', 'lighting', 'composition', 'focus', 'visibilityRules']

const FIELD_LABELS: Record<RecipeRecordField, string> = {
  camera: 'Camera',
  pose: 'Pose',
  lighting: 'Lighting',
  composition: 'Composition',
  focus: 'Focus',
  visibilityRules: 'Visibility',
}

interface RecordRow {
  key: string
  value: string
}

function recordToRows(record: Record<string, unknown> | undefined): RecordRow[] {
  return Object.entries(record ?? {}).map(([key, value]) => ({
    key,
    value: value === null || value === undefined ? '' : String(value),
  }))
}

function rowsToRecord(rows: RecordRow[]): Record<string, unknown> {
  const record: Record<string, unknown> = {}
  rows.forEach(row => {
    const key = row.key.trim()
    if (key) record[key] = row.value
  })
  return record
}

// Upgraded from a read-only placeholder into a real editor (Reference-First
// Cleanup, brief section 8) for the per-item structural fields Render Recipe
// exposes — camera/pose/lighting/composition/focus/visibilityRules. "Jika
// kosong jangan dikirim" is already true by construction downstream
// (formatRecord/compression skip empty records everywhere) — nothing extra
// needed here to enforce it. Reuses the same key-value row pattern as
// MasterDataManager's "Tabel Spesifikasi" editor rather than inventing a new
// one. Not edited here: `quality`/`background`/`style` have no per-item
// RenderRecipe equivalent at all — they exist only on GlobalRenderPolicy
// (recipeComposer/types.ts), applied once per render, not per item;
// `garment`/`fabricIdentity`/`fabricBehavior`/`stitching`/`embroidery` are
// DNA Resolver/Component-DNA producers, not admin-authored camera/lighting
// knowledge; `negativeRules`/`lockRules` have their own RuleListEditor under
// AI Design DNA (per-item scope decision).
export function RenderRecipeSection({ recipe, onChange }: RenderRecipeSectionProps) {
  if (!recipe) return null

  function updateField(field: RecipeRecordField, rows: RecordRow[]) {
    onChange({ ...(recipe as RenderRecipe), [field]: rowsToRecord(rows) })
  }

  return (
    <div className="border-t border-[#c4c7c7]/30 pt-5 mt-2">
      <p className="font-sans text-[10px] uppercase tracking-widest text-[#775a19] mb-3">Render Recipe</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1">Status</p>
          <p className="font-sans text-sm text-[#151c27]">{RENDER_RECIPE_STATUS_LABELS[recipe.status] ?? recipe.status ?? '—'}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-1">Version</p>
          <p className="font-sans text-sm text-[#151c27]">{recipe.version ?? '—'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {FIELD_ORDER.map(field => {
          const rows = recordToRows(recipe[field] as Record<string, unknown>)
          return (
            <div key={field}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748]">{FIELD_LABELS[field]}</p>
                <button
                  type="button"
                  onClick={() => updateField(field, [...rows, { key: '', value: '' }])}
                  className="text-xs uppercase tracking-widest text-[#775a19] hover:underline"
                >
                  + Baris
                </button>
              </div>
              <div className="space-y-2">
                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-2">
                    <input
                      value={row.key}
                      onChange={e =>
                        updateField(field, rows.map((r, i) => (i === rowIndex ? { ...r, key: e.target.value } : r)))
                      }
                      placeholder="Atribut"
                      className="w-1/3 border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                    />
                    <input
                      value={row.value}
                      onChange={e =>
                        updateField(field, rows.map((r, i) => (i === rowIndex ? { ...r, value: e.target.value } : r)))
                      }
                      placeholder="Nilai"
                      className="flex-1 border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                    />
                    <button
                      type="button"
                      onClick={() => updateField(field, rows.filter((_, i) => i !== rowIndex))}
                      className="material-symbols-outlined text-[#c0392b] text-lg"
                    >
                      close
                    </button>
                  </div>
                ))}
                {rows.length === 0 && <p className="text-xs text-[#444748]">Kosong.</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
