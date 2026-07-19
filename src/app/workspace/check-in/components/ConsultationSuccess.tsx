'use client'

import type { ReactNode } from 'react'

interface ConsultationSuccessProps {
  consultationId: string
  consultationNumber: string
  customerName: string
  onBackToSearch: () => void
  children?: ReactNode
}

// Primary action ("Lanjut ke Pengukuran") lives in the floating SessionBar
// now, matching the Stitch reference's single-CTA session bar — this card
// only confirms the session and offers a lightweight way back.
export function ConsultationSuccess({
  consultationId,
  consultationNumber,
  customerName,
  onBackToSearch,
}: ConsultationSuccessProps) {
  return (
    <div className="p-6 lg:p-16 max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="space-y-3">
        <p className="font-sans text-xs uppercase tracking-widest text-[#444748]">
          Sukses
        </p>
        <h2 className="font-fraunces text-4xl text-[#151c27]">Konsultasi dibuat</h2>
        <p className="font-sans text-base text-[#444748]">{customerName}</p>
      </div>

      <div className="p-6 rounded-xl bg-[#775a19]/5 border border-[#775a19]/20">
        <p className="font-sans text-xs text-[#775a19] font-semibold uppercase tracking-widest">
          Nomor Konsultasi
        </p>
        <p className="font-fraunces text-3xl text-[#151c27] mt-2">{consultationNumber}</p>

        <p className="font-sans text-xs text-[#775a19]/80 mt-4">ID</p>
        <p className="font-mono text-xs text-[#444748] mt-1 break-all">{consultationId}</p>
      </div>

      <button
        onClick={onBackToSearch}
        className="font-sans text-xs font-semibold text-[#444748] hover:text-[#151c27] uppercase tracking-widest transition-colors"
      >
        ← Kembali ke Cari Pelanggan
      </button>
    </div>
  )
}

