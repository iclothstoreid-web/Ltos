'use client'

import { usePathname } from '@/i18n/routing'
import { buildContentWhatsAppUrl, CONTENT_WHATSAPP_NUMBER } from '@/lib/content/whatsapp'
import { trackCTA } from '@/lib/analytics/cta'

const DEFAULT_MESSAGE = 'Halo Local Tailor, saya ingin konsultasi mengenai custom thobe.'

// Mobile-only collision: the W0 estimator result page pins its own
// WhatsApp CTA to the viewport bottom on mobile (ResultUnlockSection.tsx,
// `md:hidden`, full-width). Rather than computing a dynamic offset that
// would need to track that bar's exact height/safe-area padding forever,
// this route is the one place the global button hides on mobile — desktop
// is unaffected since that sticky bar never renders there, and every
// other public page keeps the button as normal. See ResultUnlockSection.tsx
// for the sticky bar this avoids stacking on top of.
const MOBILE_COLLISION_ROUTES = ['/free-body-profile-estimator/result']

// Sprint — Global Floating WhatsApp Chat CTA. Same fixed-bottom-right,
// wa.me-deep-link pattern already shipped twice (CityStickyWhatsApp.tsx,
// ServiceStickyWhatsApp.tsx), reusing the same buildContentWhatsAppUrl()
// helper and trackCTA() analytics convention — but mounted ONCE at the
// public [locale] layout instead of per-page, and using this sprint's own
// Walnut-dominant/brass-accent/white-icon treatment (distinct from those
// two components' gold-dominant look) since the brief asked for it
// explicitly for this cross-page entry point.
export function GlobalWhatsAppChat() {
  const pathname = usePathname()
  const whatsappUrl = buildContentWhatsAppUrl(CONTENT_WHATSAPP_NUMBER, DEFAULT_MESSAGE)
  const hideOnMobile = MOBILE_COLLISION_ROUTES.includes(pathname)

  function handleClick() {
    trackCTA('global_floating_whatsapp', pathname, 'floating_button')
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat dengan Tailor di WhatsApp"
      onClick={handleClick}
      className={`group fixed bottom-6 right-6 z-50 items-center justify-center rounded-full border border-luxury-gold/40 bg-luxury-navy-deep text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-luxury-gold/70 hover:shadow-[0_8px_28px_rgba(0,0,0,0.45),0_0_20px_rgba(200,162,74,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2 h-[52px] w-[52px] md:h-14 md:w-14 ${
        hideOnMobile ? 'hidden md:flex' : 'flex'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 md:h-7 md:w-7">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.92C21.96 6.45 17.5 2 12.04 2Zm0 18.14h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.55 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.25 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.9 2.4 1.02 2.57.12.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29Z" />
      </svg>

      {/* Desktop-only hover/focus tooltip — pure CSS, no JS state, no
          layout shift (absolutely positioned relative to this fixed
          button, never reflowing surrounding content). */}
      <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-luxury-charcoal px-3 py-1.5 font-luxury-sans text-xs text-luxury-ivory opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
        Chat dengan Tailor
      </span>
    </a>
  )
}
