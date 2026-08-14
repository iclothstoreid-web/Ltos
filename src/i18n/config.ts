// Sprint W11.5 — Internationalization & Global SEO. Single source of truth
// for the locale set. Scope is deliberately the PUBLIC marketing/SEO
// surface only (see src/app/[locale]/) — the authenticated operational app
// (owner/fitter/inventory/workspace/command-center) and the QR-token
// production/journey flows stay outside locale routing entirely, since
// their URLs are load-bearing for middleware auth rules and kiosk/customer
// token links (see src/middleware.ts's own comments).
export const locales = ['id', 'en', 'ar', 'fr', 'ja', 'de'] as const

export type AppLocale = (typeof locales)[number]

// Bahasa Indonesia stays the unprefixed default (matches the pre-i18n
// site exactly — "/" already served Indonesian copy), per the brief's own
// "Browser Indonesia -> default Bahasa Indonesia" behavior spec.
export const defaultLocale: AppLocale = 'id'

export const rtlLocales: AppLocale[] = ['ar']

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as AppLocale)
}

// BCP-47 tags used for hreflang, <html lang>, and JSON-LD inLanguage.
// Deliberately region-qualified only where the brief's own worked example
// asked for it (id-ID/en-US/fr-FR/ja-JP/de-DE) — ar stays unqualified
// since Arabic-speaking search traffic here isn't region-specific.
export const localeToHreflang: Record<AppLocale, string> = {
  id: 'id-ID',
  en: 'en-US',
  ar: 'ar',
  fr: 'fr-FR',
  ja: 'ja-JP',
  de: 'de-DE',
}

export const localeLabels: Record<AppLocale, { native: string; english: string }> = {
  id: { native: 'Bahasa Indonesia', english: 'Indonesian' },
  en: { native: 'English', english: 'English' },
  ar: { native: 'العربية', english: 'Arabic' },
  fr: { native: 'Français', english: 'French' },
  ja: { native: '日本語', english: 'Japanese' },
  de: { native: 'Deutsch', english: 'German' },
}

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value)
}
