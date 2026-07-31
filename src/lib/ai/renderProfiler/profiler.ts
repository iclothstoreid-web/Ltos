// Render Profiler — Sprint O.1 (AI Render Performance & Latency Optimization).
//
// Full-pipeline stage timing so every render's latency can be explained,
// stage by stage, instead of a single opaque duration_ms. Purely additive
// observation: never changes what a render does, only records how long each
// part of it took. `record()` accepts an externally-timed span (e.g. the
// OpenAI request, timed inside image.ts) so this module never needs to know
// about OpenAI/Supabase specifics — it only aggregates { stage, start, end }.

export interface StageTiming {
  stage: string
  startedAt: number
  endedAt: number
  durationMs: number
}

export interface RenderProfileReport {
  stages: StageTiming[]
  totalDurationMs: number
  // Everything before the first 'openai_request*' stage started.
  preprocessingDurationMs: number
  // Sum of every 'openai_request*' stage (one per controlled-retry attempt).
  providerDurationMs: number
  // Everything after the last 'openai_request*' stage ended.
  postprocessingDurationMs: number
}

export interface RenderProfiler {
  /** Times a synchronous function and records it as one stage. */
  mark<T>(stage: string, fn: () => T): T
  /**
   * Times an async function and records it as one stage. The timer starts
   * the instant this is called (not when the returned promise is awaited),
   * so a caller can kick this off and await it later to genuinely overlap
   * it with other work — the recorded duration still reflects real wall
   * time, not when the result was consumed.
   */
  markAsync<T>(stage: string, fn: () => Promise<T>): Promise<T>
  /** Records an already-measured span (e.g. timed inside another module). */
  record(stage: string, startedAt: number, endedAt: number): void
  report(): RenderProfileReport
}

export function createRenderProfiler(): RenderProfiler {
  const stages: StageTiming[] = []
  const createdAt = Date.now()

  function record(stage: string, startedAt: number, endedAt: number) {
    stages.push({ stage, startedAt, endedAt, durationMs: endedAt - startedAt })
  }

  function mark<T>(stage: string, fn: () => T): T {
    const startedAt = Date.now()
    const result = fn()
    record(stage, startedAt, Date.now())
    return result
  }

  function markAsync<T>(stage: string, fn: () => Promise<T>): Promise<T> {
    const startedAt = Date.now()
    return fn().then(
      (result) => {
        record(stage, startedAt, Date.now())
        return result
      },
      (err) => {
        record(`${stage}_error`, startedAt, Date.now())
        throw err
      },
    )
  }

  function report(): RenderProfileReport {
    const now = Date.now()
    const providerStages = stages.filter((s) => s.stage.startsWith('openai_request'))
    const providerDurationMs = providerStages.reduce((sum, s) => sum + s.durationMs, 0)

    const firstProviderStart = providerStages.length > 0 ? Math.min(...providerStages.map((s) => s.startedAt)) : null
    const lastProviderEnd = providerStages.length > 0 ? Math.max(...providerStages.map((s) => s.endedAt)) : null

    const preprocessingDurationMs = firstProviderStart !== null ? firstProviderStart - createdAt : now - createdAt
    const postprocessingDurationMs = lastProviderEnd !== null ? now - lastProviderEnd : 0

    return {
      stages: [...stages].sort((a, b) => a.startedAt - b.startedAt),
      totalDurationMs: now - createdAt,
      preprocessingDurationMs,
      providerDurationMs,
      postprocessingDurationMs,
    }
  }

  return { mark, markAsync, record, report }
}

// Console-friendly breakdown — one table, gated by the caller (route.ts only
// prints it when RENDER_DEBUG_LOG is on) so production log volume doesn't
// grow just from having a profiler.
export function formatProfileReport(report: RenderProfileReport): Record<string, string> {
  const rows: Record<string, string> = {}
  report.stages.forEach((s) => {
    rows[s.stage] = `${s.durationMs} ms`
  })
  rows['— preprocessing (total)'] = `${report.preprocessingDurationMs} ms`
  rows['— provider (OpenAI, total)'] = `${report.providerDurationMs} ms`
  rows['— postprocessing (total)'] = `${report.postprocessingDurationMs} ms`
  rows['TOTAL'] = `${report.totalDurationMs} ms`
  return rows
}
