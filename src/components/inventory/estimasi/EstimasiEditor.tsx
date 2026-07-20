'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, FileDown, Plus, Printer, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { saveCostTemplate } from '@/lib/inventory/materialCalculator'
import type { AdditionalCostRow, Material, MaterialCategory, MaterialEstimateRow, MaterialEstimateTemplate } from '@/lib/inventory/types'
import { EstimatePrintView, type ResolvedEstimateCostRow, type ResolvedEstimateMaterialRow } from './EstimatePrintView'

// Local editing rows keep numeric fields as strings while typing (same
// controlled-input pattern as StockMovementModal), coerced to numbers only
// for math/save. Material rows never carry price/unit — those are always
// resolved live against `allMaterials`, per the brief's "Harga Material
// selalu berasal dari Inventory" rule.
interface MaterialRowState {
  id: string
  categoryId: string
  materialId: string
  quantity: string
}

interface CostRowState {
  id: string
  name: string
  nominal: string
  notes: string
}

function newMaterialRow(): MaterialRowState {
  return { id: crypto.randomUUID(), categoryId: '', materialId: '', quantity: '' }
}

function newCostRow(): CostRowState {
  return { id: crypto.randomUUID(), name: '', nominal: '', notes: '' }
}

// Cosmetic, display-only identifier — there is no "estimates" table (only
// saved templates), so this is never persisted. One is generated per
// editor session (the parent remounts this component via `key` on
// "+ Estimasi Baru" to get a fresh one).
function generateNomorEstimasi(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `EST-${y}${m}${d}-${rand}`
}

interface EstimasiEditorProps {
  categories: MaterialCategory[]
  allMaterials: Material[]
  templates: MaterialEstimateTemplate[]
  pendingTemplate: { template: MaterialEstimateTemplate; nonce: number } | null
  onTemplateSaved: () => void
}

