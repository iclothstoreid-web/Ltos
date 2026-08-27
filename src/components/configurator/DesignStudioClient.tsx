'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ConfiguratorCatalog } from '@/lib/configurator/mapping'
import { trackConfiguratorOpened } from '@/lib/configurator/analytics'
import { trackConfiguratorStart, trackConfiguratorExit } from '@/lib/analytics/designStudioAnalytics'
import { trackFunnelStep } from '@/lib/analytics/funnel'
import { fetchWithTimeout, isOnline } from '@/lib/configurator/network'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useConfiguratorStore } from '@/stores/configurator-store'
import { ConfiguratorPanel } from './ConfiguratorPanel'
import { GarmentPreview } from './GarmentPreview'
import { PriceSummaryCard } from './PriceSummaryCard'
import { StickyCTA } from './StickyCTA'
import { EstimateSync } from './EstimateSync'

// Mobile + tablet only, and pulls in `vaul` — code-split out of the
// initial bundle (W2-5) so desktop visitors never download it. Sprint
// DS-UX only mounts it below xl (isDesktopLayout), so the desktop 3-zone
// aside is the sole option browser there; its trigger/overlay/content are
// `xl:hidden` too as a belt-and-braces guard.
const MobileConfiguratorDrawer = dynamic(() => import('./MobileConfiguratorDrawer').then((m) => m.MobileConfiguratorDrawer), {
  ssr: false,
})

// Composes the configurator into the responsive layout. Sprint DS-UX:
//   xl+     — 3 zones: option browser (~27%) · sticky preview (~52%) · sticky estimate (~21%)
//   md–xl   — sticky preview + estimate rail; options via the drawer
//   <md     — preview only; options via the drawer; StickyCTA for the total
// The desktop <aside> (and its ConfiguratorPanel subtree) is only mounted
// at xl, so tablet/mobile never pay for a hidden panel. Catalog fetch (GET
// /api/design/options), the config->estimate debounce (EstimateSync), and
// every store/analytics wire are all unchanged — this sprint is layout
// and card presentation only, no configurator business logic touched.
interface DesignStudioClientProps {
  // Sprint W3-4 §8 — Design Studio Preselection. Already-resolved
  // configurator option ids (see src/app/design-studio/page.tsx's
  // resolveInitialSelection), or null when there was no ?fabric=/&color=
  // in the URL, or it didn't resolve to anything in this catalog.
  initialFabricId?: string | null
  initialColorId?: string | null
}

