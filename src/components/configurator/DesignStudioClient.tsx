'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ConfiguratorCatalog } from '@/lib/configurator/mapping'
import { trackConfiguratorOpened } from '@/lib/configurator/analytics'
import { fetchWithTimeout, isOnline } from '@/lib/configurator/network'
import { useConfiguratorStore } from '@/stores/configurator-store'
import { ConfiguratorPanel } from './ConfiguratorPanel'
import { GarmentPreview } from './GarmentPreview'
import { PriceSummaryCard } from './PriceSummaryCard'
import { StickyCTA } from './StickyCTA'
import { EstimateSync } from './EstimateSync'

// Mobile-only and pulls in `vaul` — code-split out of the initial bundle
// (W2-5) so desktop visitors never download it. No loading fallback needed:
// its own trigger/overlay/content are all `md:hidden` and it renders
// nothing visible until the user taps the trigger.
const MobileConfiguratorDrawer = dynamic(() => import('./MobileConfiguratorDrawer').then((m) => m.MobileConfiguratorDrawer), {
  ssr: false,
})

// Composes the configurator into the responsive layout. Desktop keeps the
// exact W2-1 3-column grid (locked). Mobile drops the W2-1 inline/accordion
// panel in favor of a fullscreen preview + drawer trigger (W2-2) so the
// same ConfiguratorPanel content doesn't render twice on small screens.
// Catalog fetch (GET /api/design/options) is unchanged from W2-1 in
// contract; W2-5 adds a timeout, manual retry, and offline-aware messaging
// around the same fetch. The config->estimate debounce effect is unchanged
// too, just relocated into EstimateSync so this shell never subscribes to
// `config` itself.
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
  const openedRef = useRef(false)
  const preselectedRef = useRef(false)
  const updateConfig = useConfiguratorStore((state) => state.updateConfig)

  useEffect(() => {
    // Guards against React StrictMode's dev-only double-invoke firing this
    // twice on mount — harmless in production, but keeps the event genuinely
    // once-per-open even in dev.
    if (openedRef.current) return
    openedRef.current = true
    trackConfiguratorOpened()
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
    <div className="min-h-screen bg-luxury-navy-deep pb-24 md:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr_320px] md:items-start">
        <aside className="hidden md:order-1 md:block md:h-screen md:overflow-y-auto md:border-r md:border-luxury-gold/10">
          <ConfiguratorPanel catalog={catalog} error={catalogError} loading={catalogLoading} onRetry={retryCatalog} />
        </aside>

        <main className="order-1 flex min-h-[calc(100vh-5rem)] items-center justify-center md:order-2 md:h-screen md:min-h-0">
          <GarmentPreview catalog={catalog} error={catalogError} loading={catalogLoading} onRetry={retryCatalog} />
        </main>

        <aside className="order-3 hidden p-6 md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto">
          <PriceSummaryCard />
        </aside>
      </div>

      <MobileConfiguratorDrawer catalog={catalog} loading={catalogLoading} error={catalogError} />
      <StickyCTA />
      <EstimateSync />
    </div>
  )
}
