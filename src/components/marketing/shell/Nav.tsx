'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import BrandLogo from '@/components/brand/BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const t = useTranslations('nav')

  const links = [
    { key: 'designStudio', href: '/design-studio' },
    { key: 'fabrics', href: '/fabric' },
    { key: 'knowledge', href: '/knowledge' },
    { key: 'gallery', href: '/gallery' },
    { key: 'journal', href: '/journal' },
    { key: 'locations', href: '/locations' },
  ] as const

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
        scrolled ? 'bg-luxury-navy-deep/[0.78] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        {/* Restore the prior Local Tailor logo scale; keep the navbar height
            and spacing unchanged while avoiding the Tarda-only size bump. */}
        <Link href="/" aria-label={t('brand')} className="flex shrink-0 items-center">
          <BrandLogo variant="horizontal" className="h-auto w-[140px] object-contain md:w-[150px]" />
        </Link>

        {/* Brand System Upgrade — bumped md:(768px) -> lg:(1024px): the
            bigger logo (now up to 44px tall / ~175px wide, was 30px/~120px)
            no longer leaves enough room for all 6 links + the CTA button at
            tablet-portrait widths (iPad's 820px wrapped "Design Studio" and
            clipped "Book Appointment" off-screen — a real overflow bug
            caught during verification). Tablets now get the same clean
            drawer as mobile instead of a cramped inline row, matching the
            brief's own "tablet isn't just a shrunk desktop" instruction. */}
        <ul className="hidden items-center gap-10 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe transition-colors hover:text-luxury-gold"
              >
                {t(`links.${link.key}`)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-1 lg:flex">
          <LanguageSwitcher />
          <Link
            href="/book-appointment"
            className="cursor-pointer rounded-full border border-luxury-gold/50 px-5 py-2 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold transition hover:bg-luxury-gold hover:text-luxury-black hover:shadow-[0_0_16px_rgba(200,162,74,0.25)]"
          >
            {t('cta')}
          </Link>
        </div>

        <div className="flex items-center lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center"
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 top-0 h-px w-6 bg-luxury-ivory transition-transform ${drawerOpen ? 'translate-y-2 rotate-45' : ''}`}
              />
              <span className={`absolute left-0 top-2 h-px w-6 bg-luxury-ivory transition-opacity ${drawerOpen ? 'opacity-0' : ''}`} />
              <span
                className={`absolute left-0 top-4 h-px w-6 bg-luxury-ivory transition-transform ${drawerOpen ? '-translate-y-2 -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-luxury-navy-deep lg:hidden"
          >
            {/* Brand System Upgrade — mobile drawer: py-3 (~44px, right at
                the floor) -> py-4 (~52px, matching MagneticButton's own
                comfortable touch target) plus more generous outer padding,
                per the brief's "drawer harus premium, padding lebih lega". */}
            <ul className="flex flex-col gap-1 px-6 pb-8 pt-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block min-h-[44px] py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-taupe"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/book-appointment"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-3 block min-h-[44px] rounded-full border border-luxury-gold/50 px-5 py-4 text-center font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold"
                >
                  {t('cta')}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
