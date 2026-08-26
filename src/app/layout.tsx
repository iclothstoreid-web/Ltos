import type { Metadata, Viewport } from 'next'
import { Inter, Caveat } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import { isRtlLocale } from '@/i18n/config'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
// LTOS Hero — Strict Visual Reference. The public marketing route group's
// headline (`font-fraunces` in tailwind.config.ts) has never actually had
// `--font-fraunces` defined anywhere on this route tree — every other
// place that variable name is set lives in an internal-app layout
// (journey/production/workspace), not here — so it silently fell back to
// the browser's generic serif the whole time. This is the one new font
// this task needs (the expressive, human headline/price-callout script);
// `--font-handwritten` is intentionally a new variable name rather than
// reusing `--font-fraunces`, so this fix stays scoped to the Hero's new
// script treatment and never risks changing any of the many other
// `font-fraunces` usages sitewide (see tailwind.config.ts's `handwritten` token).
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-handwritten' })

import { headers } from 'next/headers'
import { getBrandForRequestHost } from '@/lib/brand/resolver'
import { TARDA_CONFIG, LOCAL_TAILOR_CONFIG } from '@/lib/brand/config'

export async function generateMetadata(): Promise<Metadata> {
  // Attempt to read host from server headers — Next.js provides headers()
  // in server components. If unavailable, default to TARDA_CONFIG for dev.
  const h = headers()
  const host = h.get('host')
  const brand = getBrandForRequestHost(host)

  return {
    metadataBase: new URL('https://' + brand.canonicalDomain),
    title: brand.metadata?.title ?? 'LTOS',
    description: brand.metadata?.description ?? '',
    manifest: brand.assets?.manifest ?? '/manifest.json',
    openGraph: {
      title: brand.metadata?.title,
      description: brand.metadata?.description,
      images: brand.assets.ogImage ? [brand.assets.ogImage] : undefined,
    },
    icons: {
      icon: brand.assets.favicon ?? '/brand/icon-192.png',
      apple: brand.assets.favicon ?? '/brand/icon-192.png',
    },
  }
}

export const viewport: Viewport = {
  themeColor: TARDA_CONFIG.colors?.themeColor ?? '#6A4A34',
}

// Sprint W11.5 — the ONLY <html> in the app (App Router allows exactly
// one), shared by both the locale-routed public marketing surface and the
// unlocalized authenticated app (owner/workspace/fitter/inventory/
// command-center/production/journey/login). `lang`/`dir` come from
// next-intl's getLocale(), which reads the locale next-intl middleware
// resolved for this request (cookie/Accept-Language/path prefix) — for
// routes middleware never routes through next-intl (the auth-gated app),
// getLocale() falls back to the default locale (id), identical to this
// file's previous hardcoded lang="id".
//
// LTOS i18n fix — this only sets `lang`/`dir` correctly for the *initial*
// request. Root layout is shared by every route in the app (locale and
// non-locale alike), so Next.js's App Router preserves/never re-renders it
// across a client-side navigation between two locale routes — meaning
// these two values would otherwise silently go stale the moment a visitor
// used the language switcher, even though the rest of the page now updates
// correctly (see src/app/[locale]/layout.tsx and HtmlLangSync.tsx, which
// together own reactively keeping both the translated content and these
// two attributes in sync after this first paint). NextIntlClientProvider
// itself used to live here too — moved to [locale]/layout.tsx, the one
// layout that actually has `params.locale` as part of its own segment and
// therefore does get freshly re-rendered per locale.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr'

  // Resolve brand server-side and inject a small runtime signal so client
  // components can synchronously read the active brand without needing JS
  // to call any network APIs. This avoids hydration mismatch and keeps the
  // brand decision server-driven.
  const h = headers()
  const host = h.get('host')
  const { getBrandForRequestHost } = await import('@/lib/brand/resolver')
  const brand = getBrandForRequestHost(host)

  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.className} ${caveat.variable} bg-surface text-on-surface antialiased`}>
        {/* server-injected brand id for client components */}
        <script
          // small inline payload; intentionally minimal
          dangerouslySetInnerHTML={{ __html: `window.__LTOS_BRAND = ${JSON.stringify(brand.id)};` }}
        />

        {/* Sprint W9-1 §15 — root-level mount: GA4/Clarity loading,
            attribution capture, a baseline page_view on every route, and
            experiment context. Renders no visible UI itself — zero impact
            on any page's markup. Both loaders no-op until a real
            NEXT_PUBLIC_GA4_MEASUREMENT_ID / NEXT_PUBLIC_CLARITY_PROJECT_ID
            is set (see src/lib/analytics/constants.ts). */}
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  )
}
