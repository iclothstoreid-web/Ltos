import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import { isRtlLocale } from '@/i18n/config'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LTOS — Local Tailor Operating System',
  description: 'Vertical Business Operating System for premium custom tailoring',
  manifest: '/manifest.json',
}

// LTOS Brand System Rollout — themeColor lives on `viewport`, not
// `metadata`, since Next.js 14. Walnut Atelier — Walnut Brown, the
// system's dominant primary (was Deep Espresso, pre-rebrand).
export const viewport: Viewport = {
  themeColor: '#6A4A34',
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
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body className={`${inter.className} bg-surface text-on-surface antialiased`}>
        {/* Sprint W9-1 §15 — root-level mount: GA4/Clarity loading,
            attribution capture, a baseline page_view on every route, and
            experiment context. Renders no visible UI itself — zero impact
            on any page's markup. Both loaders no-op until a real
            NEXT_PUBLIC_GA4_MEASUREMENT_ID / NEXT_PUBLIC_CLARITY_PROJECT_ID
            is set (see src/lib/analytics/constants.ts). */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
