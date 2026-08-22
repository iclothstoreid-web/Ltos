import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { LOCAL_TAILOR_CITATION } from '@/lib/seo/citations'
import { CITY_BUSINESS, CITY_MAPS_URL } from '@/lib/seo/cityConfig'

interface ContactCardProps {
  whatsappMessage?: string
}

// Sprint W8-B §4 — reusable contact card (address, WhatsApp, hours). Reads
// exclusively from CITY_BUSINESS/LOCAL_TAILOR_CITATION — the same NAP
// source every location page's schema and CTAs already use — so this card
// can be dropped onto any page without re-typing the address.
export function ContactCard({ whatsappMessage = 'Halo Tarda, saya ingin bertanya lebih lanjut.' }: ContactCardProps) {
  const whatsappUrl = buildContentWhatsAppUrl(CITY_BUSINESS.whatsappInternational, whatsappMessage)

  return (
    <div className="rounded-sm border border-luxury-gold/[0.14] bg-luxury-charcoal/40 p-8">
      <GoldAccentLine className="mb-4" />
      <h3 className="font-fraunces text-xl text-luxury-ivory">{CITY_BUSINESS.name}</h3>

      <dl className="mt-6 space-y-5">
        <div>
          <dt className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Alamat</dt>
          <dd className="mt-1 font-luxury-sans text-sm leading-relaxed text-luxury-taupe">{CITY_BUSINESS.streetAddress}</dd>
        </div>

        <div>
          <dt className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">WhatsApp</dt>
          <dd className="mt-1">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-luxury-sans text-sm text-luxury-taupe hover:text-luxury-gold">
              +{CITY_BUSINESS.whatsappInternational}
            </a>
          </dd>
        </div>

        <div>
          <dt className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Jam Operasional</dt>
          <dd className="mt-1 space-y-1">
            {LOCAL_TAILOR_CITATION.hoursOfOperation.map((entry) => (
              <p key={entry.day} className="font-luxury-sans text-sm text-luxury-taupe">
                {entry.day}: {entry.hours}
              </p>
            ))}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <MagneticButton href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="primary" className="w-full sm:w-auto">
          Chat on WhatsApp
        </MagneticButton>
        <MagneticButton href={CITY_MAPS_URL} target="_blank" rel="noopener noreferrer" variant="ghost" className="w-full sm:w-auto">
          Get Directions
        </MagneticButton>
      </div>
    </div>
  )
}
