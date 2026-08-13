import { craftsmanshipCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { WorkshopPhotoPlaceholder } from '../placeholders/WorkshopPhotoPlaceholder'

const VARIANTS = ['a', 'b', 'c', 'a'] as const

export function CraftsmanshipProcess() {
  return (
    <section
      id="craftsmanship"
      aria-labelledby="craftsmanship-heading"
      className="bg-luxury-navy px-6 py-24 md:px-10 [content-visibility:auto] [contain-intrinsic-size:auto_550px]"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{craftsmanshipCopy.eyebrow}</p>
          <h2 id="craftsmanship-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {craftsmanshipCopy.heading}
          </h2>
        </Reveal>

        <ol className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-6">
          <div aria-hidden="true" className="absolute left-1/2 top-10 hidden h-px w-[calc(100%-8rem)] -translate-x-1/2 bg-luxury-gold/20 md:block" />
          {craftsmanshipCopy.steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.12} className="relative text-center">
              <div className="mx-auto w-24">
                <WorkshopPhotoPlaceholder alt={`${step.title} step illustration`} variant={VARIANTS[i]} idSuffix={`workshop-photo-${i}`} />
              </div>
              <p className="mt-5 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-2 font-fraunces text-lg text-luxury-ivory">{step.title}</h3>
              <p className="mt-2 font-luxury-sans text-xs text-luxury-taupe">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
