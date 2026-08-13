import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { buildContentWhatsAppUrl, CONTENT_WHATSAPP_NUMBER } from '@/lib/content/whatsapp'

interface BookingCTAProps {
  heading: string
  body: string
  whatsappMessage: string
  secondaryHref?: string
  secondaryLabel?: string
}

// Sprint Y §Y-9 — reusable closing booking CTA. Generic props so it can
// close any future pillar page, not just /design-studio.
export function BookingCTA({ heading, body, whatsappMessage, secondaryHref = '#the-studio', secondaryLabel = 'Explore Design Studio' }: BookingCTAProps) {
  const whatsappUrl = buildContentWhatsAppUrl(CONTENT_WHATSAPP_NUMBER, whatsappMessage)

  return (
    <section aria-labelledby="booking-cta-heading" className="bg-luxury-navy px-6 py-24 text-center md:px-10">
      <div className="mx-auto max-w-xl">
        <Reveal>
          <h2 id="booking-cta-heading" className="font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">{body}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary">
            Book Free Video Call
          </MagneticButton>
          <MagneticButton href={secondaryHref} variant="ghost">
            {secondaryLabel}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
