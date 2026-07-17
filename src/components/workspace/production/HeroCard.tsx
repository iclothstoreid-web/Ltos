'use client'

import type { ProductionPacket, StageStatus } from '@/lib/production/types'

interface HeroCardProps {
  packet: ProductionPacket
  currentStatus?: StageStatus
}

const STATUS_LABELS: Record<StageStatus, string> = {
  pending: 'Menunggu',
  in_progress: 'Sedang Dikerjakan',
  completed: 'Selesai',
}

// Reusable across every internal production stage page, per the master
// prompt's "Hero Card WAJIB sama di seluruh halaman produksi" rule. Visual
// rebuilt against the Persiapan Material Stitch export (rounded-2xl white
// card, status badge, photo slot). No customer/reference photo field exists
// anywhere in the app yet (confirmed with the user) — letter-avatar is the
// deliberate fallback, not a placeholder oversight.
export function HeroCard({ packet, currentStatus = 'pending' }: HeroCardProps) {
  const initial = (packet.customer_name || '?').charAt(0).toUpperCase()
  const progressPct = Math.round((packet.progress || 0) * 100)

  return (
    <div className="bg-[#fbf9fc] rounded-2xl p-5 shadow-[0px_4px_20px_rgba(14,19,32,0.04)] border border-[#c6c6cc]/30 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#161b29] text-white flex items-center justify-center font-caslon text-2xl">
          {initial}
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="font-jetbrains text-[10px] tracking-widest text-[#755b00] bg-[#fed977] px-2 py-0.5 rounded uppercase">
              {STATUS_LABELS[currentStatus]}
            </span>
            <span className="font-jetbrains text-[10px] tracking-widest text-[#76777d]">
              #{packet.order_number}
            </span>
          </div>
          <h2 className="font-caslon text-2xl text-[#161b29] truncate">
            {packet.customer_name || 'Customer'}
          </h2>
          {packet.design && (
            <p className="font-hanken text-sm text-[#46464c] truncate">
              {packet.design.model} &middot; {packet.design.fabric} &middot; {packet.design.color}
            </p>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-[#c6c6cc]/50" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-jetbrains text-[10px] tracking-widest text-[#76777d] uppercase mb-1">
            Target Selesai
          </p>
          <p className="font-hanken font-semibold text-[#161b29]">
            {new Date(packet.estimated_completion).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
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
