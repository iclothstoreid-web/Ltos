import { trustBarCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { AnimatedCounter } from './AnimatedCounter'

export function TrustBar() {
  return (
    <section id="trust" aria-labelledby="trust-heading" className="border-y border-luxury-gold/[0.14] bg-luxury-navy px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 id="trust-heading" className="text-center font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">
            {trustBarCopy.heading}
          </h2>
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {trustBarCopy.counters.map((counter, i) => (
            <Reveal as="li" key={counter.label} delay={i * 0.1} className="text-center">
              <AnimatedCounter value={counter.value} suffix={counter.suffix} />
              <p className="mt-2 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe">{counter.label}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
