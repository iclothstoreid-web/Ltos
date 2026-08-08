'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { ProductionPacket, StageStatus } from '@/lib/production/types'

// PR-02 (Rendering Performance, Lazy Hydration) — only opened via local
// state (showPhoto), not part of first paint. Same component, same props;
// just excluded from the initial JS bundle until actually rendered.
const FullscreenMediaModal = dynamic(() => import('./FullscreenMediaModal').then(mod => mod.FullscreenMediaModal))

interface HeroCardProps {
  packet: ProductionPacket
  currentStatus?: StageStatus
  customerPhotoUrl?: string | null
}

const STATUS_LABELS: Record<StageStatus, string> = {
  pending: 'Menunggu',
  in_progress: 'Sedang Dikerjakan',
  completed: 'Selesai',
}

// Reusable across every internal production stage page, per the master
// prompt's "Hero Card WAJIB sama di seluruh halaman produksi" rule. Visual
// rebuilt against the Persiapan Material Stitch export (rounded-2xl white
// card, status badge, photo slot). customerPhotoUrl comes from Consultation
// Review via lib/production/customerPhoto.ts — not every order has one
// (photo capture is optional there), so letter-avatar stays the honest
// fallback rather than a placeholder image.
export function HeroCard({ packet, currentStatus = 'pending', customerPhotoUrl }: HeroCardProps) {
  const initial = (packet.customer_name || '?').charAt(0).toUpperCase()
  const progressPct = Math.round((packet.progress || 0) * 100)
  const [showPhoto, setShowPhoto] = useState(false)

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-[0px_4px_20px_rgba(14,19,32,0.04)] border border-outline-variant/30 space-y-4">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => customerPhotoUrl && setShowPhoto(true)}
          disabled={!customerPhotoUrl}
          // Sprint UX-03.1 (Photo Display Consistency) — was w-16 h-16
          // (square), cropping most of a full-body Foto Pelanggan down to a
          // sliver. Portrait aspect-[3/4] shows more of the actual photo at
          // the same compact header scale; the letter-avatar fallback still
          // renders fine inside a taller box.
          className="w-14 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-on-surface text-white flex items-center justify-center font-caslon text-2xl disabled:cursor-default"
        >
          {customerPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
            <img
              src={customerPhotoUrl}
              alt={packet.customer_name || 'Foto Pelanggan'}
              className="w-full h-full object-cover"
            />
          ) : (
            initial
          )}
        </button>
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="font-jetbrains text-[10px] tracking-widest text-amber-mid bg-warm-gold/25 px-2 py-0.5 rounded uppercase">
              {STATUS_LABELS[currentStatus]}
            </span>
            <span className="font-jetbrains text-[10px] tracking-widest text-secondary/80">
              #{packet.order_number}
            </span>
          </div>
          <h2 className="font-caslon text-2xl text-on-surface truncate">
            {packet.customer_name || 'Pelanggan'}
          </h2>
          {packet.design && (
            <p className="font-hanken text-sm text-secondary truncate">
              {packet.design.model} &middot; {packet.design.fabric} &middot; {packet.design.color}
            </p>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-outline-variant/50" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-jetbrains text-[10px] tracking-widest text-secondary/80 uppercase mb-1">
            Target Selesai
          </p>
          <p className="font-hanken font-semibold text-on-surface">
            {new Date(packet.estimated_completion).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-jetbrains text-[10px] tracking-widest text-secondary/80 uppercase mb-1">
            Progres
          </p>
          <p className="font-hanken font-semibold text-on-surface">{progressPct}%</p>
        </div>
      </div>

      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-amber-mid h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {showPhoto && customerPhotoUrl && (
        <FullscreenMediaModal
          kind="image"
          src={customerPhotoUrl}
          alt={packet.customer_name || 'Foto Pelanggan'}
          onClose={() => setShowPhoto(false)}
        />
      )}
    </div>
  )
}
