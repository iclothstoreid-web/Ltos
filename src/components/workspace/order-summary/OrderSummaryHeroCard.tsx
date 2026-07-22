'use client'

import type { ProductionPacket } from '@/lib/production/types'
import { STAGE_LABELS, getCurrentStageRecord } from '@/lib/production/stageConfig'

interface OrderSummaryHeroCardProps {
  customerName: string
  isPreferredClient: boolean
  orderNumber: string
  orderCreatedAt: string
  estimasi: string
  packet: ProductionPacket | null
}

// Order Summary's Customer + Status Produksi header — Task 2/7 priority #1
// and #2 on one card, same visual family as production/HeroCard but without
// its Foto/edit affordances (this page is 100% read-only).
export function OrderSummaryHeroCard({
  customerName,
  isPreferredClient,
  orderNumber,
  orderCreatedAt,
  estimasi,
  packet,
}: OrderSummaryHeroCardProps) {
  const currentRecord = packet ? getCurrentStageRecord(packet.stage_records) : null
  const statusLabel = currentRecord
    ? `${STAGE_LABELS[currentRecord.stage]} — ${
        currentRecord.status === 'in_progress' ? 'Sedang Dikerjakan' : 'Menunggu'
      }`
    : packet
      ? 'Produksi Selesai'
      : 'Belum Dimulai'
  const progressPct = Math.round((packet?.progress || 0) * 100)

  return (
    <div className="bg-[#fbf9fc] rounded-2xl p-5 shadow-[0px_4px_20px_rgba(14,19,32,0.04)] border border-[#c6c6cc]/30 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-lg flex-shrink-0 bg-[#161b29] text-white flex items-center justify-center font-caslon text-xl">
          {customerName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-jetbrains text-[10px] tracking-widest text-[#755b00] bg-[#fed977] px-2 py-0.5 rounded uppercase truncate">
              {statusLabel}
            </span>
            <span className="font-jetbrains text-[10px] tracking-widest text-[#76777d] whitespace-nowrap">
              #{orderNumber}
            </span>
          </div>
          <h2 className="font-caslon text-2xl text-[#161b29] truncate">{customerName}</h2>
          {isPreferredClient && (
            <span className="inline-block font-jetbrains text-[9px] tracking-widest uppercase text-[#785a1a] bg-[#fed488]/40 px-2 py-0.5 rounded">
              Pelanggan Prioritas
            </span>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-[#c6c6cc]/50" />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="font-jetbrains text-[10px] tracking-widest text-[#76777d] uppercase mb-1">
            Tanggal Order
          </p>
          <p className="font-hanken font-semibold text-[#161b29]">
            {new Date(orderCreatedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="font-jetbrains text-[10px] tracking-widest text-[#76777d] uppercase mb-1">
            Estimasi
          </p>
          <p className="font-hanken font-semibold text-[#161b29]">{estimasi || '—'}</p>
        </div>
        <div className="text-right">
          <p className="font-jetbrains text-[10px] tracking-widest text-[#76777d] uppercase mb-1">
            Progres
          </p>
          <p className="font-hanken font-semibold text-[#161b29]">{progressPct}%</p>
        </div>
      </div>

      <div className="w-full bg-[#e9e7eb] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#755b00] h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  )
}
