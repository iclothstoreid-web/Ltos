'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { duplicateGarment, removeGarmentFromTransaction } from '@/lib/transaction/client'
import { generateCustomerToken } from '@/lib/order/qr'
import type { TransactionGarmentOrder } from '@/lib/transaction/types'

interface GarmentOrderListProps {
  transactionId: string
  orders: TransactionGarmentOrder[]
  onGarmentAdded: () => void
  onGarmentRemoved: () => void
}

export function GarmentOrderList({ transactionId, orders, onGarmentAdded, onGarmentRemoved }: GarmentOrderListProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sorted = [...orders].sort((a, b) => a.garment_index - b.garment_index)

  async function handleDuplicate(orderId: string) {
    setProcessingId(orderId)
    setError(null)
    try {
      const newToken = generateCustomerToken()
      const newOrderNumber = `LT-ORD-${Date.now().toString(36).toUpperCase()}`
      const result = await duplicateGarment(supabase, {
        sourceOrderId: orderId,
        newOrderNumber,
        newCustomerToken: newToken,
      })
      onGarmentAdded()
      router.push(`/workspace/order-created/${result.order_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menduplikasi garmen')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleRemove(orderId: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus garmen ini? Tindakan ini tidak dapat dibatalkan.')) return
    setProcessingId(orderId)
    setError(null)
    try {
      await removeGarmentFromTransaction(supabase, orderId)
      onGarmentRemoved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus garmen')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-xs font-bold text-[#151c27] uppercase tracking-widest">
          Daftar Garmen ({sorted.length})
        </h2>
        <button
          type="button"
          onClick={() => router.push('/workspace/check-in')}
          className="px-3 py-1.5 bg-[#151c27] text-white font-sans text-[10px] uppercase tracking-wider hover:bg-[#775a19] transition-colors"
        >
          + Tambah Garmen
        </button>
      </div>

      {error && (
        <div className="bg-[#fdecea] border-[0.5px] border-[#c0392b] p-3">
          <p className="font-sans text-xs text-[#c0392b]">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((garment) => (
          <div
            key={garment.order_id}
            className="bg-[#FDFCF8] border-[0.5px] border-[#e0e0e0] p-4 hover:border-[#775a19] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-sans text-xs font-bold text-[#775a19] uppercase">
                    #{garment.garment_index}
                  </span>
                  <span className="font-sans text-sm font-semibold text-[#151c27] truncate">
                    {garment.order_number}
                  </span>
                  {garment.duplicated_from_order_id && (
                    <span className="font-sans text-[10px] text-[#775a19] uppercase tracking-wider bg-[#f0f3ff] px-2 py-0.5">
                      Duplikat
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-[#444748]">
                  {garment.customer_name || 'Customer'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1 bg-[#e0e0e0] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#775a19] transition-all duration-300"
                      style={{ width: `${garment.production_progress}%` }}
                    />
                  </div>
                  <span className="font-sans text-[10px] text-[#444748] whitespace-nowrap">
                    {garment.production_progress}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => garment.consultation_id && router.push(`/workspace/measurement/${garment.consultation_id}`)}
                  className="px-3 py-1.5 border-[0.5px] border-[#151c27] text-[#151c27] font-sans text-[10px] uppercase tracking-wider hover:bg-[#f0f3ff] transition-colors disabled:opacity-40"
                  disabled={processingId === garment.order_id || !garment.consultation_id}
                  title={garment.consultation_id ? undefined : 'Konsultasi untuk garmen ini tidak ditemukan'}
                >
                  Ukuran
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(garment.order_id)}
                  className="px-3 py-1.5 border-[0.5px] border-[#775a19] text-[#775a19] font-sans text-[10px] uppercase tracking-wider hover:bg-[#f0f3ff] transition-colors disabled:opacity-40"
                  disabled={processingId === garment.order_id}
                >
                  {processingId === garment.order_id ? '...' : 'Duplikat'}
                </button>
                {!garment.has_production && (
                  <button
                    type="button"
                    onClick={() => handleRemove(garment.order_id)}
                    className="px-3 py-1.5 border-[0.5px] border-[#c0392b] text-[#c0392b] font-sans text-[10px] uppercase tracking-wider hover:bg-[#fdecea] transition-colors disabled:opacity-40"
                    disabled={processingId === garment.order_id}
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
