import { trackEvent } from './tracker'
import { GA4_EVENTS } from './events'
import { SCROLL_THRESHOLDS, SCROLL_THROTTLE_MS } from './constants'
import type { PageType } from './types'

const THRESHOLD_EVENT_MAP: Record<(typeof SCROLL_THRESHOLDS)[number], string> = {
  25: GA4_EVENTS.scroll25,
  50: GA4_EVENTS.scroll50,
  75: GA4_EVENTS.scroll75,
  100: GA4_EVENTS.scroll100,
}

function getScrollPercent(): number {
  const doc = document.documentElement
  const scrollTop = window.scrollY || doc.scrollTop
  const scrollHeight = doc.scrollHeight - doc.clientHeight
  if (scrollHeight <= 0) return 100
  return Math.min(100, Math.round((scrollTop / scrollHeight) * 100))
}

// Sprint W9-1 §3 — reusable scroll depth tracker. Returns a cleanup
// function so callers (a client component's useEffect) can unmount
// cleanly. Throttled via a simple timer flag (SCROLL_THROTTLE_MS) rather
// than a debounce, since scroll-depth firing wants to catch the moment a
// threshold is crossed, not just the final resting scroll position.
export function initScrollTracking(pageType: PageType): () => void {
  if (typeof window === 'undefined') return () => {}

  const fired = new Set<number>()
  let throttled = false

  function handleScroll() {
    if (throttled) return
    throttled = true
    window.setTimeout(() => {
      throttled = false
    }, SCROLL_THROTTLE_MS)

    const percent = getScrollPercent()
    for (const threshold of SCROLL_THRESHOLDS) {
      if (percent >= threshold && !fired.has(threshold)) {
        fired.add(threshold)
        trackEvent(THRESHOLD_EVENT_MAP[threshold], { scroll_depth: threshold }, { pageType })
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  // Fire once immediately in case the page is short enough that the
  // initial paint already satisfies a threshold (e.g. 100% on a very
  // short page) without the user ever scrolling.
  handleScroll()

  return () => window.removeEventListener('scroll', handleScroll)
}
