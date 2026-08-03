'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getTransactionDetail } from '@/lib/transaction/client'
import { getOrderInvoice } from '@/lib/commercial/client'
import { PAYMENT_STATUS_LABELS } from '@/lib/commercial/types'
import type { TransactionDetail } from '@/lib/transaction/types'
import { TransactionSummaryCard } from './TransactionSummaryCard'
import { GarmentOrderList } from './GarmentOrderList'

interface TransactionGarmentsPanelProps {
  transactionId: string
  // Any order in the transaction works — get_order_invoice resolves the
  // transaction-grain quotation/payments from it (Commercial Engine is
  // transaction-grain since Milestone A; this reads it as-is, no changes).
  currentOrderId: string
}

interface TransactionTotals {
  totalValue: number
  totalPaid: number
  balanceDue: number
  paymentStatus: string
}

export function TransactionGarmentsPanel({ transactionId, currentOrderId }: TransactionGarmentsPanelProps) {
  const [supabase] = useState(() => createClient())
  const [detail, setDetail] = useState<TransactionDetail | null>(null)
  const [totals, setTotals] = useState<TransactionTotals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [detailResult, invoice] = await Promise.all([
        getTransactionDetail(supabase, transactionId),
        // Best-effort — a brand new garment may not have a quotation yet
        // (PaymentSummaryCard writes it on its own mount), so this must
        // never block the garment list from rendering.
        getOrderInvoice(supabase, currentOrderId).catch(() => null),
      ])
      setDetail(detailResult)
      if (invoice) {
        setTotals({
          totalValue: invoice.total,
          totalPaid: invoice.total_paid,
          balanceDue: invoice.balance_due,
          paymentStatus: PAYMENT_STATUS_LABELS[invoice.payment_status],
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat transaksi')
    } finally {
      setLoading(false)
    }
  }, [supabase, transactionId, currentOrderId])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !detail) {
    return <p className="font-sans text-xs text-[#444748]">Memuat transaksi...</p>
  }

  if (error || !detail) {
    return (
      <div className="bg-[#fdecea] border-[0.5px] border-[#c0392b] p-3">
        <p className="font-sans text-xs text-[#c0392b]">{error || 'Transaksi tidak ditemukan'}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <TransactionSummaryCard
          transactionNumber={detail.transaction_number}
          commercialType={detail.commercial_type}
          totalValue={totals?.totalValue ?? 0}
          totalPaid={totals?.totalPaid ?? 0}
          balanceDue={totals?.balanceDue ?? 0}
          paymentStatus={totals?.paymentStatus ?? PAYMENT_STATUS_LABELS.belum_ada_harga}
          garmentCount={detail.garment_count}
          uniqueCustomerCount={detail.unique_customer_count}
        />
      </div>
      <div className="lg:col-span-2">
        <GarmentOrderList
          transactionId={transactionId}
          orders={detail.orders}
          onGarmentAdded={load}
          onGarmentRemoved={load}
        />
      </div>
    </div>
  )
}
