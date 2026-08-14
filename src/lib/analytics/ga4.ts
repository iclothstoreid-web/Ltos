import { GA4_MEASUREMENT_ID, isAnalyticsEnabled } from './constants'

// Sprint W9-1 §1 — GA4 loader. Pure module, no React dependency, so it can
// be called once from a small client-side effect (see
// src/components/analytics/AnalyticsProvider.tsx) without pulling
// next/script into the lib layer itself.

// Canonical `window.dataLayer`/`window.gtag` declaration for the whole
// app — src/lib/configurator/analytics.ts (a pre-existing dataLayer-push
// stub, predating this sprint) shares this same array, so `dataLayer` is
// declared optional here to match its own defensive `Array.isArray(...)`
// runtime check: it may genuinely be undefined until loadGA4() below runs
// (or forever, if analytics is disabled). Only one `declare global` for
// this interface may exist in the whole program — see that file's comment.
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

let injected = false

/** Injects the gtag.js script + inline init exactly once. No-ops if analytics is disabled (see constants.ts's isAnalyticsEnabled) or already injected. */
export function loadGA4(): void {
  if (typeof window === 'undefined') return
  if (injected) return
  if (!isAnalyticsEnabled()) return

  injected = true

  const dataLayer = window.dataLayer || (window.dataLayer = [])
  window.gtag = function gtag(...args: unknown[]) {
    dataLayer.push(args)
  }
  window.gtag('js', new Date())
  // send_page_view: false — page_view is fired explicitly by tracker.ts's
  // trackPageView() with this app's own standard params attached, rather
  // than GA4's automatic pageview (which wouldn't carry session_id/
  // customer_token/city/etc.).
  window.gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`
  document.head.appendChild(script)
}

/** Low-level gtag call. Prefer tracker.ts's trackEvent() for actual event firing — this is exported for the rare case a caller needs a raw gtag command (e.g. `config`, `consent`). */
export function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag(...args)
}
