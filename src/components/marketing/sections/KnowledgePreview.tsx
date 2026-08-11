import { knowledgeCopy } from '@/lib/marketing/copy'
import { Reveal } from '../shell/Reveal'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'

export function KnowledgePreview() {
  return (
    <section id="knowledge" aria-labelledby="knowledge-heading" className="bg-luxury-black px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-xl">
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{knowledgeCopy.eyebrow}</p>
          <h2 id="knowledge-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {knowledgeCopy.heading}
          </h2>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {knowledgeCopy.cards.map((card, i) => (
            <Reveal
              as="li"
              key={card.title}
              delay={i * 0.08}
              className="group cursor-pointer rounded-sm border border-luxury-ivory/10 p-6 transition hover:border-luxury-gold/40"
            >
              <h3 className="font-fraunces text-lg text-luxury-ivory group-hover:text-luxury-gold">{card.title}</h3>
              <p className="mt-3 font-luxury-sans text-xs text-luxury-ivory/50">{card.description}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
