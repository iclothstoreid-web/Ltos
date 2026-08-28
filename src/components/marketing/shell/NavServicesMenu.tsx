'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

// National SEO (P0-3) — the "Layanan" navigation entry. A click-to-toggle
// disclosure (not a hover menu), so it works with keyboard and touch the
// same way and never traps focus.
//
// The link list is ALWAYS rendered in the DOM (toggled with the `hidden`
// attribute, not conditionally mounted) so every destination is a
// crawlable <a href> in the server HTML — discovery never depends on JS.
// The Footer's "Layanan" column carries the same links as the primary
// crawl path regardless.
const SERVICE_ITEMS = [
  { key: 'customThobeIndonesia', href: '/custom-thobe-indonesia' },
  { key: 'bespokeTailorIndonesia', href: '/bespoke-tailor-indonesia' },
  { key: 'jahitThobeBandung', href: '/jahit-thobe-bandung' },
  { key: 'tailorPremiumBandung', href: '/tailor-premium-bandung' },
  { key: 'bespokeTailorBandung', href: '/bespoke-tailor-bandung' },
  { key: 'locations', href: '/locations' },
] as const

interface NavServicesMenuProps {
  /** Rendered inline in the mobile drawer instead of as a positioned popover. */
  mobile?: boolean
  /** Called after a link is chosen (mobile: closes the drawer). */
  onNavigate?: () => void
}

export function NavServicesMenu({ mobile = false, onNavigate }: NavServicesMenuProps) {
  const t = useTranslations('nav.services')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const panelId = useId()

  useEffect(() => {
    if (mobile || !open) return
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [mobile, open])

  const handleNavigate = () => {
    setOpen(false)
    onNavigate?.()
  }

  const items = SERVICE_ITEMS.map((item) => (
    <li key={item.href}>
      <Link
        href={item.href}
        onClick={handleNavigate}
        className={
          mobile
            ? 'block min-h-[40px] py-3 font-luxury-sans text-xs uppercase tracking-[0.12em] text-luxury-taupe/90'
            : 'block rounded-sm px-3 py-2.5 font-luxury-sans text-[11px] uppercase tracking-[0.1em] text-luxury-taupe transition-colors hover:bg-luxury-charcoal/50 hover:text-luxury-gold'
        }
      >
        {t(`items.${item.key}`)}
      </Link>
    </li>
  ))

  if (mobile) {
    return (
      <div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-[44px] w-full items-center justify-between py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-taupe"
        >
          {t('label')}
          <span aria-hidden="true" className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
        </button>
        <ul id={panelId} hidden={!open} className="pl-3">
          {items}
        </ul>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe transition-colors hover:text-luxury-gold"
      >
        {t('label')}
        <span aria-hidden="true" className={`text-[0.7em] transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute left-1/2 top-full z-50 mt-4 w-60 -translate-x-1/2 rounded-sm border border-luxury-gold/[0.14] bg-luxury-navy-deep/95 p-2 backdrop-blur-md"
      >
        <ul>{items}</ul>
      </div>
    </div>
  )
}
