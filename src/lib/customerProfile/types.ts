import type { MeasurementFields, MeasurementKey } from '@/components/workspace/measurement/types'
import type { BodyPartId } from '@/lib/measurement/bodyMap'

export interface CustomerPhotoMeta {
  url: string
  // Not a true upload timestamp (none is persisted anywhere in the app for
  // consultation-photos) — the moment this profile first observed this URL.
  // Preserved across regenerations as long as the URL is unchanged, so it
  // doesn't drift every time the profile is rebuilt.
  recordedAt: string
}

// Permanent, render-agnostic snapshot of a customer's digital measurements +
// photo for one consultation. Source of truth for Design Studio's AI Render
// Engine (later sprint) — never stores a render/design/avatar/mannequin
// output (see buildRenderContext for the ephemeral object that combines
// this with a Design Specification).
export interface CustomerDigitalProfile {
  consultationId: string
  measurement: {
    fields: MeasurementFields
    measuredAt: string | null
  }
  bodyTags: string[]
  // Static reference (from src/lib/measurement/bodyMap.ts) copied in so
  // downstream consumers don't need a separate import to know which body
  // part(s) each measurement field corresponds to.
  bodyMapReference: Record<MeasurementKey, BodyPartId[]>
  // LOCKED (Sprint 4): single front-view photo only — no side/back slots.
  // Sufficient for AI Render since Measurement supplies the body constraints;
  // Production separately shows this alongside (never merged with) the AI
  // Render Preview, and Customer Journey/QR never surfaces this photo at all
  // (privacy) — only the AI Render Preview, once that exists.
  customerPhoto: CustomerPhotoMeta | null
  measurementTimestamp: string | null
  lastUpdated: string
}
