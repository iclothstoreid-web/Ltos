'use client'

import { useEffect, useState } from 'react'
import type { BookingDraft, EstimatorInput, EstimatorResult } from '@/lib/body-estimator/types'
import { LeadCaptureForm } from './LeadCaptureForm'
import { BookingCTASection } from './BookingCTASection'
import { BookingSuccessDialog } from './BookingSuccessDialog'
import { WhatsAppCTAButton } from './WhatsAppCTAButton'

interface ResultUnlockSectionProps {
  input: EstimatorInput
  result: EstimatorResult
}

interface LeadInfo {
  name: string
  whatsapp: string
  email: string
}

// Analytics stub — fired once when the result (and this unlock section) is
// first viewed.
function estimatorResultView() {
  if (process.env.NODE_ENV !== 'production') console.debug('[analytics stub] estimator_result_view')
}

// Sprint W0.4 — "lead generation engine": owns the BookingDraft in memory
// (no database — brief explicitly defers that to W0.5/LTOS), composes
// LeadCaptureForm (soft gate) + BookingCTASection (WhatsApp) +
// BookingSuccessDialog, and provides the "Download Estimated Profile"
// placeholder via the browser's own print-to-PDF (reuses this codebase's
// existing #*-print-area convention from globals.css — no new dependency).
export function ResultUnlockSection({ input, result }: ResultUnlockSectionProps) {
  const [draft, setDraft] = useState<BookingDraft | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    estimatorResultView()
  }, [])

  function handleLeadSubmit(lead: LeadInfo) {
    const nextDraft: BookingDraft = {
      ...lead,
      height: input.height,
      weight: input.weight,
      age: input.age,
      bodyProfile: result.bodyProfile,
      fit: result.fit,
      size: result.size,
      confidence: result.confidence,
      createdAt: new Date().toISOString(),
    }
    setDraft(nextDraft)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <LeadCaptureForm onSubmit={handleLeadSubmit} />
      <BookingCTASection input={input} result={result} leadName={draft?.name} />

      <button
        type="button"
        onClick={() => window.print()}
        className="mx-auto block font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe underline-offset-4 transition-colors hover:text-luxury-gold hover:underline"
      >
        Download Estimated Profile
      </button>

      {/* Print-only summary — off-screen during normal browsing, pulled
          on-screen by the #body-profile-print-area rule in globals.css. */}
      <div id="body-profile-print-area" className="fixed left-[-9999px] top-0 w-[720px] bg-white p-10 text-black">
        <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Tarda — Estimated Body Profile</p>
        <h2 className="mt-2 text-2xl font-semibold">{draft?.name ?? 'Body Profile Estimator'}</h2>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-500">Height</dt>
            <dd>{input.height} cm</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Weight</dt>
            <dd>{input.weight} kg</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Age</dt>
            <dd>{input.age}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">BMI</dt>
            <dd>{result.bmi}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Body Profile</dt>
            <dd className="capitalize">{result.bodyProfile}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Recommended Fit</dt>
            <dd className="capitalize">{result.fit}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Estimated Size</dt>
            <dd>{result.size}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Confidence</dt>
            <dd>{result.confidence}%</dd>
          </div>
        </dl>
        <p className="mt-8 max-w-md text-xs leading-relaxed text-neutral-500">
          Estimasi ini dibuat berdasarkan tinggi, berat, dan usia yang dimasukkan. Hasil ini bukan ukuran produksi.
          Seluruh pesanan dibuat menggunakan pengukuran langsung oleh fitter Tarda.
        </p>
      </div>

      <BookingSuccessDialog open={dialogOpen} onClose={() => setDialogOpen(false)} draft={draft} input={input} result={result} />

      {/* Sprint W0.4 §"Mobile Optimization" — WhatsApp CTA pinned to the
          viewport bottom on mobile for the whole result page (fixed, not
          scoped to this section's own scroll position — that's what "sticky
          pada viewport bawah" means here). Desktop already has the CTA
          inline in BookingCTASection above, so this is hidden at md:. Pure
          CSS, no new dependency; result/page.tsx adds matching bottom
          padding so this bar never covers the disclaimer/re-estimate link. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-luxury-gold/20 bg-luxury-navy-deep/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <WhatsAppCTAButton input={input} result={result} leadName={draft?.name} variant="primary" />
      </div>
    </div>
  )
}
