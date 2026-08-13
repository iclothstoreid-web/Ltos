import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { LOCATION_BUSINESS, type LocationConfig } from '@/lib/seo/locations'

interface LocationHeroProps {
  location: LocationConfig
}

// Sprint W8-1 — location-page hero. Same visual language as the homepage
// Hero (LuxuryGradientField backdrop, Reveal, MagneticButton) but without
// the WebGL/three.js depth field — that's a homepage-specific investment
// (see HomePage.tsx's P0/P1 perf history), not warranted for a template
// rendered 5x with mostly-copy differences per city.
export function LocationHero({ location }: LocationHeroProps) {
  const whatsappMessage = `Halo Local Tailor, saya di ${location.cityName} dan ingin konsultasi custom thobe.`
  const whatsappUrl = buildContentWhatsAppUrl(LOCATION_BUSINESS.whatsappInternational, whatsappMessage)

  return (
    <section className="relative overflow-hidden bg-luxury-navy-deep px-6 py-24 md:px-10 md:py-32">
      <LuxuryGradientField variant="a" />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">{location.heroEyebrow}</p>
          <h1 className="mt-6 font-fraunces text-4xl leading-[1.1] text-luxury-ivory sm:text-5xl md:text-6xl">
            {location.heroHeadline}
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-luxury-sans text-base text-luxury-taupe md:text-lg">
            {location.heroSubheadline}
          </p>
        </Reveal>

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
