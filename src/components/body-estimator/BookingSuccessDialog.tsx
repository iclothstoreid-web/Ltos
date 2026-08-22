'use client'

import { useEffect, useRef } from 'react'
import type { BookingDraft, EstimatorInput, EstimatorResult } from '@/lib/body-estimator/types'
import { WhatsAppCTAButton } from './WhatsAppCTAButton'

interface BookingSuccessDialogProps {
  open: boolean
  onClose: () => void
  draft: BookingDraft | null
  input: EstimatorInput
  result: EstimatorResult
}

// Sprint W0.4 — shown right after LeadCaptureForm submits successfully;
// hand-rolled (no new dependency) accessible dialog: role="dialog",
// aria-modal, focus moved on open, Escape + backdrop click to close.
export function BookingSuccessDialog({ open, onClose, draft, input, result }: BookingSuccessDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    dialogRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-navy-deep/80 px-6 backdrop-blur-sm"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-success-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-luxury-gold/25 bg-luxury-navy-deep p-6 shadow-2xl focus:outline-none md:p-8"
      >
        <span className="inline-flex items-center rounded-full border border-luxury-gold/40 px-3 py-1 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
          Profil Tersimpan
        </span>

        <h2 id="booking-success-title" className="mt-4 font-fraunces text-2xl text-luxury-ivory">
          Terima kasih{draft?.name ? `, ${draft.name}` : ''}!
        </h2>

        <p className="mt-3 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">
          Body profile Anda sudah tersimpan. Lanjutkan untuk booking Free Measurement dengan fitter Tarda
          melalui WhatsApp.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <WhatsAppCTAButton input={input} result={result} leadName={draft?.name} className="w-full" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-luxury-gold/25 px-6 py-3 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe transition hover:border-luxury-gold hover:text-luxury-gold focus-visible:ring-2 focus-visible:ring-luxury-gold/50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
