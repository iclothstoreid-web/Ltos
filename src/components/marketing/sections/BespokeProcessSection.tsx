import { bespokeProcessCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

type BespokeProcessSectionProps = {
  // Reusable across landing pages, not just the homepage — callers that
  // don't live at "/" can override where "View Full Bespoke Process"
  // points. Defaults to the homepage's existing Craftsmanship section
  // (id="craftsmanship" in CraftsmanshipProcess.tsx), the closest existing
  // "full process" detail already on the page — no new route required.
  secondaryHref?: string
}

// Sprint W5-1 — Process Storytelling. The homepage's trust/conversion
// backbone: a full Consultation-to-Delivery timeline placed right after the
// configurator teaser, ahead of fabric/gallery detail. Desktop renders as a
// connected horizontal timeline (md: 3-col step cards, lg+: single-row
// 6-col with a connecting rail); mobile collapses to a vertical timeline
// with its own rail on the left. Reuses the site's existing Reveal /
// MagneticButton / GoldAccentLine primitives rather than a new animation
// or CTA treatment.
export function BespokeProcessSection({ secondaryHref = '/#craftsmanship' }: BespokeProcessSectionProps = {}) {
  return (
    <section
      id="bespoke-process"
      aria-labelledby="bespoke-process-heading"
      className="bg-luxury-navy-deep px-6 py-24 md:px-10 [content-visibility:auto] [contain-intrinsic-size:auto_760px]"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{bespokeProcessCopy.eyebrow}</p>
          <h2 id="bespoke-process-heading" className="mt-3 font-fraunces text-3xl leading-tight text-luxury-ivory md:text-4xl">
            {bespokeProcessCopy.heading}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{bespokeProcessCopy.subheadline}</p>
        </Reveal>

        <ol className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-6 lg:gap-y-0">
          {/* Vertical rail — mobile/tablet only, aligned to the 44px badge's center (22px). */}
          <div aria-hidden="true" className="absolute bottom-2 left-[22px] top-2 w-px bg-luxury-gold/20 md:hidden" />
          {/* Horizontal rail — single-row desktop only, inset so it runs center-badge to center-badge. */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[22px] hidden h-px w-[calc(100%-10rem)] -translate-x-1/2 bg-luxury-gold/20 lg:block"
          />

          {bespokeProcessCopy.steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.08} className="relative flex gap-5 md:block md:gap-0">
              <span
                aria-hidden="true"
                className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-luxury-gold bg-luxury-navy-deep font-fraunces text-sm text-luxury-gold md:mx-auto md:mb-5"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <article className="flex-1 rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-5 md:text-center">
                <h3 className="font-fraunces text-lg text-luxury-ivory">{step.title}</h3>
                <p className="mt-2 font-luxury-sans text-xs text-luxury-taupe">{step.description}</p>
              </article>
            </Reveal>
          ))}
        </ol>

        <Reveal
          delay={bespokeProcessCopy.steps.length * 0.08 + 0.1}
          className="mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <MagneticButton href="/book-appointment" variant="primary">
            {bespokeProcessCopy.primaryCta}
          </MagneticButton>
          <MagneticButton href={secondaryHref} variant="ghost">
            {bespokeProcessCopy.secondaryCta}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
