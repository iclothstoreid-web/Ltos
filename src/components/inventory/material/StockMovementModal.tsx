'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Material } from '@/lib/inventory/types'

interface StockMovementModalProps {
  material: Material
  mode: 'stock_in' | 'stock_out'
  onClose: () => void
  onSubmit: (params: { quantity: number; notes: string }) => Promise<void>
}

export function StockMovementModal({ material, mode, onClose, onSubmit }: StockMovementModalProps) {
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOut = mode === 'stock_out'
  const qtyNumber = Number(quantity)
  const exceedsPhysical = isOut && qtyNumber > material.physical_stock

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!qtyNumber || qtyNumber <= 0) {
      setError('Jumlah harus lebih dari 0.')
      return
    }
    if (exceedsPhysical) {
      setError('Jumlah keluar tidak boleh melebihi Physical Stock.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ quantity: qtyNumber, notes })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm border border-outline-variant/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between border-b border-outline-variant/30">
          <h3 className="font-serif text-title text-on-surface">{isOut ? 'Stock Keluar' : 'Stock Masuk'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-container-low rounded-full text-secondary" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <p className="text-body font-bold text-on-surface">{material.name}</p>
            <p className="text-label text-secondary mt-1">
              Physical Stock saat ini: {material.physical_stock.toLocaleString('id-ID')} {material.unit}
            </p>
          </div>

          <div>
            <label className="zone-label block mb-2">Jumlah ({material.unit})</label>
            <input
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
              className="w-full border-b border-outline-variant bg-transparent py-2.5 text-body text-on-surface outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="zone-label block mb-2">Catatan (opsional)</label>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={isOut ? 'Contoh: dipakai untuk Order LT-00042' : 'Contoh: pembelian dari supplier X'}
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
