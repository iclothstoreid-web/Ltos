'use client'

import { useEffect } from 'react'
import { initScrollTracking } from '@/lib/analytics/scroll'
import type { PageType } from '@/lib/analytics/types'

// Sprint W9-1 §3 — mountable scroll-depth tracker. Renders no UI (`return
// null`); drop it anywhere in a page's tree to get 25/50/75/100% scroll
// events for that page without touching that page's own markup.
export function PageScrollTracker({ pageType }: { pageType: PageType }) {
  useEffect(() => initScrollTracking(pageType), [pageType])
  return null
}
