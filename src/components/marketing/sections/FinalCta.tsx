import { finalCtaCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { LinenTexture } from '../placeholders/LinenTexture'

// W1 REBALANCE — bookends the Hero: same Navy gradient family (not the
// espresso LuxuryGradientField this used before espresso was demoted to a
// card/panel-only accent), so the page's closing moment reads as "back into
// the same navy world," not a different background.
export function FinalCta() {
  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden bg-luxury-navy-deep px-6 py-28 text-center md:px-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(11,22,40,0.55)_0%,_rgba(10,19,34,0.35)_45%,_transparent_75%)]"
      />
      <LinenTexture opacity={0.1} />

      <Reveal className="relative mx-auto max-w-2xl">
        <h2 id="final-cta-heading" className="font-fraunces text-4xl text-luxury-ivory md:text-5xl">
          {finalCtaCopy.heading}
        </h2>
        <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{finalCtaCopy.body}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <MagneticButton href="/#configurator" variant="primary">
            {finalCtaCopy.primaryCta}
          </MagneticButton>
          <MagneticButton href="/#appointment" variant="ghost">
            {finalCtaCopy.secondaryCta}
          </MagneticButton>
          <MagneticButton href="#" variant="ghost">
            {finalCtaCopy.tertiaryCta}
          </MagneticButton>
        </div>

        <p className="mt-8 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold/80">{finalCtaCopy.urgency}</p>
      </Reveal>
    </section>
  )
}
