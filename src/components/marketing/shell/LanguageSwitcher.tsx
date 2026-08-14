'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { Globe, X } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/routing'
import { locales, localeLabels, type AppLocale } from '@/i18n/config'

// Sprint W11.5 — Task 3, Hockerty-style language selector: globe icon in
// the navbar opens a centered modal (not a dropdown) listing every locale
// in its own native script, current language highlighted, Walnut Atelier
// styling reused 1:1 from the existing Nav drawer (luxury-navy-deep panel,
// luxury-gold accents, font-luxury-sans). Deliberately NOT a
// react-google-translate widget — that's explicitly ruled out by the brief
// (it reflows/mistranslates the DOM instead of serving real localized
// routes+content).
export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const activeLocale = useLocale() as AppLocale
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('languageSwitcher')
  const tNav = useTranslations('nav')

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    dialogRef.current?.querySelector<HTMLElement>('[data-locale-option]')?.focus()
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  function selectLocale(locale: AppLocale) {
    setOpen(false)
    if (locale === activeLocale) return
    router.replace(pathname, { locale })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('openLabel')}
        className="flex h-11 w-11 cursor-pointer items-center justify-center text-luxury-ivory transition-colors hover:text-luxury-gold"
      >
        <Globe className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-black/70 backdrop-blur-sm px-6"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={t('modalTitle')}
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(event) => event.stopPropagation()}
                  className="w-full max-w-md rounded-2xl border border-luxury-gold/[0.18] bg-luxury-navy-deep p-8"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{tNav('languageSwitcher')}</p>
                      <h2 className="mt-2 font-luxury-serif text-xl text-luxury-ivory">{t('modalTitle')}</h2>
                      <p className="mt-1 font-luxury-sans text-xs text-luxury-taupe">{t('modalSubtitle')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label={t('close')}
                      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-luxury-taupe transition-colors hover:text-luxury-gold"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  <ul className="mt-6 space-y-1" role="listbox" aria-label={t('modalTitle')}>
                    {locales.map((locale) => {
                      const isActive = locale === activeLocale
                      return (
                        <li key={locale}>
                          <button
                            type="button"
                            data-locale-option
                            role="option"
                            aria-selected={isActive}
                            onClick={() => selectLocale(locale)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-left font-luxury-sans text-sm transition-colors ${
                              isActive
                                ? 'bg-luxury-gold/[0.12] text-luxury-gold'
                                : 'text-luxury-ivory hover:bg-luxury-gold/[0.06] hover:text-luxury-gold'
                            }`}
                          >
                            <span>{localeLabels[locale].native}</span>
                            {isActive && (
                              <span className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
                                {t('currentLanguage')}
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
