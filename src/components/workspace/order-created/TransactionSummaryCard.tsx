'use client'

import { formatRupiah } from '@/lib/format/money'
import { COMMERCIAL_TYPE_LABELS } from '@/lib/commercial/commercialType'
import type { CommercialType } from '@/lib/commercial/commercialType'

interface TransactionSummaryCardProps {
  transactionNumber: string
  commercialType: CommercialType
  totalValue: number
  totalPaid: number
  balanceDue: number
  paymentStatus: string
  garmentCount: number
  uniqueCustomerCount: number
}

export function TransactionSummaryCard({
  transactionNumber,
  commercialType,
  totalValue,
  totalPaid,
  balanceDue,
  paymentStatus,
  garmentCount,
  uniqueCustomerCount,
}: TransactionSummaryCardProps) {
  const isFamilyOrder = uniqueCustomerCount > 1

  return (
    <div className="bg-[#FDFCF8] border-[0.5px] border-[#e0e0e0] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-xs font-bold text-[#151c27] uppercase tracking-widest">
          Ringkasan Transaksi
        </h2>
        <span className="font-sans text-xs text-[#775a19] uppercase tracking-widest">
          {transactionNumber}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-sans text-xs text-[#444748] uppercase tracking-wider">Tipe Komersial</p>
          <p className="font-sans text-sm font-semibold text-[#151c27] mt-0.5">
            {COMMERCIAL_TYPE_LABELS[commercialType]}
          </p>
        </div>
        <div>
          <p className="font-sans text-xs text-[#444748] uppercase tracking-wider">Jumlah Garmen</p>
          <p className="font-sans text-sm font-semibold text-[#151c27] mt-0.5">
            {garmentCount} produk
          </p>
        </div>
        {isFamilyOrder && (
          <div className="col-span-2">
            <p className="font-sans text-xs text-[#775a19] uppercase tracking-wider">
              🏠 Family Order — {uniqueCustomerCount} anggota keluarga
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-[#e0e0e0] pt-4 space-y-2">
        <div className="flex justify-between items-center">
          <p className="font-sans text-xs text-[#444748]">Total Nilai</p>
          <p className="font-sans text-sm font-bold text-[#151c27]">{formatRupiah(totalValue)}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-sans text-xs text-[#444748]">Total Dibayar</p>
          <p className="font-sans text-sm font-semibold text-[#2d7a3a]">{formatRupiah(totalPaid)}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-sans text-xs text-[#444748]">Sisa Tagihan</p>
          <p className={`font-sans text-sm font-semibold ${balanceDue > 0 ? 'text-[#c0392b]' : 'text-[#2d7a3a]'}`}>
            {formatRupiah(balanceDue)}
          </p>
        </div>
      </div>

      <div className="bg-[#f0f3ff]/50 p-3 border-l-2 border-[#775a19]">
        <p className="font-sans text-xs text-[#444748]">
          Status Pembayaran:{' '}
          <span className="font-semibold text-[#151c27]">{paymentStatus}</span>
        </p>
        {isFamilyOrder && (
          <p className="font-sans text-xs text-[#775a19] mt-1">
            Setiap garmen memiliki profil pelanggan dan ukuran masing-masing.
          </p>
        )}
      </div>
    </div>
  )
}
