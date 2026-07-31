import type { SupabaseClient } from '@supabase/supabase-js'
import { generateImage } from '@/lib/ai/services/image'
import type { GenerateImageInput, GenerateImageResult, ProviderUsage } from '@/lib/ai/services/image'
import { logRenderFinished, logRenderLocked, logRenderStarted } from './logger'
import type { RenderHistoryStatus, RenderTriggerSource } from './types'

// Render Session service — Sprint O. The ONE place allowed to open/close a
// Render History row and decide whether a new render is allowed to start
// (Render Request Lock). route.ts / debug/route.ts / test scripts all call
// through here instead of touching `render_history` directly, so the lock
// and the history row can never drift out of sync with each other.

// Timeout Handling (Task 8) — a 'pending' row older than this is treated
// as abandoned (its own request/response cycle already ended one way or
// another — success, crash, or a hard Vercel maxDuration=120 kill that
// never got to run route.ts's `finally`) rather than a real still-running
// render. Set with headroom above maxDuration=120s so it never races a
// render that is still genuinely in flight.
const STALE_LOCK_MS = 130_000

function generateLocalRenderId(): string {
  // Used only when no Supabase session is available to mint a real,
  // DB-sequenced Render ID (e.g. a standalone script with no auth — see
  // scripts/finalRenderTest.ts). Clearly distinguishable from a real one so
  // it's never mistaken for a Render History-backed ID in logs.
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `RND-${date}-LOCAL-${suffix}`
}

export interface StartRenderSessionInput {
  // null = no authenticated Supabase session available to this caller
  // (e.g. a standalone script with no login flow). Render Lock and Render
  // History are both skipped in that case — see the module doc comment on
  // why a render must never fail just because observability couldn't run.
  supabase: SupabaseClient | null
  source: RenderTriggerSource
  consultationId?: string | null
  orderId?: string | null
  userId?: string | null
  provider?: string
  model?: string | null
}

export type StartRenderSessionResult =
  | { locked: true; activeRenderId: string | null }
  | { locked: false; renderId: string; historyRowId: string | null; startedAt: string }

export async function startRenderSession(input: StartRenderSessionInput): Promise<StartRenderSessionResult> {
  const { supabase, source, consultationId = null, orderId = null, userId = null, provider = 'openai', model = null } = input

  if (!supabase) {
    const renderId = generateLocalRenderId()
    const startedAt = new Date().toISOString()
    logRenderStarted({ renderId, source, consultationId })
    return { locked: false, renderId, historyRowId: null, startedAt }
  }

  // Self-heal (Task 8, "timeout tidak membuat histori menjadi tidak
  // sinkron") — close out any abandoned lock for this consultation BEFORE
  // checking/acquiring a new one, so a genuinely-stuck row never blocks
  // renders forever, and Render History still ends up with a real
  // finished_at/status instead of staying 'pending' indefinitely.
  if (consultationId) {
    const staleCutoff = new Date(Date.now() - STALE_LOCK_MS).toISOString()
    await supabase
      .from('render_history')
      .update({
        status: 'timeout',
        finished_at: new Date().toISOString(),
        error_message: 'Render dianggap timeout otomatis (lock kedaluwarsa) dan dilepas untuk render berikutnya.',
      })
      .eq('consultation_id', consultationId)
      .eq('status', 'pending')
      .lt('started_at', staleCutoff)
  }

  const { data, error } = await supabase
    .from('render_history')
    .insert({ source, consultation_id: consultationId, order_id: orderId, user_id: userId, provider, model, status: 'pending' })
    .select('id, render_id, started_at')
    .single()

  if (error) {
    // Render Request Lock (Task 1) — the unique partial index on
    // (consultation_id) WHERE status='pending' raises 23505 the instant a
    // second render is attempted for a consultation that already has one
    // in flight. This is a real DB constraint, not a check-then-act race.
    if (error.code === '23505' && consultationId) {
      const { data: active } = await supabase
        .from('render_history')
        .select('render_id')
        .eq('consultation_id', consultationId)
        .eq('status', 'pending')
        .maybeSingle()
      logRenderLocked({ source, consultationId, activeRenderId: active?.render_id ?? null })
      return { locked: true, activeRenderId: active?.render_id ?? null }
    }

    // Any OTHER Render History failure must never block the render itself
    // — observability is additive, not a hard dependency of the render
    // pipeline. Fall back to a local (non-persisted) Render ID and proceed
    // exactly as if no Supabase session had been passed in.
    console.error('[renderSession] failed to open Render History row, continuing without history:', error.message)
    const renderId = generateLocalRenderId()
    const startedAt = new Date().toISOString()
    logRenderStarted({ renderId, source, consultationId })
    return { locked: false, renderId, historyRowId: null, startedAt }
  }

  logRenderStarted({ renderId: data.render_id, source, consultationId })
  return { locked: false, renderId: data.render_id, historyRowId: data.id, startedAt: data.started_at }
}

