import { authorityCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

type AuthoritySectionProps = {
  ctaHref?: string
}

// Sprint W5-6 — Heritage / Authority. Two-column editorial layout: left is
// narrative (heritage copy, trust paragraph, authority statement, CTA),
// right is a 2x2 metrics grid — a distinct shape from every prior section
// (not image-left/content-right, not a centered grid), per this section's
// explicit "dua kolom: narasi kiri, metrics kanan" brief. Metric values are
// gold, not ivory, so this section's stat blocks read as a different
// register from the descriptive cards elsewhere on the homepage.
export function AuthoritySection({ ctaHref = '/#why' }: AuthoritySectionProps = {}) {
  return (
    <section id="authority" aria-labelledby="authority-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{authorityCopy.eyebrow}</p>
          <h2 id="authority-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {authorityCopy.heading}
          </h2>
          <p className="mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">{authorityCopy.subheadline}</p>
          <p className="mt-6 max-w-md font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{authorityCopy.trustParagraph}</p>

          <blockquote className="mt-8 border-l-2 border-luxury-gold/40 pl-5">
            <p className="font-fraunces text-xl italic leading-snug text-luxury-ivory md:text-2xl">&ldquo;{authorityCopy.statement}&rdquo;</p>
          </blockquote>

          <MagneticButton href={ctaHref} variant="primary" className="mt-8">
            {authorityCopy.cta}
          </MagneticButton>
        </Reveal>

        <ul className="grid grid-cols-2 gap-4">
          {authorityCopy.metrics.map((metric, i) => (
            <Reveal as="li" key={metric.value} delay={0.1 + i * 0.06}>
              <article className="h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6">
                <p className="font-fraunces text-2xl text-luxury-gold md:text-3xl">{metric.value}</p>
                <p className="mt-2 font-luxury-sans text-xs uppercase tracking-[0.08em] text-luxury-taupe">{metric.label}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
