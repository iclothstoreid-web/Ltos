import Image from 'next/image'
import { reviewsCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { GoldStarRating } from '../placeholders/GoldStarRating'

type ReviewsSectionProps = {
  // Sprint W5-10 — added. The default (/#gallery) only resolves on the
  // homepage, where the existing Gallery.tsx section (id="gallery") is
  // also present; a landing page reusing ReviewsSection without that
  // section would otherwise ship a dead anchor. Override on any page that
  // doesn't include it.
  ctaHref?: string
  // Sprint W8-2/3 — added for the location-page template's CityReviews
  // wrapper. Moves the review matching this id (one of reviewsCopy.reviews'
  // own real `id`s) to the front, so a city page can surface its one
  // genuinely matching testimonial first — never invents a new review, only
  // reorders the existing real ones. Undefined (the default) renders the
  // array in its original order, so every existing caller is unaffected.
  highlightReviewId?: string
}

// Sprint W5-8 — Reviews & Testimonial System. Centered header + 3-card grid
// + metrics strip (reusing the ProductionSection metrics-strip pattern) +
// authenticity statement + CTA, matching the established full-width section
// convention. Each card's image is a real garment photo (no customer
// photography exists to use) — the <figcaption> names the garment shown,
// never the reviewer, so the image never claims to be a photo of that
// person. CTA defaults to /#gallery per this sprint's own brief, since
// /reviews doesn't exist yet.
export function ReviewsSection({ ctaHref = '/#gallery', highlightReviewId }: ReviewsSectionProps = {}) {
  const orderedReviews = highlightReviewId
    ? [...reviewsCopy.reviews].sort((a, b) => (a.id === highlightReviewId ? -1 : b.id === highlightReviewId ? 1 : 0))
    : reviewsCopy.reviews

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{reviewsCopy.eyebrow}</p>
          <h2 id="reviews-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {reviewsCopy.heading}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{reviewsCopy.subheadline}</p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {orderedReviews.map((review, i) => (
            <Reveal as="li" key={review.id} delay={i * 0.1}>
              <article aria-label={`Review from ${review.name}, ${review.city}`} className="h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-8">
                <GoldStarRating rating={review.rating} />

                <blockquote className="mt-4">
                  <p className="font-fraunces text-lg italic leading-snug text-luxury-ivory/90">&ldquo;{review.quote}&rdquo;</p>
                </blockquote>

                <div className="mt-6 flex items-center gap-4">
                  <figure className="flex-shrink-0">
                    <div className="relative h-14 w-14 overflow-hidden rounded-sm">
                      <Image src={review.image} alt={review.imageAlt} fill sizes="56px" className="object-cover" />
                    </div>
                    <figcaption className="sr-only">{review.imageCaption}</figcaption>
                  </figure>
                  <div>
                    <p className="font-luxury-sans text-sm text-luxury-ivory">{review.name}</p>
                    <p className="font-luxury-sans text-xs text-luxury-taupe">
                      {review.city} · {review.context}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.15} className="mt-16 border-y border-luxury-gold/[0.14] py-10">
          <ul className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {reviewsCopy.metrics.map((metric) => (
              <li key={metric.label} className="text-center">
                <p className="font-fraunces text-lg text-luxury-gold md:text-xl">{metric.value}</p>
                <p className="mt-1 font-luxury-sans text-xs uppercase tracking-[0.08em] text-luxury-taupe">{metric.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.2} className="mt-14 text-center">
          <blockquote className="mx-auto max-w-xl border-l-2 border-luxury-gold/40 pl-5 text-left">
            <p className="font-luxury-sans text-sm italic leading-relaxed text-luxury-taupe">{reviewsCopy.authenticityStatement}</p>
          </blockquote>

          <MagneticButton href={ctaHref} variant="primary" className="mt-10">
            {reviewsCopy.cta}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
