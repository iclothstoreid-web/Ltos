import { getTranslations } from 'next-intl/server'
import { CITY_BUSINESS } from '@/lib/seo/cityConfig'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { Logo } from '@/components/brand/Logo'
import { Link } from '@/i18n/routing'

// Sprint W8-B — NAP Consistency System. This is the only place the footer
// reads business identity from — CITY_BUSINESS in src/lib/seo/cityConfig.ts
// is the single source of truth already used by every location page's
// schema, metadata, and CTAs (Sprint W8-1/8-2/8-3). No address/phone string
// is ever re-typed here.
// TARDA-only: consumed solely inside the `brand.id === 'tarda'` branch
// below (the WhatsApp CTA that renders exclusively for the Tarda brand).
// Kept gated at the point of use so no Tarda-identity string is
// reachable from a Local Tailor render.
const TARDA_FOOTER_WHATSAPP_MESSAGE = 'Halo Tarda, saya ingin bertanya lebih lanjut.'

const EXPLORE_LINKS = [
  { key: 'designStudio', href: '/design-studio' },
  { key: 'fabrics', href: '/fabric' },
  { key: 'gallery', href: '/gallery' },
  { key: 'journal', href: '/journal' },
  { key: 'knowledge', href: '/knowledge' },
  { key: 'locations', href: '/locations' },
] as const

const STUDIO_LINKS = [
  { key: 'bookAppointment', href: '/book-appointment' },
  { key: 'faq', href: '/#faq' },
  { key: 'contact', href: '/contact' },
] as const

const SIZE_GUIDE_LINKS = [
  { key: 'freeSizeCheck', href: '/free-body-profile-estimator' },
  { key: 'sizeChartThobe', href: '/cek-ukuran-thobe' },
  { key: 'menThobeSize', href: '/ukuran-thobe-pria' },
  { key: 'howToMeasure', href: '/cara-mengukur-thobe' },
] as const

import { headers } from 'next/headers'
import { getBrandForRequestHost } from '@/lib/brand/resolver'

export async function Footer() {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')

  // Resolve brand from the current request host and render Tarda's
  // city-specific business details only when the resolved brand is TARDA.
  // For other brands (e.g., Local Tailor) do not show Bogor nor the
  // Tarda-specific tagline; instead use the brand's metadata/displayName.
  const host = headers().get('host')
  const brand = getBrandForRequestHost(host ?? undefined)

  const whatsappUrl =
    brand.id === 'tarda'
      ? buildContentWhatsAppUrl(CITY_BUSINESS.whatsappInternational, TARDA_FOOTER_WHATSAPP_MESSAGE)
      : undefined
  const columns = [
    { title: t('columns.explore'), links: EXPLORE_LINKS },
    { title: t('columns.studio'), links: STUDIO_LINKS },
    { title: t('columns.sizeGuide'), links: SIZE_GUIDE_LINKS },
  ]

  // LTOS i18n — the non-tarda branch used to bypass next-intl entirely
  // (brand.metadata?.description / a hardcoded "All rights reserved."
  // template), which is why the footer stayed in English on every locale
  // for the Local Tailor brand. Both branches now read through `t()`;
  // taglineFallback carries the same text brand.metadata.description
  // already had (English source), and legalWithBrand parameterizes the
  // brand name into the same "All rights reserved." wording `legal` uses.
  const taglineText = brand.id === 'tarda' ? t('tagline') : t('taglineFallback')
  const year = new Date().getFullYear()
  const legalText = brand.id === 'tarda' ? t('legal', { year }) : t('legalWithBrand', { year, brand: brand.displayName })

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
          <Logo variant="horizontalTagline" title={brand.displayName} className="h-10 w-auto text-luxury-ivory" />
          <p className="mt-3 max-w-xs font-luxury-sans text-sm text-luxury-taupe">{taglineText}</p>

          {brand.id === 'tarda' && (
            <>
              <address className="mt-4 max-w-xs font-luxury-sans text-xs not-italic leading-relaxed text-luxury-taupe">
                {CITY_BUSINESS.streetAddress}
              </address>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-luxury-sans text-xs text-luxury-taupe hover:text-luxury-gold"
                >
                  WhatsApp: +{CITY_BUSINESS.whatsappInternational}
                </a>
              )}
            </>
          )}
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            {/* text-luxury-ivory, not gold: only 3.98:1 against the footer's
                Smoked Walnut bg, short of WCAG's 4.5:1 for 12px text — and
                per the brief's own rules gold is the CTA accent, ivory is
                primary text, which a column heading label actually is. */}
            <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-ivory">{column.title}</p>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-luxury-sans text-sm text-luxury-taupe hover:text-luxury-ivory">
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className="mx-auto mt-16 max-w-7xl font-luxury-sans text-xs text-luxury-taupe">
        {legalText}
      </p>
    </footer>
  )
}
