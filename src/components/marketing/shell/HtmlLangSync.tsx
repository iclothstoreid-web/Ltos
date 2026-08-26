'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { isRtlLocale } from '@/i18n/config'

// LTOS i18n fix — root cause: src/app/layout.tsx (the one shared <html>,
// required by App Router, wrapping both the locale-routed public site and
// the non-locale internal apps) used to own NextIntlClientProvider. Next.js
// never re-renders a layout that's shared by the current and target route
// on a client-side navigation — and root layout is shared by literally
// every route — so switching locales via the language switcher changed the
// URL but the provider's `locale`/`messages` stayed frozen at whatever the
// very first hard load resolved. Every `useTranslations()`/`useLocale()`
// call anywhere in the tree (Nav, Hero, every homepage section) read that
// same frozen context, which is why nothing but the URL ever updated.
//
// The real fix is moving NextIntlClientProvider into src/app/[locale]/
// layout.tsx (see that file), which *does* have `params.locale` as part of
// its own segment and therefore correctly re-renders per locale. That
// alone fixes every next-intl-driven string. It does not fix
// `<html lang>`/`dir>`, though — those two attributes are still set by the
// outer root layout's own `getLocale()` call, once, server-side, and outer
// root layout still never re-renders on locale-to-locale navigation for
// the reason above. This component is the reactive counterpart: mounted
// inside the now-correctly-updating inner provider, it re-applies
// `lang`/`dir` imperatively whenever `useLocale()` actually changes, so
// `<html>` never drifts out of sync with the locale actually being
// rendered (Arabic in particular needs `dir="rtl"` applied, not just
// translated strings).
export function HtmlLangSync() {
  const locale = useLocale()

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr'
  }, [locale])

  return null
}
