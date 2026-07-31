// Structured Render Lifecycle Logging — Sprint O Task 7. One JSON line per
// event, always keyed by the same Render ID a UI/API/History row also
// uses, instead of another ad-hoc console.log banner. Does NOT replace the
// existing stage-by-stage diagnostic logs in route.ts (STAGE 1-6, `logStage`)
// — those trace the DNA/prompt pipeline internals and are out of this
// sprint's scope; this is specifically the render's start/finish lifecycle.

interface RenderStartedEvent {
  renderId: string
  source: string
  consultationId: string | null
}

interface RenderFinishedEvent {
  renderId: string
  provider: string
  model: string | null
  durationMs: number
  requestCount: number
  retryCount: number
  status: string
}

function emit<T extends object>(event: string, payload: T) {
  console.log(JSON.stringify({ event, at: new Date().toISOString(), ...payload }))
}

export function logRenderStarted(params: RenderStartedEvent): void {
  emit('render.started', params)
}

export function logRenderFinished(params: RenderFinishedEvent): void {
  emit('render.finished', params)
}

export function logRenderLocked(params: { source: string; consultationId: string | null; activeRenderId: string | null }): void {
  emit('render.rejected_locked', params)
}