export interface FinishRenderSessionInput {
  supabase: SupabaseClient | null
  historyRowId: string | null
  renderId: string
  startedAt: string
  status: Exclude<RenderHistoryStatus, 'pending'>
  requestCount: number
  retryCount: number
  provider?: string
  model?: string | null
  errorMessage?: string | null
  providerResponseId?: string | null
  // Sprint O.1 (Task 8, Performance Logging) — the Render Profiler's own
  // stage-group breakdown for this request (see
  // src/lib/ai/renderProfiler/profiler.ts's RenderProfileReport). Optional
  // so a caller that has no profiler (none exists yet) just gets these
  // columns left null, same as before this sprint.
  preprocessingDurationMs?: number | null
  providerDurationMs?: number | null
  postprocessingDurationMs?: number | null
  // Cost Observability (Sprint O foundation, completed this finalization) —
  // raw gpt-image-1 token usage for this render, persisted as-is (no dollar
  // conversion — see ProviderUsage's doc comment in services/image.ts for
  // why). Optional so a cache hit / pre-OpenAI failure (no real usage data)
  // just leaves this column null.
  providerUsage?: ProviderUsage | null
}

export async function finishRenderSession(input: FinishRenderSessionInput): Promise<void> {
  const {
    supabase,
    historyRowId,
    renderId,
    startedAt,
    status,
    requestCount,
    retryCount,
    provider = 'openai',
    model = null,
    errorMessage = null,
    providerResponseId = null,
    preprocessingDurationMs = null,
    providerDurationMs = null,
    postprocessingDurationMs = null,
    providerUsage = null,
  } = input

  const finishedAt = new Date()
  const durationMs = finishedAt.getTime() - new Date(startedAt).getTime()

  logRenderFinished({ renderId, provider, model, durationMs, requestCount, retryCount, status })

  if (!supabase || !historyRowId) return

  const { error } = await supabase
    .from('render_history')
    .update({
      finished_at: finishedAt.toISOString(),
      duration_ms: durationMs,
      status,
      request_count: requestCount,
      retry_count: retryCount,
      provider,
      model,
      error_message: errorMessage,
      provider_response_id: providerResponseId,
      preprocessing_duration_ms: preprocessingDurationMs,
      provider_duration_ms: providerDurationMs,
      postprocessing_duration_ms: postprocessingDurationMs,
      provider_usage: providerUsage,
    })
    .eq('id', historyRowId)

  if (error) {
    console.error('[renderSession] failed to close Render History row:', error.message)
  }
}

export interface GenerateImageWithControlledRetryParams {
  input: GenerateImageInput
  // Controlled Retry Policy (Task 2) — defaults to 0 (no automatic retry)
  // deliberately: this sprint exists because unbounded/silent retries were
  // inflating OpenAI spend, so the safe default is "never retry an
  // expensive image generation unless a caller explicitly opts in." Only
  // transient-looking failures (timeout/connection, matched on the error
  // string generateImage() already returns) are retried at all — a
  // content-policy or validation failure retried with the identical input
  // would just fail identically again, wasting the attempt.
  maxApplicationRetries?: number
}

export interface GenerateImageWithControlledRetryResult {
  result: GenerateImageResult
  requestCount: number
  retryCount: number
  // Sprint O.1 (Task 1/5) — one { requestSentAt, responseReceivedAt } per
  // attempt (including retries), so the caller's Render Profiler can record
  // every real OpenAI network call individually instead of only the last.
  attempts: { requestSentAt: number; responseReceivedAt: number }[]
  // Cost Observability (Sprint O foundation, completed this finalization) —
  // the successful attempt's raw token usage (undefined if every attempt
  // failed, or the provider didn't include a usage block).
  usage?: ProviderUsage
}

const TRANSIENT_ERROR_PATTERN = /timeout|timed out|connection/i

export async function generateImageWithControlledRetry(
  params: GenerateImageWithControlledRetryParams,
): Promise<GenerateImageWithControlledRetryResult> {
  const maxApplicationRetries = Math.max(0, params.maxApplicationRetries ?? 0)
  let requestCount = 0
  let result: GenerateImageResult
  const attempts: { requestSentAt: number; responseReceivedAt: number }[] = []

  do {
    requestCount += 1
    result = await generateImage(params.input)
    attempts.push(result.timing)
    if (result.ok) break
    if (!TRANSIENT_ERROR_PATTERN.test(result.error)) break
  } while (requestCount <= maxApplicationRetries)

  return { result, requestCount, retryCount: requestCount - 1, attempts, usage: result.ok ? result.usage : undefined }
}
