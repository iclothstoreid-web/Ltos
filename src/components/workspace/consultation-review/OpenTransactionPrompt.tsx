'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getOpenTransactionsForCustomer } from '@/lib/transaction/client'
import type { OpenTransactionForCustomer } from '@/lib/transaction/types'

interface OpenTransactionPromptProps {
  customerId: string
  consultationId: string
  onSelectExisting: (transaction: OpenTransactionForCustomer) => void
  onCreateNew: () => void
}

export function OpenTransactionPrompt({
  customerId,
  consultationId,
  onSelectExisting,
  onCreateNew,
}: OpenTransactionPromptProps) {
  const supabase = createClient()
  const [openTransactions, setOpenTransactions] = useState<OpenTransactionForCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const result = await getOpenTransactionsForCustomer(supabase, customerId)
        setOpenTransactions(result)
        setShowPrompt(result.length > 0)
      } catch (err) {
        console.error('Failed to check open transactions:', err)
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [customerId])

  if (loading || !showPrompt) return null

  return (
    <div className="bg-[#f0f3ff] border-[0.5px] border-[#775a19] p-4 mb-6">
      <p className="font-sans text-xs font-bold text-[#775a19] uppercase tracking-widest mb-2">
        Transaksi Berjalan Ditemukan
      </p>
      <p className="font-sans text-xs text-[#444748] mb-3">
        Customer ini memiliki {openTransactions.length} transaksi yang masih berjalan.
        Pilih tindakan:
      </p>

      <div className="space-y-2">
        {openTransactions.map((tx) => (
          <button
            key={tx.transaction_id}
            type="button"
            onClick={() => onSelectExisting(tx)}
            className="w-full text-left px-4 py-3 bg-white border-[0.5px] border-[#e0e0e0] hover:border-[#775a19] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans text-sm font-semibold text-[#151c27]">
                  {tx.transaction_number}
                </p>
                <p className="font-sans text-xs text-[#444748]">
                  {tx.garment_count} garmen · {tx.commercial_type}
                </p>
              </div>
              <span className="font-sans text-[10px] text-[#775a19] uppercase tracking-wider">
                Tambahkan
              </span>
            </div>
          </button>
        ))}

        <button
          type="button"
          onClick={onCreateNew}
          className="w-full px-4 py-3 border-[0.5px] border-[#151c27] text-[#151c27] font-sans text-xs uppercase tracking-wider hover:bg-[#f0f3ff] transition-colors"
        >
          Buat Transaksi Baru
        </button>
      </div>
    </div>
  )
}
