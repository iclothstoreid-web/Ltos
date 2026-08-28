import { getTranslations } from 'next-intl/server'
import { BRAND } from '@/lib/brand/config'
import { Logo } from '@/components/brand/Logo'
import { Link } from '@/i18n/routing'

// National SEO (P0-3) — commercial column: the two national pillars, the
// three highest-intent Bandung service pages, and the locations hub. Gives
// these pages a sitewide crawlable inbound link (the audit found them
// orphaned from nav/footer/homepage).
const SERVICE_LINKS = [
  { key: 'customThobeIndonesia', href: '/custom-thobe-indonesia' },
  { key: 'bespokeTailorIndonesia', href: '/bespoke-tailor-indonesia' },
  { key: 'bespokeTailorBandung', href: '/bespoke-tailor-bandung' },
  { key: 'jahitThobeBandung', href: '/jahit-thobe-bandung' },
  { key: 'tailorPremiumBandung', href: '/tailor-premium-bandung' },
  { key: 'locations', href: '/locations' },
] as const

const EXPLORE_LINKS = [
  { key: 'designStudio', href: '/design-studio' },
  { key: 'fabrics', href: '/fabric' },
  { key: 'gallery', href: '/gallery' },
  { key: 'journal', href: '/journal' },
  { key: 'knowledge', href: '/knowledge' },
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

export async function Footer() {
  const t = await getTranslations('footer')

  const columns = [
    { title: t('columns.services'), links: SERVICE_LINKS },
    { title: t('columns.explore'), links: EXPLORE_LINKS },
    { title: t('columns.studio'), links: STUDIO_LINKS },
    { title: t('columns.sizeGuide'), links: SIZE_GUIDE_LINKS },
  ]

  // LTOS is single-brand (Local Tailor). Tagline + legal line read through
  // next-intl so they stay translated on every locale.
  const taglineText = t('taglineFallback')
  const year = new Date().getFullYear()
  const legalText = t('legalWithBrand', { year, brand: BRAND.displayName })

  return (
    // Walnut Atelier rebrand — bg-luxury-charcoal (Smoked Walnut), not the
    // page's own luxury-navy-deep (Warm Walnut): the footer's taupe/gold
    // text only reached 2.2-2.7:1 contrast against Warm Walnut (Lighthouse
    // caught this), failing WCAG AA's 4.5:1. Smoked Walnut is exactly the
    // brief's own "Panel, card, sidebar, modal" color — the footer is one
    // of those, distinct from the page's main background — and restores
    // 4.8:1+ for the taupe text without changing any text color.
    <footer className="border-t border-luxury-gold/[0.14] bg-luxury-charcoal px-6 py-16 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="horizontalTagline" title={BRAND.displayName} className="h-10 w-auto text-luxury-ivory" />
          <p className="mt-3 max-w-xs font-luxury-sans text-sm text-luxury-taupe">{taglineText}</p>
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
