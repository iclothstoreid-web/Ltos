'use client'

import type { DesignSelections } from '@/components/workspace/design-studio/types'

interface MaterialSpecCardProps {
  design: DesignSelections | null
  consultationNotes: string | null
}

// Read-only "Data Acuan" for Persiapan Material, from the Stitch export's
// "Spesifikasi Material" panel. Jenis Kain/Warna come from the real design
// snapshot; fabric length ("Panjang") and thread brand ("Benang") are shown
// as "—" rather than fabricated — no fabric-quantity calculator or thread
// selection exists anywhere in the app yet (same honesty rule already used
// by Design Studio's Production Metrics card and Order Created's System
// Logistics card).
export function MaterialSpecCard({ design, consultationNotes }: MaterialSpecCardProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30 space-y-6">
      <h3 className="font-caslon text-xl text-on-surface">Spesifikasi Material</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-surface-01 rounded-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-secondary/80 uppercase mb-1">
              Jenis Kain
            </p>
            <p className="font-hanken font-semibold text-on-surface">{design?.fabric || '—'}</p>
          </div>
          <div className="p-3 bg-surface-01 rounded-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-secondary/80 uppercase mb-1">
              Warna
            </p>
            <p className="font-hanken font-semibold text-on-surface">{design?.color || '—'}</p>
          </div>
          <div className="p-3 bg-surface-01 rounded-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-secondary/80 uppercase mb-1">
              Panjang
            </p>
            <p className="font-hanken font-semibold text-on-surface">—</p>
          </div>
          <div className="p-3 bg-surface-01 rounded-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-secondary/80 uppercase mb-1">
              Benang
            </p>
            <p className="font-hanken font-semibold text-on-surface">—</p>
          </div>
        </div>

        {consultationNotes && (
          <div className="p-4 border-l-4 border-amber-mid bg-amber-mid/5 rounded-r-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-amber-mid uppercase mb-1">
              Catatan Khusus
            </p>
            <p className="font-hanken text-on-surface">{consultationNotes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
