import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import { locales, defaultLocale } from './config'

// localePrefix 'as-needed': default locale (id) renders unprefixed paths
// ("/", "/fabric") exactly like the site already did pre-i18n; every other
// locale gets a "/en", "/ar", ... prefix. Matches the brief's literal
// "Browser Indonesia -> default Bahasa Indonesia" (no /id prefix) behavior.
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
  },
})

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
