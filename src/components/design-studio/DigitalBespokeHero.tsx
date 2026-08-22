import Image from 'next/image'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { LuxuryGradientField } from '@/components/marketing/placeholders/LuxuryGradientField'
import { garmentPhotos } from '@/lib/marketing/assets'
import { buildContentWhatsAppUrl, CONTENT_WHATSAPP_NUMBER } from '@/lib/content/whatsapp'

const VIDEO_CALL_MESSAGE = 'Halo Tarda, saya ingin booking Free Video Call untuk konsultasi Digital Bespoke Tailoring.'

// Sprint Y §Y-1 — Hero for the Digital Bespoke Tailoring pillar page.
// Headline/subheadline/CTA copy verbatim from the brief. Hero visual reuses
// garmentPhotos.navy (real editorial photography already used elsewhere on
// the site, e.g. GallerySection) rather than commissioning or fabricating
// new imagery for a single hero.
export function DigitalBespokeHero() {
  const whatsappUrl = buildContentWhatsAppUrl(CONTENT_WHATSAPP_NUMBER, VIDEO_CALL_MESSAGE)

  return (
    <header className="relative overflow-hidden bg-luxury-navy-deep px-6 py-20 md:px-10 md:py-28">
      <LuxuryGradientField variant="a" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <p className="font-luxury-sans text-xs uppercase tracking-[0.3em] text-luxury-gold">Design Studio — Bespoke dari Mana Saja</p>
          <h1 className="mt-6 font-fraunces text-4xl leading-[1.08] text-luxury-ivory sm:text-5xl md:text-6xl">
            Bespoke Tailoring Tanpa Batas Jarak
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-luxury-sans text-base text-luxury-taupe md:text-lg lg:mx-0">
            Rancang thobe Anda dari mana saja melalui video call, Design Studio, dan layanan home visit. Pengalaman yang
            sama seperti berada langsung di showroom Tarda.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
            <MagneticButton href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary">
              Book Free Video Call
            </MagneticButton>
            <MagneticButton href="#the-studio" variant="ghost">
              Explore Design Studio
            </MagneticButton>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-sm lg:mx-auto">
            <Image
              src={garmentPhotos.navy}
              alt="Bespoke thobe navy, presented on a mannequin, editorial studio photography"
              fill
              sizes="(min-width: 1024px) 30vw, 80vw"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>
      </div>
    </header>
  )
}
