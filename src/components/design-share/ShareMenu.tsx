'use client'

import { useEffect, useRef, useState } from 'react'
import { trackDesignShared } from '@/lib/configurator/analytics'

interface ShareMenuProps {
  designId: string
  url: string
  title: string
}

const CLICK_LOCKOUT_MS = 600

// navigator.share (native OS share sheet) when available — single button,
// per the brief. Falls back to Copy Link / WhatsApp / Telegram / Email
// otherwise.
export function ShareMenu({ designId, url, title }: ShareMenuProps) {
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [copied, setCopied] = useState(false)
  // Guards against a rapid double-tap firing design_shared twice for one
  // intended share (W2-5) — analytics.ts's event shapes themselves are
  // untouched, this only debounces how often this component calls them.
  const lockedUntilRef = useRef(0)

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  function withLockout<T extends unknown[]>(fn: (...args: T) => void) {
    return (...args: T) => {
      const now = Date.now()
      if (now < lockedUntilRef.current) return
      lockedUntilRef.current = now + CLICK_LOCKOUT_MS
      fn(...args)
    }
  }

  const handleNativeShare = withLockout(async () => {
    try {
      await navigator.share({ title, url })
      trackDesignShared(designId, 'native')
    } catch {
      // user cancelled the share sheet — not an error worth surfacing
    }
  })

  const handleCopyLink = withLockout(async () => {
    await navigator.clipboard.writeText(url)
    trackDesignShared(designId, 'copy_link')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  })

  const handleWhatsApp = withLockout(() => {
    trackDesignShared(designId, 'whatsapp')
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank', 'noopener,noreferrer')
  })

  const handleTelegram = withLockout(() => {
    trackDesignShared(designId, 'telegram')
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer')
  })

  const handleEmail = withLockout(() => {
    trackDesignShared(designId, 'email')
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
  })

  if (canNativeShare) {
    return (
      <button
        type="button"
        onClick={handleNativeShare}
        className="w-full cursor-pointer rounded-full border border-luxury-gold/30 py-3 font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold transition hover:bg-luxury-gold/10"
      >
        Bagikan Desain
      </button>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={handleCopyLink}
        className="cursor-pointer rounded-full border border-luxury-gold/30 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.08em] text-luxury-gold transition hover:bg-luxury-gold/10"
      >
        {copied ? 'Disalin!' : 'Copy Link'}
      </button>
      <button
        type="button"
        onClick={handleWhatsApp}
        className="cursor-pointer rounded-full border border-luxury-gold/30 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.08em] text-luxury-gold transition hover:bg-luxury-gold/10"
      >
        WhatsApp
      </button>
      <button
        type="button"
        onClick={handleTelegram}
        className="cursor-pointer rounded-full border border-luxury-gold/30 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.08em] text-luxury-gold transition hover:bg-luxury-gold/10"
      >
        Telegram
      </button>
      <button
        type="button"
        onClick={handleEmail}
        className="cursor-pointer rounded-full border border-luxury-gold/30 py-3 font-luxury-sans text-[10px] uppercase tracking-[0.08em] text-luxury-gold transition hover:bg-luxury-gold/10"
      >
        Email
      </button>
    </div>
  )
}
