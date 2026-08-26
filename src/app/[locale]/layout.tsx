import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, isAppLocale } from '@/i18n/config'
import { HtmlLangSync } from '@/components/marketing/shell/HtmlLangSync'
import { GlobalWhatsAppChat } from '@/components/marketing/GlobalWhatsAppChat'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// No <html>/<body> here — the single root <html> lives in src/app/layout.tsx
// (Next.js App Router only allows one), which reads the resolved locale via
// next-intl's getLocale() for the dynamic lang/dir attributes on the
// *initial* request only — see HtmlLangSync.tsx for why that alone isn't
// enough and root layout no longer owns NextIntlClientProvider.
//
// LTOS i18n fix — NextIntlClientProvider now lives HERE instead of in root
// layout. This is the one layout in the tree that actually has
// `params.locale` as part of its own segment, so Next.js correctly
// re-renders it (fetching fresh messages) whenever the locale segment
// changes on a client-side navigation — unlike root layout, which is
// shared by every route (locale and non-locale alike) and is therefore
// preserved/never re-rendered across a locale-to-locale switch. Every
// `useTranslations()`/`useLocale()` call anywhere under the public site —
// Nav, Hero, every homepage section, footer — reads from this provider, so
// this is the single fix point rather than a per-component patch.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!isAppLocale(params.locale)) notFound()
  setRequestLocale(params.locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={params.locale} messages={messages}>
      <HtmlLangSync />
      {children}
      {/* Global Floating WhatsApp Chat CTA — mounted once here so it
          appears on every public marketing/customer-facing page (this is
          the only layout every route under [locale]/ shares) and never on
          the internal LTOS apps (owner/workspace/fitter/inventory/
          command-center/production/journey), which all live outside
          [locale] routing entirely per src/middleware.ts's own
          NO_LOCALE_PREFIXES list. */}
      <GlobalWhatsAppChat />
    </NextIntlClientProvider>
  )
}
