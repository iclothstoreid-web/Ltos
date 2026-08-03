'use client'

import { formatRupiah } from '@/lib/format/money'
import { COMMERCIAL_TYPE_LABELS } from '@/lib/commercial/commercialType'
import type { CommercialType } from '@/lib/commercial/commercialType'

interface TransactionKpiData {
  avgGarmentsPerTransaction: number
  largestTransactionGarmentCount: number
  largestTransactionNumber: string | null
  openTransactions: number
  completedTransactions: number
  cancelledTransactions: number
  familyOrders: number
  byCommercialType: Record<CommercialType, number>
}

interface TransactionKPISectionProps {
  data: TransactionKpiData
  onSelectTransaction?: (transactionId: string) => void
}

export function TransactionKPISection({ data, onSelectTransaction }: TransactionKPISectionProps) {
  const commercialTypeLabels: Record<string, string> = {
    normal: 'Normal',
    dp: 'DP',
    full_payment: 'Full Payment',
    kol: 'KOL',
    sponsor: 'Sponsor',
    warranty: 'Garansi',
    internal_sample: 'Sample Internal',
  }

  return (
    <section className="mb-10">
      <div className="mb-6">
        <h2 className="font-serif text-heading-sm text-text-primary leading-[1.2] font-normal">
          Multi-Garment Overview
        </h2>
        <p className="text-body-md text-secondary mt-2 leading-relaxed max-w-[60ch]">
          Ringkasan transaksi multi-garmen. Setiap transaksi dapat memiliki banyak garmen (order),
          masing-masing dengan alur produksi sendiri.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Average Garments per Transaction */}
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 px-5 py-4">
          <p className="text-label text-secondary uppercase tracking-[0.2em]">Rata-rata Garmen/Transaksi</p>
          <p className="font-serif text-title text-[28px] leading-none text-on-surface mt-2 tabular-nums">
            {data.avgGarmentsPerTransaction.toFixed(1)}
          </p>
        </div>

        {/* Largest Transaction */}
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 px-5 py-4">
          <p className="text-label text-secondary uppercase tracking-[0.2em]">Transaksi Terbesar</p>
          <p className="font-serif text-title text-[28px] leading-none text-on-surface mt-2 tabular-nums">
            {data.largestTransactionGarmentCount}
          </p>
          <p className="text-label text-secondary mt-1">
            {data.largestTransactionNumber || '—'} garmen
          </p>
        </div>

        {/* Open Transactions */}
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 px-5 py-4">
          <p className="text-label text-secondary uppercase tracking-[0.2em]">Transaksi Berjalan</p>
          <p className="font-serif text-title text-[28px] leading-none text-on-surface mt-2 tabular-nums">
            {data.openTransactions}
          </p>
        </div>

        {/* Completed Transactions */}
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 px-5 py-4">
          <p className="text-label text-secondary uppercase tracking-[0.2em]">Transaksi Selesai</p>
          <p className="font-serif text-title text-[28px] leading-none text-on-surface mt-2 tabular-nums">
            {data.completedTransactions}
          </p>
        </div>
      </div>

      {/* Family Orders */}
      {data.familyOrders > 0 && (
        <div className="mt-4 rounded-[14px] border border-primary/30 bg-primary/5 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label text-secondary uppercase tracking-[0.2em]">
                🏠 Family Orders
              </p>
              <p className="font-serif text-title text-[28px] leading-none text-on-surface mt-2 tabular-nums">
                {data.familyOrders}
              </p>
            </div>
            <p className="text-body-md text-secondary max-w-[40ch]">
              Transaksi dengan lebih dari satu anggota keluarga dalam satu pembayaran.
            </p>
          </div>
        </div>
      )}

      {/* By Commercial Type */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-2">
        {Object.entries(data.byCommercialType).map(([type, count]) => (
          <div
            key={type}
            className="rounded-[8px] border border-outline-variant/60 bg-surface/30 px-3 py-2 text-center"
          >
            <p className="text-label text-secondary uppercase tracking-[0.1em] text-[10px]">
              {commercialTypeLabels[type] || type}
            </p>
            <p className="font-serif text-title text-[20px] leading-none text-on-surface mt-1 tabular-nums">
              {count}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
