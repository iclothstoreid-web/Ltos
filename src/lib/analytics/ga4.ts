// Sprint W9-1 §1 — GA4 low-level gtag() wrapper. The dataLayer/gtag/
// gtag.js bootstrap itself (previously this module's loadGA4(), called
// from a client-only effect) now lives server-side as next/script
// beforeInteractive blocks in src/app/layout.tsx, so the tag is present
// in the initial HTML response for Google's own installation
// detection/Tag Assistant — see that file's comment. This module now only
// exports the typed call-through tracker.ts's trackEvent() uses to reach
// the window.gtag the layout's bootstrap already defined.

// Canonical `window.dataLayer`/`window.gtag` declaration for the whole
// app — src/lib/configurator/analytics.ts (a pre-existing dataLayer-push
// stub, predating this sprint) shares this same array, so `dataLayer` is
// declared optional here to match its own defensive `Array.isArray(...)`
// runtime check: it's undefined until the root layout's bootstrap script
// runs (or forever, if analytics is disabled). Only one `declare global`
// for this interface may exist in the whole program — see that file's comment.
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

/** Low-level gtag call. Prefer tracker.ts's trackEvent() for actual event firing — this is exported for the rare case a caller needs a raw gtag command (e.g. `config`, `consent`). */
export function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag(...args)
}
