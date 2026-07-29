// Render Cache (Task 6) — DNA-State-keyed cache of full /api/design/render
// success responses. Module-scope Map: lives for this server process only
// (survives across requests in dev / a single running instance, resets on
// redeploy/cold start) — deliberately no Redis/DB dependency, per this
// sprint's "no new infrastructure, no new feature" scope.
//
// This is what makes "Collar A -> B -> A" a real cache hit on the third
// pick: A's DNA State hashes identically both times, so the second A never
// re-hits Supabase, DNA Resolver, Recipe Composer, Prompt Builder, or
// OpenAI — it returns the exact response already produced. Only successful
// renders are ever stored (see route.ts) — a 422/502 error is never cached,
// so a real fix (e.g. master data getting completed) is never stuck behind
// a stale failure.

const MAX_ENTRIES = 50

export interface CachedRender<T> {
  hash: string
  cachedAt: string
  response: T
}

const store = new Map<string, CachedRender<unknown>>()

export function getCachedRender<T>(hash: string): CachedRender<T> | null {
  const hit = store.get(hash)
  if (!hit) return null

  // Re-insert to refresh recency — Map iteration order is insertion order,
  // so this makes eviction below a real least-recently-USED policy instead
  // of least-recently-inserted.
  store.delete(hash)
  store.set(hash, hit)
  return hit as CachedRender<T>
}

export function setCachedRender<T>(hash: string, response: T): void {
  store.set(hash, { hash, cachedAt: new Date().toISOString(), response })

  if (store.size > MAX_ENTRIES) {
    const oldestKey = store.keys().next().value
    if (oldestKey) store.delete(oldestKey)
  }
}

export function renderCacheSize(): number {
  return store.size
}
