'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getOrCreateSessionId } from '@/lib/analytics/tracker'
import { getRunningExperiments } from './registry'
import { getVariant } from './assignment'

// Sprint W9-1 §10 — experiment context. Resolves every 'running'
// experiment's variant for the current session once, on mount, and makes
// them available via useExperimentVariant() so components don't each
// re-derive session id / re-read localStorage independently. Assignment
// only happens client-side (session id + localStorage are both
// browser-only), so this deliberately renders `{}` on the server and
// hydrates real assignments after mount — the same
// render-nothing-then-hydrate pattern every session-dependent client
// component on this site already uses.
type VariantMap = Record<string, string | null>

const ExperimentContext = createContext<VariantMap>({})

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [variants, setVariants] = useState<VariantMap>({})

  useEffect(() => {
    const sessionId = getOrCreateSessionId()
    if (!sessionId) return

    const resolved: VariantMap = {}
    for (const experiment of getRunningExperiments()) {
      resolved[experiment.id] = getVariant(experiment.id, sessionId)
    }
    setVariants(resolved)
  }, [])

  return <ExperimentContext.Provider value={variants}>{children}</ExperimentContext.Provider>
}

/** Returns this session's variant for `experimentId`, or null before hydration / if the experiment isn't running. Pair with trackExperimentExposure() at the point the variant is actually rendered. */
export function useExperimentVariant(experimentId: string): string | null {
  const variants = useContext(ExperimentContext)
  return variants[experimentId] ?? null
}
