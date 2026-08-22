import type { Metadata } from 'next'
import Link from 'next/link'
import { estimateBodyProfile } from '@/lib/body-estimator/estimator'
import type { EstimatorInput } from '@/lib/body-estimator/types'
import { ResultHeroLayout } from '@/components/body-estimator/ResultHeroLayout'
import { TrustGuaranteeBlock } from '@/components/body-estimator/TrustGuaranteeBlock'
import { ResultUnlockSection } from '@/components/body-estimator/ResultUnlockSection'

// noindex — this route is query-param driven (?height=&weight=&age=), not
// a canonical page; the indexable entry point is /free-body-profile-estimator.
export const metadata: Metadata = {
  title: 'Your Estimated Body Profile | Bespoke Tailor',
  robots: { index: false, follow: false },
}

interface ResultPageProps {
  searchParams: { height?: string; weight?: string; age?: string }
}

// Mirrors the W0.1 form's own validation bounds (BodyEstimatorForm.tsx) —
// defensive here too since this route is reachable directly by URL, not
// only via the form's submit.
const HEIGHT_RANGE_CM = { min: 140, max: 210 }
const WEIGHT_RANGE_KG = { min: 35, max: 180 }
const AGE_RANGE_YEARS = { min: 15, max: 80 }

function parseInput(searchParams: ResultPageProps['searchParams']): EstimatorInput | null {
  const height = Number(searchParams.height)
  const weight = Number(searchParams.weight)
  const age = Number(searchParams.age)

  if (!Number.isFinite(height) || height < HEIGHT_RANGE_CM.min || height > HEIGHT_RANGE_CM.max) return null
  if (!Number.isFinite(weight) || weight < WEIGHT_RANGE_KG.min || weight > WEIGHT_RANGE_KG.max) return null
  if (!Number.isFinite(age) || age < AGE_RANGE_YEARS.min || age > AGE_RANGE_YEARS.max) return null

  return { height, weight, age }
}

// Sprint W0.4 — lead generation layer on top of the W0.3 result experience.
// Order sequence (mobile default / md: desktop):
//   mobile:  Trust(1) -> Hero(2) -> Unlock(3) -> Disclaimer(4) -> ReEstimate(5)
//   desktop: Hero(1)  -> Unlock(2) -> Trust(3) -> Disclaimer(4) -> ReEstimate(5)
// The conversion ask (ResultUnlockSection: lead capture + WhatsApp booking)
// sits immediately after the result on both breakpoints; TrustGuaranteeBlock
// keeps its W0.3 position (still first on mobile, per the Hockerty audit
// finding — untouched this sprint). Still no database, no LTOS W4 contact —
// BookingDraft lives in ResultUnlockSection's component state only.
// `pb-28 md:pb-20` clears ResultUnlockSection's fixed mobile WhatsApp bar
// (hidden at md: and up) so it never covers the disclaimer/re-estimate
// link at the bottom.
export default function BodyProfileResultPage({ searchParams }: ResultPageProps) {
  const input = parseInput(searchParams)

  if (!input) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-luxury-navy-deep px-6 text-center">
        <div>
          <p className="font-fraunces text-2xl text-luxury-ivory">Data belum lengkap atau tidak valid.</p>
          <p className="mx-auto mt-3 max-w-sm font-luxury-sans text-sm text-luxury-taupe">
            Silakan isi kembali form estimasi untuk melihat body profile Anda.
          </p>
          <Link
            href="/free-body-profile-estimator"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-luxury-gold px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-black transition hover:brightness-110"
          >
            Kembali ke Estimator
          </Link>
        </div>
      </div>
    )
  }

  const result = estimateBodyProfile(input)

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 pb-28 pt-16 md:pb-20 md:pt-20 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 md:gap-20">
        <div className="order-1 md:order-3">
          <TrustGuaranteeBlock />
        </div>

        <div className="order-2 md:order-1">
          <ResultHeroLayout input={input} result={result} />
        </div>

        <div className="order-3 mx-auto w-full max-w-xl md:order-2">
          <ResultUnlockSection input={input} result={result} />
        </div>

        <div className="order-4 mx-auto max-w-2xl rounded-2xl border border-luxury-gold/20 bg-luxury-navy-deep/40 px-6 py-5 text-center lg:text-left">
          <p className="font-luxury-sans text-xs leading-relaxed text-luxury-taupe">
            Estimasi ini dibuat berdasarkan tinggi, berat, dan usia yang Anda masukkan. Hasil ini bukan ukuran
            produksi. Seluruh pesanan dibuat menggunakan pengukuran langsung oleh fitter Tarda.
          </p>
        </div>

        <div className="order-5 text-center">
          <Link
            href="/free-body-profile-estimator"
            className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe transition-colors hover:text-luxury-gold"
          >
            ← Coba Estimasi Ulang
          </Link>
        </div>
      </div>
    </div>
  )
}
