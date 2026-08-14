import { getExperiment } from './registry'
import { STORAGE_KEYS } from '@/lib/analytics/constants'

// Sprint W9-1 §10 — deterministic variant assignment. Same visitor always
// gets the same variant for a given experiment (bucketed by session id,
// persisted in localStorage so it's sticky across sessions too, not just
// within one) — no server round-trip, no new Supabase table, matching the
// same "pure client-side" scope as the attribution layer.

// djb2 — a small, well-known deterministic string hash. Good enough for
// bucketing (not cryptographic use), and dependency-free.
function hashString(input: string): number {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return hash >>> 0
}

type AssignmentCache = Record<string, string>

function readCache(): AssignmentCache {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.experimentAssignments)
    return raw ? (JSON.parse(raw) as AssignmentCache) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: AssignmentCache): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEYS.experimentAssignments, JSON.stringify(cache))
  } catch {
    // localStorage can throw when full/disabled — falling back to
    // re-computing the (still-deterministic) assignment next call is fine.
  }
}

/**
 * Returns the variant id this session is bucketed into for `experimentId`,
 * or null if the experiment doesn't exist or isn't 'running' (draft/paused/
 * completed experiments never bucket real traffic).
 */
export function getVariant(experimentId: string, sessionId: string): string | null {
  const experiment = getExperiment(experimentId)
  if (!experiment || experiment.status !== 'running' || experiment.variants.length === 0) return null
  if (!sessionId) return null

  const cache = readCache()
  const cached = cache[experimentId]
  if (cached && experiment.variants.some((v) => v.id === cached)) return cached

  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0)
  if (totalWeight <= 0) return null

  const bucket = hashString(`${experimentId}:${sessionId}`) % totalWeight
  let cursor = 0
  let assigned = experiment.variants[0].id
  for (const variant of experiment.variants) {
    cursor += variant.weight
    if (bucket < cursor) {
      assigned = variant.id
      break
    }
  }

  writeCache({ ...cache, [experimentId]: assigned })
  return assigned
}
