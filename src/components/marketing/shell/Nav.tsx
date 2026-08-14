'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { navCopy } from '@/lib/marketing/copy'
import { Logo } from '@/components/brand/Logo'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

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
        {/* Brand System Upgrade — was h-6/30px (default-small per the
            brief), now the first, most dominant thing read in the bar,
            left-aligned consistently across breakpoints. */}
        <a href="/" aria-label={navCopy.brand} className="flex shrink-0 items-center">
          <Logo variant="horizontal" className="h-8 w-auto text-luxury-ivory md:h-10 lg:h-11" />
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {navCopy.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe transition-colors hover:text-luxury-gold"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/book-appointment"
          className="hidden cursor-pointer rounded-full border border-luxury-gold/50 px-5 py-2 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold transition hover:bg-luxury-gold hover:text-luxury-black hover:shadow-[0_0_16px_rgba(200,162,74,0.25)] md:inline-flex"
        >
          {navCopy.cta}
        </a>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center md:hidden"
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
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-luxury-navy-deep md:hidden"
          >
            {/* Brand System Upgrade — mobile drawer: py-3 (~44px, right at
                the floor) -> py-4 (~52px, matching MagneticButton's own
                comfortable touch target) plus more generous outer padding,
                per the brief's "drawer harus premium, padding lebih lega". */}
            <ul className="flex flex-col gap-1 px-6 pb-8 pt-2">
              {navCopy.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block min-h-[44px] py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-taupe"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/book-appointment"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-3 block min-h-[44px] rounded-full border border-luxury-gold/50 px-5 py-4 text-center font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold"
                >
                  {navCopy.cta}
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
