const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Brand & Location Correction — Bogor -> Bandung URL renames (see
// src/lib/seo/serviceConfig.ts, cityConfig.ts, categories.ts, and
// designStudio.ts for the corresponding data/route changes). These old
// paths were public and may already be indexed, so they 301 to their
// renamed equivalent instead of 404ing. `LOCALE_PREFIXES` mirrors
// src/i18n/config.ts's locales with localePrefix 'as-needed' (id
// unprefixed, every other locale prefixed) — kept as a literal list here
// since next.config.js can't import the TS source.
const LOCALE_PREFIXES = ['', '/en', '/ar', '/fr', '/ja', '/de']

// Sprint W6R.2 — '/locations/bogor' removed from this list. It used to
// mean "the old, mislabeled Bandung location page" and correctly redirected
// to '/locations/bandung'. As of W6R.2, '/locations/bogor' is a real,
// distinct city service-area page (src/lib/seo/cityConfig.ts's own BOGOR
// entry) — leaving this redirect in would have permanently 301'd that new
// page straight into Bandung's, silently shadowing it (caught by this
// sprint's own smoke test before deploy).
const RENAMED_PATHS = [
  ['/bespoke-tailor-bogor', '/bespoke-tailor-bandung'],
  ['/tailor-premium-bogor', '/tailor-premium-bandung'],
  ['/custom-baju-koko-bogor', '/custom-baju-koko-bandung'],
  ['/jahit-thobe-bogor', '/jahit-thobe-bandung'],
  ['/tailor-baju-umroh-bogor', '/tailor-baju-umroh-bandung'],
  ['/knowledge/bogor', '/knowledge/bandung'],
  ['/knowledge/design-studio/bespoke-tanpa-harus-datang-ke-bogor', '/knowledge/design-studio/bespoke-tanpa-harus-datang-ke-bandung'],
  ['/knowledge/design-studio/layanan-home-visit-bogor', '/knowledge/design-studio/layanan-home-visit-bandung'],
  // LEGACY INBOUND REDIRECT (retained): the only remaining "tarda" string in
  // runtime config. This is a 301 SOURCE for an old, possibly-indexed public
  // URL slug — it points AT the current Local Tailor page, never the other
  // way. Never canonical, never in the sitemap, never linked internally.
  // Kept so old inbound links / search results don't 404. LTOS is otherwise
  // single-brand Local Tailor (Tarda removed).
  ['/knowledge/design-studio/apa-itu-design-studio-tarda', '/knowledge/design-studio/apa-itu-design-studio-local-tailor'],
]

function buildRenameRedirects() {
  const redirects = []
  for (const prefix of LOCALE_PREFIXES) {
    for (const [from, to] of RENAMED_PATHS) {
      redirects.push({ source: `${prefix}${from}`, destination: `${prefix}${to}`, permanent: true })
    }
    // /knowledge/bogor/[slug] — article slugs themselves are unchanged
    // (custom-thobe, bespoke-tailor, wedding-tailor, umrah-thobe), only
    // the category segment was renamed.
    redirects.push({ source: `${prefix}/knowledge/bogor/:slug`, destination: `${prefix}/knowledge/bandung/:slug`, permanent: true })
  }
  return redirects
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
  },
  async redirects() {
    return buildRenameRedirects()
  },
}
module.exports = withNextIntl(nextConfig)
