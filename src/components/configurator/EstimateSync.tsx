'use client'

import { useEffect, useRef } from 'react'
import { fetchEstimate } from '@/lib/configurator/client'
import { trackPriceEstimated } from '@/lib/configurator/analytics'
import { emptyEstimate } from '@/types/configurator'
import { useConfiguratorStore } from '@/stores/configurator-store'
import { useServiceLevelStore } from '@/stores/service-level-store'
import { useEstimateRetryStore } from '@/stores/estimate-retry-store'

const DEBOUNCE_MS = 400

// Non-rendering — isolates the config/serviceLevel -> estimate debounce
// effect so the layout shell never needs to subscribe to either and
// re-render on every selection change. Debounce/fetch/cache logic itself
// is unchanged since W2-3; `retryNonce` (W2-5) is the only addition — one
// extra dependency that re-runs this same effect body on demand, giving
// PriceSummaryCard's error state a working "Coba Lagi" button without a
// second copy of this fetch logic living anywhere else.
export function EstimateSync() {
  const config = useConfiguratorStore((s) => s.config)
  const setEstimate = useConfiguratorStore((s) => s.setEstimate)
  const serviceLevel = useServiceLevelStore((s) => s.serviceLevel)
  const retryNonce = useEstimateRetryStore((s) => s.nonce)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const hasSelection = config.modelId || config.fabricId || config.colorId || config.collarId || config.cuffId
    if (!hasSelection) {
      setEstimate(emptyEstimate(serviceLevel))
      return
    }

    setEstimate({ ...emptyEstimate(serviceLevel), status: 'calculating' })
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const estimate = await fetchEstimate(config, serviceLevel)
        setEstimate(estimate)
        trackPriceEstimated(config, estimate)
      } catch {
        setEstimate({ ...emptyEstimate(serviceLevel), status: 'error' })
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.modelId, config.collarId, config.cuffId, config.fabricId, config.colorId, config.pocketId, config.placketId, config.zigzagId, config.embroidery, config.accessories.join(','), serviceLevel, retryNonce])

  return null
}
