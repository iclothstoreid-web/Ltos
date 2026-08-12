import Image from 'next/image'
import { measurementCopy } from '@/lib/marketing/copy'
import { measurementMannequinSrc } from '@/lib/marketing/assets'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { LuxuryGradientField } from '../placeholders/LuxuryGradientField'

// Sprint W5-2 — Consultation & Measurement. The "Digital Body Profile" card
// (left) is one cohesive bordered object — mannequin photo on top, the
// stored-profile checklist below, both inside the same frame — rather than
// a separate image and separate list, per the brief's "visual-style card"
// requirement. Content column (right) carries the premium trust statement
// as a blockquote. Reusable standalone, same as ConsultationSection.
export function MeasurementSection() {
  return (
    <section id="measurement" aria-labelledby="measurement-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <article aria-label={measurementCopy.cardLabel} className="overflow-hidden rounded-sm border border-luxury-gold/30 bg-luxury-charcoal/60">
            <div className="relative aspect-[4/3] w-full">
              <LuxuryGradientField variant="c" />
              <Image
                src={measurementMannequinSrc}
                alt={measurementCopy.mannequinAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-6"
              />
            </div>
            <div className="border-t border-luxury-gold/[0.14] p-6">
              <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{measurementCopy.cardLabel}</p>
              <ul className="mt-5 flex flex-col gap-3">
                {measurementCopy.cardItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
                    <span className="font-luxury-sans text-sm text-luxury-ivory">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.1}>
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{measurementCopy.eyebrow}</p>
          <h2 id="measurement-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {measurementCopy.heading}
          </h2>
          <p className="mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">{measurementCopy.subheadline}</p>

          <blockquote className="mt-8 border-l-2 border-luxury-gold/40 pl-5">
            <p className="font-fraunces text-xl italic leading-snug text-luxury-ivory md:text-2xl">&ldquo;{measurementCopy.statement}&rdquo;</p>
          </blockquote>

          <MagneticButton href="/book-appointment" variant="primary" className="mt-8">
            {measurementCopy.cta}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