export function DesignStudioClient({ initialFabricId = null, initialColorId = null }: DesignStudioClientProps) {
  const [catalog, setCatalog] = useState<ConfiguratorCatalog | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [retryNonce, setRetryNonce] = useState(0)
  // Sprint DS-UX — 3-zone desktop layout starts at xl. Below that the
  // option browser is the drawer only, so the desktop <aside> (and its
  // whole ConfiguratorPanel subtree) is never mounted on tablet/mobile —
  // `undefined` until mounted keeps SSR neutral.
  const isDesktopLayout = useMediaQuery('(min-width: 1280px)')
  const openedRef = useRef(false)
  const preselectedRef = useRef(false)
  const updateConfig = useConfiguratorStore((state) => state.updateConfig)
  const configRef = useRef(useConfiguratorStore.getState().config)
  useEffect(() => useConfiguratorStore.subscribe((state) => { configRef.current = state.config }), [])

  useEffect(() => {
    // Guards against React StrictMode's dev-only double-invoke firing this
    // twice on mount — harmless in production, but keeps the event genuinely
    // once-per-open even in dev.
    if (openedRef.current) return
    openedRef.current = true
    trackConfiguratorOpened()
    // Sprint W9-1 §6 — new taxonomy event, additive to the pre-existing
    // trackConfiguratorOpened() stub above (not a replacement — see
    // src/lib/analytics/designStudioAnalytics.ts's own comment).
    trackConfiguratorStart()
    // Sprint W9-1 §7 — Website Funnel's 'configurator' step.
    trackFunnelStep('configurator')
  }, [])

  // Sprint W9-1 §6 — "track exit step": fires configurator_exit on
  // unmount (navigating away) with whatever selections existed at that
  // moment. Known limitation: a session that just completed via
  // SaveDesignModal will also fire this shortly after — configurator_exit
  // and configurator_complete aren't mutually exclusive here, since
  // suppressing that would require passing completion state across two
  // independent, separately-mounted components. Documented in the sprint
  // report rather than worked around with a fragile cross-component flag.
  useEffect(() => {
    return () => {
      const config = configRef.current
      const totalOptionsSelected = [config.modelId, config.collarId, config.cuffId, config.fabricId, config.colorId, config.embroidery].filter(Boolean).length + (config.accessories.length > 0 ? 1 : 0)
      trackConfiguratorExit('unmount', totalOptionsSelected)
    }
  }, [])

  // Applies the deep-link preselection exactly once, as soon as the
  // resolved ids are available — doesn't wait on `catalog` since the ids
  // were already validated against it server-side. Store-level, not a
  // ConfiguratorPanel prop, so every consumer of useConfiguratorStore
  // (GarmentPreview, PriceSummaryCard, EstimateSync) sees it identically to
  // a real user selection, no workflow branching added anywhere else.
  useEffect(() => {
    if (preselectedRef.current) return
    if (!initialFabricId && !initialColorId) return
    preselectedRef.current = true
    updateConfig({
      ...(initialFabricId ? { fabricId: initialFabricId } : {}),
      ...(initialColorId ? { colorId: initialColorId } : {}),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFabricId, initialColorId])

  const retryCatalog = useCallback(() => setRetryNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setCatalogLoading(true)
    setCatalogError(null)

    fetchWithTimeout('/api/design/options')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: ConfiguratorCatalog) => {
        if (!cancelled) setCatalog(data)
      })
      .catch((err) => {
        if (cancelled) return
        const offline = !isOnline()
        setCatalogError(offline ? 'Anda sedang offline.' : err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [retryNonce])

  // Auto-retry once when connectivity comes back after an offline failure.
  useEffect(() => {
    if (!catalogError) return
    function handleOnline() {
      retryCatalog()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [catalogError, retryCatalog])

  return (
    // The configurator is embedded at the foot of the marketing page, under
    // a position:fixed Nav (~84px). The sticky preview/estimate columns and
    // the sticky category bar are all offset by top-[84px] to clear it; see
    // page.tsx's matching scroll-mt-[84px] on #the-studio.
    <div className="min-h-screen bg-luxury-navy-deep pb-24 xl:pb-0">
      {/* Desktop (xl+): LEFT ~27% option browser · CENTER ~52% preview (sticky) · RIGHT ~21% estimate (sticky).
          Tablet (md–xl): CENTER preview (sticky) + RIGHT estimate rail, options via drawer.
          Mobile (<md): preview only, options via drawer, StickyCTA for the running total. */}
      <div className="grid grid-cols-1 items-start md:grid-cols-[1fr_clamp(240px,25vw,308px)] xl:grid-cols-[minmax(336px,27%)_1fr_minmax(280px,21%)]">
        {isDesktopLayout && (
          <aside className="hidden xl:block xl:min-h-[calc(100dvh_-_84px)] xl:border-r xl:border-luxury-gold/10">
            <ConfiguratorPanel catalog={catalog} error={catalogError} loading={catalogLoading} onRetry={retryCatalog} />
          </aside>
        )}

        <main className="order-1 flex min-h-[72vh] items-stretch justify-center md:order-none md:sticky md:top-[84px] md:h-[calc(100dvh_-_84px)] md:min-h-0">
          <GarmentPreview catalog={catalog} error={catalogError} loading={catalogLoading} onRetry={retryCatalog} />
        </main>

        <aside className="order-2 hidden p-4 md:sticky md:top-[84px] md:block md:max-h-[calc(100dvh_-_84px)] md:overflow-y-auto md:border-l md:border-luxury-gold/10 xl:p-6">
          <PriceSummaryCard />
        </aside>
      </div>

      {/* Drawer trigger is cheap (vaul keeps its content unmounted until
          opened); hidden at xl where the aside takes over. */}
      {isDesktopLayout !== true && (
        <MobileConfiguratorDrawer catalog={catalog} loading={catalogLoading} error={catalogError} />
      )}
      <StickyCTA />
      <EstimateSync />
    </div>
  )
}
