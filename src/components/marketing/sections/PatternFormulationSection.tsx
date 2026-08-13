import { patternFormulationCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { LuxuryGradientField } from '../placeholders/LuxuryGradientField'
import { LinenTexture } from '../placeholders/LinenTexture'
import { PatternDraftMotif } from '../placeholders/PatternDraftMotif'

type PatternFormulationSectionProps = {
  // Reusable across landing pages, same override pattern as
  // BespokeProcessSection's secondaryHref. Sprint W5-10 — repointed from
  // /#craftsmanship to /#why: WhyLocalTailor's own "Bespoke Tailor" column
  // already describes pattern formulation ("a pattern formulated from your
  // measurements alone"), and this also breaks up what was a back-to-back
  // /#craftsmanship repeat with the ProductionSection right after it.
  ctaHref?: string
}

// Sprint W5-3 — Pattern Formulation & Production. Visual-left / content-right,
// matching ConsultationSection's editorial-slot convention — here filled by
// PatternDraftMotif (illustrated, since no real drafting photography exists)
// instead of a photo.
export function PatternFormulationSection({ ctaHref = '/#why' }: PatternFormulationSectionProps = {}) {
  return (
    <section id="pattern-formulation" aria-labelledby="pattern-formulation-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
          <div role="img" aria-label={patternFormulationCopy.motifAlt} className="absolute inset-0">
            <LuxuryGradientField variant="a" />
            <LinenTexture opacity={0.14} idSuffix="pattern-formulation" />
            <PatternDraftMotif idSuffix="pattern-formulation" className="h-[85%] w-[85%]" />
          </div>
          <div aria-hidden="true" className="absolute inset-0 ring-1 ring-inset ring-luxury-gold/10" />
        </Reveal>

        <Reveal delay={0.1}>
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{patternFormulationCopy.eyebrow}</p>
          <h2 id="pattern-formulation-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {patternFormulationCopy.heading}
          </h2>
          <p className="mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">{patternFormulationCopy.subheadline}</p>

          <article aria-label={patternFormulationCopy.determinesLabel} className="mt-8 rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6">
            <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{patternFormulationCopy.determinesLabel}</p>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {patternFormulationCopy.determines.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
                  <span className="font-luxury-sans text-sm text-luxury-ivory">{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <blockquote className="mt-8 border-l-2 border-luxury-gold/40 pl-5">
            <p className="font-fraunces text-xl italic leading-snug text-luxury-ivory md:text-2xl">&ldquo;{patternFormulationCopy.statement}&rdquo;</p>
          </blockquote>

          <MagneticButton href={ctaHref} variant="primary" className="mt-8">
            {patternFormulationCopy.cta}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
