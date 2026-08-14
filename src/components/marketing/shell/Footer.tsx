import { footerCopy, navCopy } from '@/lib/marketing/copy'
import { CITY_BUSINESS } from '@/lib/seo/cityConfig'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { Logo } from '@/components/brand/Logo'

// Sprint W8-B — NAP Consistency System. This is the only place the footer
// reads business identity from — CITY_BUSINESS in src/lib/seo/cityConfig.ts
// is the single source of truth already used by every location page's
// schema, metadata, and CTAs (Sprint W8-1/8-2/8-3). No address/phone string
// is ever re-typed here.
const FOOTER_WHATSAPP_MESSAGE = 'Halo Local Tailor, saya ingin bertanya lebih lanjut.'

export function Footer() {
  const whatsappUrl = buildContentWhatsAppUrl(CITY_BUSINESS.whatsappInternational, FOOTER_WHATSAPP_MESSAGE)

  return (
    // Walnut Atelier rebrand — bg-luxury-charcoal (Smoked Walnut), not the
    // page's own luxury-navy-deep (Warm Walnut): the footer's taupe/gold
    // text only reached 2.2-2.7:1 contrast against Warm Walnut (Lighthouse
    // caught this), failing WCAG AA's 4.5:1. Smoked Walnut is exactly the
    // brief's own "Panel, card, sidebar, modal" color — the footer is one
    // of those, distinct from the page's main background — and restores
    // 4.8:1+ for the taupe text without changing any text color.
    <footer className="border-t border-luxury-gold/[0.14] bg-luxury-charcoal px-6 py-16 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="horizontalTagline" title={navCopy.brand} className="h-10 w-auto text-luxury-ivory" />
          <p className="mt-3 max-w-xs font-luxury-sans text-sm text-luxury-taupe">{footerCopy.tagline}</p>
          <address className="mt-4 max-w-xs font-luxury-sans text-xs not-italic leading-relaxed text-luxury-taupe">
            {CITY_BUSINESS.streetAddress}
          </address>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-luxury-sans text-xs text-luxury-taupe hover:text-luxury-gold"
          >
            WhatsApp: +{CITY_BUSINESS.whatsappInternational}
          </a>
        </div>

        {footerCopy.columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{column.title}</p>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="font-luxury-sans text-sm text-luxury-taupe hover:text-luxury-ivory">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className="mx-auto mt-16 max-w-7xl font-luxury-sans text-xs text-luxury-taupe">{footerCopy.legal}</p>
    </footer>
  )
}
