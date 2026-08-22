import { MagneticButton } from '@/components/marketing/shell/MagneticButton'

const BENEFITS = [
  'Gratis',
  'Kurang dari 30 detik',
  'Membantu menentukan ukuran awal',
  'Tidak memerlukan pengukuran manual',
]

// Sprint W0.1 — "why use this" + secondary CTA + disclaimer. id="why-estimator"
// doubles as the scroll target BodyEstimatorForm jumps to after a valid
// submit (no backend yet, so this is the funnel's next real step).
export function PremiumCTASection() {
  return (
    <section
      id="why-estimator"
      aria-labelledby="why-estimator-heading"
      className="scroll-mt-10 border-t border-luxury-gold/[0.12] px-6 py-16 md:px-10"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="why-estimator-heading" className="font-fraunces text-3xl text-luxury-ivory md:text-4xl">
          Mengapa menggunakan estimator ini?
        </h2>

        <ul className="mx-auto mt-8 grid max-w-lg gap-4 text-left sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
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

        <div className="mt-10">
          {/* TODO_PLACEHOLDER_URL — real booking flow is out of scope for
              Sprint W0.1 (landing page + form only); wire to the actual
              booking route once it exists. */}
          <MagneticButton href="#" variant="ghost">
            Book Free Measurement
          </MagneticButton>
        </div>

        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-luxury-gold/20 bg-luxury-charcoal/20 px-6 py-5 text-left">
          <p className="font-luxury-sans text-xs leading-relaxed text-luxury-taupe">
            Estimasi ini hanya berdasarkan data yang Anda masukkan dan bukan ukuran produksi. Untuk hasil yang
            akurat, lakukan pengukuran langsung oleh fitter Tarda.
          </p>
        </div>
      </div>
    </section>
  )
}
