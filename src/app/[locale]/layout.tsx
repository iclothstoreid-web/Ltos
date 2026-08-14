import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, isAppLocale } from '@/i18n/config'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// No <html>/<body> here — the single root <html> lives in src/app/layout.tsx
// (Next.js App Router only allows one), which reads the resolved locale via
// next-intl's getLocale() for the dynamic lang/dir attributes. This layout's
// only job is enabling per-locale static rendering (setRequestLocale) for
// everything under the public marketing surface.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!isAppLocale(params.locale)) notFound()
  setRequestLocale(params.locale)
  return children
}
