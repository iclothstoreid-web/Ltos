import { trackEvent } from './tracker'
import { GA4_EVENTS } from './events'

// Sprint W9-1 §6 — Design Studio Analytics. Distinct from, and additive
// to, the pre-existing src/lib/configurator/analytics.ts dataLayer-push
// stub (trackModelSelected/trackFabricSelected/etc., already wired into
// ConfiguratorPanel.tsx and friends) — that module isn't touched or
// replaced, per "jangan mengubah business workflow". These are new,
// separate functions firing this sprint's own §2 GA4 taxonomy
// (configurator_start/fabric_selected/collar_selected/cuff_selected/
// embroidery_selected/configurator_complete/configurator_exit) through
// the new trackEvent() pipeline (standard params, session_id, etc.) — the
// old stub's plain dataLayer.push has none of that. Both fire
// independently when wired into the same component; call sites should
// import this module with an explicit alias if a name collides with the
// old stub's (e.g. `trackFabricSelected`).

export function trackConfiguratorStart(): void {
  trackEvent(GA4_EVENTS.configuratorStart, {}, { pageType: 'configurator' })
}

export function trackFabricSelected(optionId: string, optionName: string): void {
  trackEvent(GA4_EVENTS.fabricSelected, { option_id: optionId, option_name: optionName }, { pageType: 'configurator' })
}

export function trackCollarSelected(optionId: string, optionName: string): void {
  trackEvent(GA4_EVENTS.collarSelected, { option_id: optionId, option_name: optionName }, { pageType: 'configurator' })
}

export function trackCuffSelected(optionId: string, optionName: string): void {
  trackEvent(GA4_EVENTS.cuffSelected, { option_id: optionId, option_name: optionName }, { pageType: 'configurator' })
}

export function trackEmbroiderySelected(optionId: string, optionName: string): void {
  trackEvent(GA4_EVENTS.embroiderySelected, { option_id: optionId, option_name: optionName }, { pageType: 'configurator' })
}

/** `totalOptionsSelected` — the brief's own required "total options selected" metric, computed by the caller (it knows the full DesignConfig shape; this module intentionally doesn't import configurator types to stay decoupled). */
export function trackConfiguratorComplete(totalOptionsSelected: number): void {
  trackEvent(GA4_EVENTS.configuratorComplete, { total_options_selected: totalOptionsSelected }, { pageType: 'configurator' })
}

export function trackConfiguratorExit(step: string, totalOptionsSelected: number): void {
  trackEvent(GA4_EVENTS.configuratorExit, { exit_step: step, total_options_selected: totalOptionsSelected }, { pageType: 'configurator' })
}
