import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { GOOGLE_REVIEW_URL } from '@/lib/reviews/reviewConfig'

interface GoogleReviewCTAProps {
  city?: string
  className?: string
}

// Sprint W8-B §5 — reusable review-request section. `city` is optional and
// purely cosmetic copy (e.g. "klien kami di Jakarta") — the review link
// itself (GOOGLE_REVIEW_URL) is the same single business listing for every
// page, since there is one real business, not one per city.
export function GoogleReviewCTA({ city, className = '' }: GoogleReviewCTAProps) {
  return (
    <section aria-labelledby="review-cta-heading" className={`bg-luxury-navy px-6 py-16 text-center md:px-10 ${className}`}>
      <div className="mx-auto max-w-xl">
        <Reveal>
          <GoldAccentLine className="mx-auto mb-4" />
          <h2 id="review-cta-heading" className="font-fraunces text-2xl text-luxury-ivory md:text-3xl">
            Sudah Pernah Memesan {city ? `dari ${city}` : 'dengan Kami'}?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">
            Ulasan Anda di Google membantu klien lain menemukan Local Tailor — hanya butuh waktu singkat.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-8">
          <MagneticButton href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" variant="ghost">
            Tulis Ulasan di Google
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
