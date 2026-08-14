import { CLARITY_PROJECT_ID, isHeatmapEnabled } from './constants'

// Sprint W9-1 §9 — Heatmap Integration. Chose Microsoft Clarity over
// PostHog (the brief offers either): Clarity is a single small script tag
// with no SDK/dependency to add to package.json, it's free with no event
// volume cap, and — most relevantly to §9's own requirement list — rage
// click, dead click, excessive scrolling, and session replay are all
// captured automatically by Clarity itself once the snippet loads. There
// is no separate "implement rage-click detection" step: hand-rolling that
// heuristic here would duplicate what Clarity's own, more battle-tested
// detector already does, for zero additional benefit. See
// docs/analytics/GA4_EVENT_TAXONOMY.md's heatmap section for how to read
// those signals once a real Clarity project exists.
//
// No project has been provisioned yet (see constants.ts — same
// TODO_PLACEHOLDER_ENV convention as GA4_MEASUREMENT_ID); this loader
// no-ops until NEXT_PUBLIC_CLARITY_PROJECT_ID is set.

declare global {
  interface Window {
    clarity?: {
      (...args: unknown[]): void
      q?: unknown[]
    }
  }
}

let injected = false

export function loadClarity(): void {
  if (typeof window === 'undefined') return
  if (injected) return
  if (!isHeatmapEnabled()) return

  injected = true

  // Equivalent of Microsoft's own inline snippet
  // (c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)}), written
  // as a named function so it's readable without minification.
  function clarity(...args: unknown[]) {
    clarity.q = clarity.q || []
    clarity.q.push(args)
  }
  clarity.q = [] as unknown[]
  window.clarity = clarity

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`
  document.head.appendChild(script)
}

/**
 * Tags the current Clarity session with a custom label (e.g. an active
 * experiment variant) — surfaces as a filterable session-replay attribute
 * in the Clarity dashboard. No-ops if Clarity isn't loaded.
 */
export function setClarityTag(key: string, value: string): void {
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') return
  window.clarity('set', key, value)
}