export function EstimasiEditor({ categories, allMaterials, templates, pendingTemplate, onTemplateSaved }: EstimasiEditorProps) {
  const supabase = createClient()

  // Generated client-side only, after mount — running Math.random() during
  // the initial render would produce a different value on the server vs.
  // the client and trigger a hydration mismatch.
  const [nomorEstimasi, setNomorEstimasi] = useState('')
  useEffect(() => {
    setNomorEstimasi(generateNomorEstimasi())
  }, [])
  const [estimateName, setEstimateName] = useState('')
  const [produk, setProduk] = useState('')
  const [customer, setCustomer] = useState('')
  const [materialRows, setMaterialRows] = useState<MaterialRowState[]>([newMaterialRow()])
  const [additionalCosts, setAdditionalCosts] = useState<CostRowState[]>([])
  const [hargaJual, setHargaJual] = useState('')
  const [catatan, setCatatan] = useState('')

  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [savingName, setSavingName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState<'print' | 'pdf' | null>(null)
  const [error, setError] = useState<string | null>(null)

  function resolveMaterial(materialId: string): Material | undefined {
    return allMaterials.find(m => m.id === materialId)
  }

  function materialsForCategory(categoryId: string): Material[] {
    return allMaterials.filter(m => m.category_id === categoryId && m.is_active)
  }

  function applyTemplate(template: MaterialEstimateTemplate) {
    // Produk/Customer/Nomor Estimasi are per-session fields, never part of a
    // template (templates only ever store material refs + qty per the
    // brief's RULES section) — deliberately left untouched here.
    setEstimateName(template.name)
    setMaterialRows(
      template.materialRows.map((r: MaterialEstimateRow) => ({
        id: r.id,
        categoryId: r.categoryId,
        materialId: r.materialId,
        quantity: String(r.quantity),
      }))
    )
    setAdditionalCosts(
      template.additionalCosts.map((c: AdditionalCostRow) => ({
        id: c.id,
        name: c.name,
        nominal: String(c.nominal),
        notes: c.notes,
      }))
    )
    setHargaJual(template.hargaJual !== null ? String(template.hargaJual) : '')
    setCatatan(template.catatan)
    setTemplatesOpen(false)
  }

  useEffect(() => {
    if (pendingTemplate) applyTemplate(pendingTemplate.template)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTemplate?.nonce])

  const resolvedMaterialRows: ResolvedEstimateMaterialRow[] = materialRows
    .map(row => {
      const resolved = resolveMaterial(row.materialId)
      if (!resolved) return null
      const quantity = Number(row.quantity) || 0
      return {
        id: row.id,
        categoryName: resolved.material_categories?.name ?? categories.find(c => c.id === row.categoryId)?.name ?? '—',
        materialName: resolved.name,
        quantity,
        unit: resolved.unit,
        price: resolved.price,
        subtotal: quantity * resolved.price,
      }
    })
    .filter((row): row is ResolvedEstimateMaterialRow => row !== null)

  const resolvedCostRows: ResolvedEstimateCostRow[] = additionalCosts.map(c => ({
    id: c.id,
    name: c.name,
    nominal: Number(c.nominal) || 0,
    notes: c.notes,
  }))

  const totalMaterial = resolvedMaterialRows.reduce((sum, r) => sum + r.subtotal, 0)
  const hppMaterial = totalMaterial
  const hargaJualValue = Number(hargaJual) || 0
  const marginRp = hargaJualValue - hppMaterial
  const marginPercent = hppMaterial > 0 ? (marginRp / hppMaterial) * 100 : 0
  const totalBiayaTambahan = resolvedCostRows.reduce((sum, c) => sum + c.nominal, 0)
  const totalEstimasiBiaya = totalMaterial + totalBiayaTambahan

  function updateMaterialRow(id: string, patch: Partial<MaterialRowState>) {
    setMaterialRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)))
  }

  function removeMaterialRow(id: string) {
    setMaterialRows(prev => prev.filter(r => r.id !== id))
  }

  function addMaterialRow() {
    setMaterialRows(prev => [...prev, newMaterialRow()])
  }

  function updateCostRow(id: string, patch: Partial<CostRowState>) {
    setAdditionalCosts(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)))
  }

  function removeCostRow(id: string) {
    setAdditionalCosts(prev => prev.filter(r => r.id !== id))
  }

  function addCostRow() {
    setAdditionalCosts(prev => [...prev, newCostRow()])
  }

  async function handleSaveTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!savingName?.trim()) return
    setSaving(true)
    setError(null)
    try {
      await saveCostTemplate(supabase, {
        name: savingName,
        materialRows: materialRows.map(r => ({ id: r.id, categoryId: r.categoryId, materialId: r.materialId, quantity: Number(r.quantity) || 0 })),
        additionalCosts: additionalCosts.map(c => ({ id: c.id, name: c.name, nominal: Number(c.nominal) || 0, notes: c.notes })),
        hargaJual: hargaJual ? Number(hargaJual) : null,
        catatan,
      })
      onTemplateSaved()
      setSavingName(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan template.')
    } finally {
      setSaving(false)
    }
  }

  function handlePrint() {
    setExporting('print')
    // Two rAFs so the (freshly re-rendered) print DOM has painted before
    // the print dialog snapshots it — window.print() itself is synchronous
    // otherwise and can race the render.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.print()
      setExporting(null)
    }))
  }

  async function handleCreatePdf() {
    setExporting('pdf')
    setError(null)
    try {
      const node = document.getElementById('material-estimate-print-area')
      if (!node) throw new Error('Area cetak tidak ditemukan.')
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
      const canvas = await html2canvas(node, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgHeight = (canvas.height * pageWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight)
      pdf.save(`Estimasi-Biaya-${(estimateName || 'Estimasi').replace(/\s+/g, '-')}.pdf`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat PDF.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="p-6">
      <EstimatePrintView
        nomorEstimasi={nomorEstimasi}
        estimateName={estimateName}
        produk={produk}
        customer={customer}
        materialRows={resolvedMaterialRows}
        additionalCosts={resolvedCostRows}
        totalMaterial={totalMaterial}
        totalBiayaTambahan={totalBiayaTambahan}
        hargaJual={hargaJualValue}
        marginRp={marginRp}
        marginPercent={marginPercent}
        catatan={catatan}
      />

      <p className="text-label text-secondary/60 mb-4">No. Estimasi: {nomorEstimasi}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="zone-label block mb-2">Nama Estimasi</label>
          <input
            value={estimateName}
            onChange={e => setEstimateName(e.target.value)}
            placeholder="Thobe Premium, Koko Premium, Custom..."
            className="w-full border-b border-outline-variant bg-transparent py-2 text-body font-bold text-on-surface placeholder:text-secondary/50 placeholder:font-normal outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="zone-label block mb-2">Produk</label>
          <input
            value={produk}
            onChange={e => setProduk(e.target.value)}
            placeholder="Nama produk"
            className="w-full border-b border-outline-variant bg-transparent py-2 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="zone-label block mb-2">Customer (opsional)</label>
          <input
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            placeholder="Nama customer"
            className="w-full border-b border-outline-variant bg-transparent py-2 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-on-surface text-[11px] uppercase tracking-widest">Daftar Material</h4>
        <div className="relative">
          <button
            type="button"
            onClick={() => setTemplatesOpen(v => !v)}
            className="flex items-center gap-1.5 text-label text-secondary hover:text-on-surface uppercase tracking-widest transition-colors"
          >
            Gunakan Template
            <ChevronDown size={14} />
          </button>
          {templatesOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setTemplatesOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-outline-variant/40 rounded-xl shadow-lg z-20 py-1.5 max-h-64 overflow-y-auto">
                {templates.length === 0 ? (
                  <p className="px-4 py-3 text-label text-secondary/70">Belum ada template tersimpan.</p>
                ) : (
                  templates.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="w-full text-left px-4 py-2 text-body text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors"
                    >
                      {t.name}
                      <span className="block text-label text-secondary/60">{t.materialRows.length} material</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {materialRows.map(row => {
          const resolved = resolveMaterial(row.materialId)
          const subtotal = (Number(row.quantity) || 0) * (resolved?.price ?? 0)
          return (
            <div key={row.id} className="bg-surface-container-low rounded-xl border border-outline-variant/30 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <select
                  value={row.categoryId}
                  onChange={e => updateMaterialRow(row.id, { categoryId: e.target.value, materialId: '' })}
                  className="w-full border-b border-outline-variant bg-transparent py-1.5 text-body text-on-surface outline-none focus:border-primary transition-colors"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={row.materialId}
                  onChange={e => updateMaterialRow(row.id, { materialId: e.target.value })}
                  disabled={!row.categoryId}
                  className="w-full border-b border-outline-variant bg-transparent py-1.5 text-body text-on-surface outline-none focus:border-primary transition-colors disabled:opacity-40"
                >
                  <option value="">Pilih Material</option>
                  {materialsForCategory(row.categoryId).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-label">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={row.quantity}
                  onChange={e => updateMaterialRow(row.id, { quantity: e.target.value })}
                  placeholder="Qty"
                  className="w-20 border-b border-outline-variant bg-transparent py-1 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
                />
                <span className="text-secondary/70 whitespace-nowrap">{resolved?.unit ?? '—'}</span>
                <span className="text-secondary/60">×</span>
                <span className="text-secondary whitespace-nowrap">{resolved ? `Rp ${resolved.price.toLocaleString('id-ID')}` : '—'}</span>
                <span className="text-secondary/60">=</span>
                <span className="flex-1 text-right text-body font-bold text-on-surface whitespace-nowrap">Rp {subtotal.toLocaleString('id-ID')}</span>
                <button
                  type="button"
                  onClick={() => removeMaterialRow(row.id)}
                  className="p-1.5 text-secondary/60 hover:text-error transition-colors shrink-0"
                  aria-label="Hapus material"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={addMaterialRow}
        className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-dashed border-outline-variant/60 rounded-xl text-secondary hover:border-primary/50 hover:text-primary transition-all text-body font-medium mb-8"
      >
        <Plus size={16} />
        Tambah Material
      </button>

      <div className="bg-surface-container-low rounded-2xl p-6 mb-8 border border-outline-variant/30">
        <h4 className="font-bold text-on-surface text-[11px] uppercase tracking-widest mb-5">Ringkasan</h4>

        <div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
          <span className="text-body text-secondary">Total Material</span>
          <span className="text-body font-bold text-on-surface">Rp {totalMaterial.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
          <span className="text-body text-secondary">Estimasi HPP Material</span>
          <span className="text-body font-bold text-on-surface">Rp {hppMaterial.toLocaleString('id-ID')}</span>
        </div>

        <div className="flex items-center justify-between py-3 gap-4">
          <div>
            <span className="text-body text-secondary block">Estimasi Harga Jual</span>
            <span className="text-[10px] text-secondary/60 uppercase tracking-widest">Input Manual</span>
          </div>
          <input
            type="number"
            min="0"
            step="any"
            value={hargaJual}
            onChange={e => setHargaJual(e.target.value)}
            placeholder="0"
            className="w-36 text-right border-b border-outline-variant bg-transparent py-1.5 text-body font-bold text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center justify-between py-2 pt-3 border-t border-outline-variant/20">
          <span className="text-body text-secondary">
            Margin <span className="text-label">({marginPercent.toFixed(1)}%)</span>
          </span>
          <span className={`text-body font-bold ${marginRp < 0 ? 'text-error' : 'text-primary'}`}>
            Rp {marginRp.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-on-surface text-[11px] uppercase tracking-widest">Estimasi Biaya Tambahan</h4>
      </div>

      <div className="space-y-3 mb-4">
        {additionalCosts.map(cost => (
          <div key={cost.id} className="bg-surface-container-low rounded-xl border border-outline-variant/30 p-4">
            <div className="flex items-start gap-3 mb-3">
              <input
                value={cost.name}
                onChange={e => updateCostRow(cost.id, { name: e.target.value })}
                placeholder="Nama biaya (mis. Jahit, Bordir, QC, Packaging)"
                className="flex-1 min-w-0 border-b border-outline-variant bg-transparent py-1.5 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => removeCostRow(cost.id)}
                className="p-1.5 text-secondary/60 hover:text-error transition-colors shrink-0"
                aria-label="Hapus biaya"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-secondary/70 text-label">Rp</span>
              <input
                type="number"
                min="0"
                step="any"
                value={cost.nominal}
                onChange={e => updateCostRow(cost.id, { nominal: e.target.value })}
                placeholder="Nominal"
                className="w-28 border-b border-outline-variant bg-transparent py-1 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
              />
              <input
                value={cost.notes}
                onChange={e => updateCostRow(cost.id, { notes: e.target.value })}
                placeholder="Keterangan (opsional)"
                className="flex-1 min-w-0 border-b border-outline-variant bg-transparent py-1 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCostRow}
        className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-dashed border-outline-variant/60 rounded-xl text-secondary hover:border-primary/50 hover:text-primary transition-all text-body font-medium mb-8"
      >
        <Plus size={16} />
        Tambah Biaya
      </button>

      <div className="bg-primary text-white p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-primary/20 mb-8">
        <p className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-bold">Total Estimasi Biaya</p>
        <p className="text-headline font-bold">Rp {totalEstimasiBiaya.toLocaleString('id-ID')}</p>
      </div>

      <div className="mb-8">
        <label className="zone-label block mb-2">Catatan</label>
        <textarea
          value={catatan}
          onChange={e => setCatatan(e.target.value)}
          rows={3}
          placeholder="Keterangan tambahan untuk estimasi ini..."
          className="w-full border border-outline-variant/40 rounded-xl bg-surface-container-low p-3 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      {savingName !== null ? (
        <form onSubmit={handleSaveTemplate} className="flex gap-2 mb-3">
          <input
            autoFocus
            value={savingName}
            onChange={e => setSavingName(e.target.value)}
            placeholder="Nama template"
            className="flex-1 border-b border-outline-variant bg-transparent py-2 text-body text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary transition-colors"
          />
          <button type="submit" disabled={saving} className="decision-primary !py-2 !px-4 disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={() => setSavingName(null)} className="decision-secondary !py-2 !px-4">
            Batal
          </button>
        </form>
      ) : null}

      {error && <p className="text-body text-error mb-3">{error}</p>}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <button type="button" onClick={() => setSavingName(estimateName)} className="decision-primary !py-3 normal-case tracking-normal">
          Simpan Template
        </button>
        <button type="button" onClick={() => setTemplatesOpen(true)} className="decision-secondary !py-3 normal-case tracking-normal">
          Gunakan Template
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handlePrint}
          disabled={exporting !== null}
          className="flex items-center justify-center gap-2 py-3 border border-outline-variant/60 rounded-xl hover:bg-surface-container-low text-secondary transition-all disabled:opacity-50"
        >
          <Printer size={16} />
          <span className="text-label uppercase tracking-widest">{exporting === 'print' ? 'Menyiapkan...' : 'Print'}</span>
        </button>
        <button
          type="button"
          onClick={handleCreatePdf}
          disabled={exporting !== null}
          className="flex items-center justify-center gap-2 py-3 border border-outline-variant/60 rounded-xl hover:bg-surface-container-low text-secondary transition-all disabled:opacity-50"
        >
          <FileDown size={16} />
          <span className="text-label uppercase tracking-widest">{exporting === 'pdf' ? 'Membuat PDF...' : 'Create PDF'}</span>
        </button>
      </div>
    </div>
  )
}
