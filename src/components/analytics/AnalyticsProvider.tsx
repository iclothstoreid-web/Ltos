'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { loadGA4 } from '@/lib/analytics/ga4'
import { loadClarity } from '@/lib/analytics/heatmap'
import { captureAttribution } from '@/lib/analytics/attribution'
import { trackPageView } from '@/lib/analytics/tracker'
import { ExperimentProvider } from '@/lib/experiments/context'
import type { PageType } from '@/lib/analytics/types'

interface AnalyticsProviderProps {
  children: React.ReactNode
  pageType?: PageType
}

// Sprint W9-1 §15 — the one mount point every tracked page wraps itself
// with (or, more commonly, the root layout wraps everything with) to get
// GA4 + Clarity loaded, attribution captured, page_view fired, and
// experiment variants resolved — without any page needing to call four
// separate setup functions itself. Both loaders already no-op when their
// respective env var isn't set (see constants.ts), so mounting this
// unconditionally on every page is safe even before a real GA4/Clarity
// project exists.
export function AnalyticsProvider({ children, pageType = 'other' }: AnalyticsProviderProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Read directly from window.location rather than next/navigation's
    // useSearchParams() — that hook requires a Suspense boundary around
    // every consumer or it de-opts static rendering up to the nearest one,
    // and this provider is meant to wrap the entire app (including ~175+
    // statically-generated Knowledge/Fabric/Location pages) at the root
    // layout. A one-time read inside this client-only effect needs none of
    // that — it never affects the server-rendered/static output.
    loadGA4()
    loadClarity()
    captureAttribution(new URLSearchParams(window.location.search))
    trackPageView(pageType)
    // Deliberately only re-runs when pathname changes, not on every
    // query-string edit within the same page — page_view should fire once
    // per navigation, not once per filter update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return <ExperimentProvider>{children}</ExperimentProvider>
}
