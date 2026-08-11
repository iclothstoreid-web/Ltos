import Image from 'next/image'
import { fabricCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { FabricCardPlaceholder } from '../placeholders/FabricCardPlaceholder'

const VARIANTS = ['a', 'b', 'c', 'a'] as const

export function FabricHighlight() {
  return (
    <section id="fabric" aria-labelledby="fabric-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-xl">
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{fabricCopy.eyebrow}</p>
          <h2 id="fabric-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {fabricCopy.heading}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{fabricCopy.body}</p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fabricCopy.cards.map((card, i) => (
            <Reveal as="li" key={card.name} delay={i * 0.08}>
              {card.photo ? (
                <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-sm">
                  <Image
                    src={card.photo}
                    alt={`${card.name} fabric swatch, close-up weave photography`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-luxury-gold/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:animate-light-sweep group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-luxury-gold/10 transition group-hover:ring-luxury-gold/40" />
                </div>
              ) : (
                <FabricCardPlaceholder alt={`${card.name} fabric swatch`} variant={VARIANTS[i]} />
              )}
              <h3 className="mt-4 font-fraunces text-lg text-luxury-ivory">{card.name}</h3>
              <p className="font-luxury-sans text-xs text-luxury-taupe">{card.origin}</p>
              <p className="mt-1 font-luxury-sans text-xs text-luxury-taupe">{card.trait}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.2} className="mt-12">
          <MagneticButton href="/#configurator" variant="ghost">
            {fabricCopy.cta}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
