// Render Session — Sprint O (AI Render Reliability & Cost Observability).
//
// A Render Session wraps ONE attempt to call an AI provider for a render
// (currently always src/lib/ai/services/image.ts's generateImage(), always
// OpenAI) with three things that never existed before this sprint:
//   1. A Render Lock — at most one in-flight render per consultation.
//   2. A Render ID — one stable identifier used by UI, API, History, and
//      logging for that single attempt (Task 6).
//   3. A Render History row — persisted trace of what happened, so every
//      dollar spent can be traced back to a specific render (Task 3).
//
// Deliberately provider-agnostic in shape (`provider` is just a string
// column, not an enum tied to OpenAI) — a future non-OpenAI provider slots
// into the exact same table/service without any redesign here.

// Cost Observability finalization — raw gpt-image-1 token usage exactly as
// OpenAI reports it (see src/lib/ai/services/image.ts's ProviderUsage
// comment for why this is stored as real counts, not a computed dollar
// estimate).
export interface RenderProviderUsage {
  input_tokens: number
  input_tokens_details: { image_tokens: number; text_tokens: number }
  output_tokens: number
  total_tokens: number
  output_tokens_details?: { image_tokens: number; text_tokens: number }
}

export type RenderTriggerSource = 'design_studio' | 'debug_viewer' | 'test_script' | 'cli' | 'future_provider'

export type RenderHistoryStatus = 'pending' | 'success' | 'failed' | 'timeout' | 'cancelled'

export interface RenderHistoryRow {
  id: string
  render_id: string
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  user_id: string | null
  consultation_id: string | null
  order_id: string | null
  provider: string
  model: string | null
  status: RenderHistoryStatus
  request_count: number
  retry_count: number
  estimated_cost_usd: number | null
  actual_cost_usd: number | null
  provider_response_id: string | null
  source: RenderTriggerSource
  error_message: string | null
  created_at: string
  // Sprint O.1 (Task 8, Performance Logging) — the same breakdown the
  // Render Profiler reports at request time (src/lib/ai/renderProfiler),
  // persisted so every past render's latency can be analyzed later, not
  // just the one currently in flight. `duration_ms` above stays the total;
  // these three are its breakdown and should sum to approximately it.
  preprocessing_duration_ms: number | null
  provider_duration_ms: number | null
  postprocessing_duration_ms: number | null
  // Cost Observability finalization — see RenderProviderUsage above.
  provider_usage: RenderProviderUsage | null
}
