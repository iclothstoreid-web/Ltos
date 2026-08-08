// Sprint N5 — temporary, development-only timing for
// /production/[orderId]'s data fetches. Logs to the server console so a
// developer can see query count + duration for the critical vs. deferred
// paths while tuning this route; a no-op pass-through in every other
// environment (including production), so nothing ships as a permanent log.
// Not wired into any dashboard/metrics system — remove once this sprint's
// tuning is done.
const isDev = process.env.NODE_ENV === 'development'

export async function timedQuery<T>(label: string, run: () => Promise<T>): Promise<T> {
  if (!isDev) return run()
  const start = performance.now()
  try {
    return await run()
  } finally {
    console.log(`[perf][production] ${label}: ${(performance.now() - start).toFixed(1)}ms`)
  }
}
