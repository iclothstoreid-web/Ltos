import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'

export interface ExperienceCardItem {
  title: string
  eyebrow?: string
  description: string
  details: string[]
  audience?: string[]
}

interface ExperienceCardsProps {
  heading: string
  subheadline?: string
  items: ExperienceCardItem[]
}

// Sprint Y §Y-9 — reusable "N ways to use X" card grid. Generic props (no
// Design Studio-specific naming inside the component itself) so it can be
// reused for a future pillar page without modification — this sprint's
// only caller is "Tiga Cara Menggunakan Design Studio" on /design-studio.
export function ExperienceCards({ heading, subheadline, items }: ExperienceCardsProps) {
  return (
    <section aria-labelledby="experience-cards-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <h2 id="experience-cards-heading" className="font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {heading}
          </h2>
          {subheadline && <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">{subheadline}</p>}
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 0.1}>
              <article className="h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-8">
                {item.eyebrow && (
                  <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">{item.eyebrow}</p>
                )}
                <h3 className="mt-2 font-fraunces text-xl text-luxury-ivory">{item.title}</h3>
                <p className="mt-3 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{item.description}</p>

                <ul className="mt-5 space-y-2">
                  {item.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-[9px] h-px w-3 flex-shrink-0 bg-luxury-gold/70" />
                      <span className="font-luxury-sans text-xs leading-relaxed text-luxury-taupe">{detail}</span>
                    </li>
                  ))}
                </ul>

                {item.audience && item.audience.length > 0 && (
                  <div className="mt-6 border-t border-luxury-gold/[0.10] pt-5">
                    <p className="font-luxury-sans text-[10px] uppercase tracking-[0.1em] text-luxury-gold">Cocok Untuk</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.audience.map((tag) => (
                        <span key={tag} className="rounded-full border border-luxury-gold/[0.14] px-3 py-1 font-luxury-sans text-[11px] text-luxury-taupe">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
