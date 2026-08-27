import type { DesignConfig, Estimate, ServiceLevel } from '@/types/configurator'

// Event API stub — no real GA4/GTM wiring yet ("Belum perlu GA4
// sungguhna" per the brief). Pushes to `window.dataLayer` when present
// (the standard GTM ingestion point) so a real GTM container can start
// picking these events up with zero code changes; otherwise just logs in
// dev. Every call site in this sprint goes through pushEvent() /
// the named trackX() wrappers below — nothing calls dataLayer directly.
//
// Sprint W9-1 — `window.dataLayer`/`window.gtag` are now declared once,
// canonically, in src/lib/analytics/ga4.ts (that module's loader shares
// this exact same array). Removed the duplicate `declare global` block
// that used to live here — TypeScript rejects two conflicting
// declarations of the same global interface member, and this file's own
// behavior (dataLayer.push of a plain `{event, ...payload}` object) is
// unchanged; it just no longer owns the type declaration.
function pushEvent(event: string, payload: Record<string, unknown> = {}): void {
  if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...payload })
  }
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[configurator:analytics] ${event}`, payload)
  }
}

export function trackConfiguratorOpened(): void {
  pushEvent('configurator_opened')
}

export function trackModelSelected(optionId: string, optionName: string): void {
  pushEvent('model_selected', { optionId, optionName })
}

export function trackCollarSelected(optionId: string, optionName: string): void {
  pushEvent('collar_selected', { optionId, optionName })
}

export function trackCuffSelected(optionId: string, optionName: string): void {
  pushEvent('cuff_selected', { optionId, optionName })
}

export function trackFabricSelected(optionId: string, optionName: string): void {
  pushEvent('fabric_selected', { optionId, optionName })
}

export function trackColorSelected(optionId: string, optionName: string): void {
  pushEvent('color_selected', { optionId, optionName })
}

export function trackPocketSelected(optionId: string, optionName: string): void {
  pushEvent('pocket_selected', { optionId, optionName })
}

export function trackPlacketSelected(optionId: string, optionName: string): void {
  pushEvent('placket_selected', { optionId, optionName })
}

export function trackZigzagSelected(optionId: string, optionName: string): void {
  pushEvent('zigzag_selected', { optionId, optionName })
}

export function trackEmbroideryAdded(optionId: string, optionName: string): void {
  pushEvent('embroidery_added', { optionId, optionName })
}

export function trackAccessoriesAdded(optionId: string, optionName: string): void {
  pushEvent('accessories_added', { optionId, optionName })
}

export function trackPriceEstimated(config: DesignConfig, estimate: Estimate): void {
  pushEvent('price_estimated', {
    modelId: config.modelId,
    serviceLevel: estimate.serviceLevel,
    total: estimate.total,
  })
}

export function trackServiceLevelChanged(from: ServiceLevel, to: ServiceLevel): void {
  pushEvent('service_level_changed', { from, to })
}

export function trackDesignSaved(designId: string, hasLead: boolean): void {
  pushEvent('design_saved', { designId, hasLead })
}

export function trackDesignShared(designId: string, method: 'native' | 'copy_link' | 'whatsapp' | 'telegram' | 'email'): void {
  pushEvent('design_shared', { designId, method })
}

export function trackConsultationStarted(designId?: string): void {
  pushEvent('consultation_started', { designId })
}
