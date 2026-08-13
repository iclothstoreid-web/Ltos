import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { CITY_BUSINESS, type CityConfig } from '@/lib/seo/cityConfig'
import { appendUtmNote, type UtmParams } from '@/lib/seo/utm'

interface CityHeroProps {
  city: CityConfig
  utm?: UtmParams
}

// Sprint W8-2/3 — renamed from LocationHero.tsx (W8-1), extended to render
// city.hero.keywordPhrases as a natural-language chip row beneath the
// headline/subheadline (already keyword-dense prose from cityConfig.ts)
// rather than stuffing them into the headline itself. Sprint W8-B adds
// `utm` — when the page was reached with utm_source/medium/campaign query
// params (e.g. from a Google Business Profile listing link), that
// attribution is appended to the WhatsApp message so it survives the
// handoff to WhatsApp.
export function CityHero({ city, utm }: CityHeroProps) {
  const whatsappMessage = appendUtmNote(`Halo Local Tailor, saya di ${city.city} dan ingin konsultasi custom thobe.`, utm ?? {})
  const whatsappUrl = buildContentWhatsAppUrl(CITY_BUSINESS.whatsappInternational, whatsappMessage)

  return (
    <section className="relative overflow-hidden bg-luxury-navy-deep px-6 py-24 md:px-10 md:py-32">
      <LuxuryGradientField variant="a" />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">{city.hero.eyebrow}</p>
          <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl md:text-6xl">
            {city.hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-luxury-sans text-base text-luxury-taupe md:text-lg">
            {city.hero.subheadline}
          </p>
        </Reveal>

        {city.hero.keywordPhrases.length > 0 && (
          <Reveal delay={0.05} className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {city.hero.keywordPhrases.map((phrase) => (
              <span
                key={phrase}
                className="rounded-full border border-luxury-gold/[0.14] px-4 py-1.5 font-luxury-sans text-[11px] uppercase tracking-[0.08em] text-luxury-gold/90"
              >
                {phrase}
              </span>
            ))}
          </Reveal>
        )}

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href="/design-studio" variant="primary">
            Design My Thobe
          </MagneticButton>
          <MagneticButton href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="ghost">
            Chat WhatsApp
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
