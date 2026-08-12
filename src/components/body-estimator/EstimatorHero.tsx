import { MagneticButton } from '@/components/marketing/shell/MagneticButton'

// Sprint W0.1 — top banner of the standalone estimator landing page. Plain
// anchor-based CTA (no client JS): jumps straight to <BodyEstimatorForm />
// (id="estimator-form"), consistent with this codebase's "server-rendered
// unless a component genuinely needs interactivity" convention.
export function EstimatorHero() {
  return (
    <header className="mx-auto max-w-3xl px-6 pt-20 text-center md:px-10 md:pt-28">
      <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Body Profile Estimator</p>

      <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl">
        Cek Ukuran Thobe Anda Gratis
      </h1>

      <p className="mx-auto mt-6 max-w-xl font-luxury-sans text-base text-luxury-taupe md:text-lg">
        Dapatkan estimasi ukuran thobe, rekomendasi fit, dan body profile dalam kurang dari 30 detik.
      </p>

      <div className="mt-10">
        <MagneticButton href="#estimator-form" variant="primary">
          Lihat Estimasi Gratis
        </MagneticButton>
      </div>
    </header>
  )
}
