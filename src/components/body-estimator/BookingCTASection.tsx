import type { EstimatorInput, EstimatorResult } from '@/lib/body-estimator/types'
import { WhatsAppCTAButton } from './WhatsAppCTAButton'

interface BookingCTASectionProps {
  input: EstimatorInput
  result: EstimatorResult
  leadName?: string
}

const BENEFITS = [
  'Pengukuran langsung oleh fitter',
  'Digital Body Profile terverifikasi',
  'Rekomendasi ukuran akurat',
  'Konsultasi tanpa biaya',
]

// Sprint W0.4 §"Booking CTA Section" + §"Trust Reinforcement". No hooks
// here — stays a server component; WhatsAppCTAButton is the only client
// child (needs the click handler + wa.me href).
export function BookingCTASection({ input, result, leadName }: BookingCTASectionProps) {
  return (
    <div className="rounded-2xl border border-luxury-gold/25 bg-luxury-charcoal/30 p-6 md:p-8">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Free Tailor Measurement</p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border border-luxury-gold/40 text-[10px] text-luxury-gold"
            >
              ✓
            </span>
            <span className="font-luxury-sans text-sm text-luxury-taupe">{benefit}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <WhatsAppCTAButton input={input} result={result} leadName={leadName} variant="primary" />
        <WhatsAppCTAButton input={input} result={result} leadName={leadName} variant="secondary" />
      </div>

      <div className="mt-6 border-t border-luxury-gold/[0.1] pt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-luxury-gold/40 px-3 py-1 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
          <span aria-hidden="true">✓</span> Fitter Verified
        </span>
        <p className="mt-3 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">Tailor Verified</p>
        <p className="mt-2 max-w-md font-luxury-sans text-sm leading-relaxed text-luxury-taupe">
          Estimasi ini membantu menentukan ukuran awal Anda. Untuk hasil yang benar-benar akurat, fitter Local
          Tailor akan membuat <strong className="text-luxury-ivory">Digital Body Profile terverifikasi</strong>{' '}
          melalui pengukuran langsung.
        </p>
      </div>
    </div>
  )
}
