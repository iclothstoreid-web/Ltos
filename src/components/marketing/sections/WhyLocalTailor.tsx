import { whyCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

export function WhyLocalTailor() {
  return (
    <section id="why" aria-labelledby="why-heading" className="bg-luxury-black px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{whyCopy.eyebrow}</p>
          <h2 id="why-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {whyCopy.heading}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-ivory/60">
            Bespoke Tailor builds a garment pattern unique to your body, unlike mass tailoring which adjusts a fixed template.
          </p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {whyCopy.columns.map((column, i) => (
            <Reveal
              as="li"
              key={column.title}
              delay={i * 0.1}
              className={`rounded-sm border p-8 ${
                column.elevated
                  ? 'border-luxury-gold/50 bg-luxury-charcoal shadow-[0_0_40px_rgba(201,162,75,0.12)]'
                  : 'border-luxury-ivory/10 bg-luxury-charcoal/40'
              }`}
            >
              <h3 className={`font-fraunces text-xl ${column.elevated ? 'text-luxury-gold' : 'text-luxury-ivory'}`}>
                {column.title}
              </h3>
              <p className="mt-3 font-luxury-sans text-sm text-luxury-ivory/60">{column.description}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
