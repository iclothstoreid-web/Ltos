'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/tracker'
import type { PageType } from '@/lib/analytics/types'

interface EventOnMountProps {
  eventName: string
  params?: Record<string, string | number | boolean | undefined>
  pageType?: PageType
}

// Sprint W9-1 §15 — mountable one-shot event tracker for pages that just
// need "fire event X when this page loads" (lookbook_open,
// measurement_started, order_confirmed, etc.) without a page-specific
// component. Renders no UI.
export function EventOnMount({ eventName, params = {}, pageType }: EventOnMountProps) {
  useEffect(() => {
    trackEvent(eventName, params, { pageType })
    // Fire once per mount only — params/pageType are captured at mount
    // time, not re-fired on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
