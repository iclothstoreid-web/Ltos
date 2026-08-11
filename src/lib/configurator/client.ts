'use client'

import type { DesignConfig, Estimate, ServiceLevel } from '@/types/configurator'
import { fetchWithTimeout } from './network'

export interface DesignLead {
  nama: string
  email: string
  whatsapp?: string
}

// Thin client-side wrapper around the POST /api/design/save contract — real
// as of W2-4 (see src/app/api/design/save/route.ts / session.ts). Returns
// the signed-slug shareUrl; there's nothing else to fetch afterward.
export async function saveDesignConfig(
  config: DesignConfig,
  serviceLevel: ServiceLevel,
  lead?: DesignLead
): Promise<{ designId: string; shareUrl: string }> {
  const res = await fetchWithTimeout('/api/design/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, serviceLevel, lead }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function estimateKey(config: DesignConfig, serviceLevel: ServiceLevel): string {
  return JSON.stringify({ ...config, accessories: [...config.accessories].sort(), serviceLevel })
}

// Client-side request dedup — collapses concurrent calls for the same
// (config, serviceLevel) into one in-flight fetch (e.g. React effect
// re-fires, rapid service-level toggling) on top of the server's own
// caching in src/lib/configurator/estimate.ts.
const inFlight = new Map<string, Promise<Estimate>>()

export async function fetchEstimate(config: DesignConfig, serviceLevel: ServiceLevel): Promise<Estimate> {
  const key = estimateKey(config, serviceLevel)
  const pending = inFlight.get(key)
  if (pending) return pending

  const promise = fetchWithTimeout('/api/design/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, serviceLevel }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, promise)
  return promise
}
