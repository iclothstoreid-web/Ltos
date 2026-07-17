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
    <div className="bg-[#fbf9fc] rounded-2xl p-6 shadow-sm border border-[#c6c6cc]/30 space-y-6">
      <h3 className="font-caslon text-xl text-[#161b29]">Spesifikasi Material</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#FDFCF7] rounded-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-[#76777d] uppercase mb-1">
              Jenis Kain
            </p>
            <p className="font-hanken font-semibold text-[#161b29]">{design?.fabric || '—'}</p>
          </div>
          <div className="p-3 bg-[#FDFCF7] rounded-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-[#76777d] uppercase mb-1">
              Warna
            </p>
            <p className="font-hanken font-semibold text-[#161b29]">{design?.color || '—'}</p>
          </div>
          <div className="p-3 bg-[#FDFCF7] rounded-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-[#76777d] uppercase mb-1">
              Panjang
            </p>
            <p className="font-hanken font-semibold text-[#161b29]">—</p>
          </div>
          <div className="p-3 bg-[#FDFCF7] rounded-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-[#76777d] uppercase mb-1">
              Benang
            </p>
            <p className="font-hanken font-semibold text-[#161b29]">—</p>
          </div>
        </div>

        {consultationNotes && (
          <div className="p-4 border-l-4 border-[#755b00] bg-[#755b00]/5 rounded-r-xl">
            <p className="font-jetbrains text-[10px] tracking-widest text-[#755b00] uppercase mb-1">
              Catatan Khusus
            </p>
            <p className="font-hanken text-[#1b1b1e]">{consultationNotes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
