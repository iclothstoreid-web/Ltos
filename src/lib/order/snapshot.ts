import type { MeasurementFields } from '@/components/workspace/measurement/types'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import type { DesignSpecification } from '@/lib/designSpecification/types'
import type { EventInformation } from '@/components/workspace/consultation-review/eventInformationCodec'
import type { EstimationValidationResult } from './estimationValidation'
import type { OrderSnapshot } from './types'

export interface BuildOrderSnapshotParams {
  customer: {
    id: string
    name: string
    phone: string | null
    address: string | null
    isPreferredClient: boolean
  }
  measurementFields: MeasurementFields
  bodyTags: string[]
  selections: DesignSelections
  designSpecification: DesignSpecification | null
  humanNotes: string
  consultationId: string
  consultationNumber: string
  eventInformation: EventInformation | null
  estimationValidation: EstimationValidationResult | null
  fabricQuantityMeters: number | null
}

// Milestone B (Phase 2) — single source of truth for assembling an
// OrderSnapshot. Every workflow that creates a garment order (a brand new
// transaction, or adding a garment to an existing OPEN one) must produce
// the exact same shape; this used to be inlined once in
// createOrderFromConsultation() only, which is what let
// add_garment_to_transaction() drift into logging a minimal, incomplete
// event instead of a real snapshot.
//
// qrPayload is intentionally a placeholder ('') here: it depends on the
// order's real id, which doesn't exist yet at snapshot-assembly time.
// createOrderFromConsultation() spreads { ...buildOrderSnapshot(...),
// qrPayload } once add_garment_to_transaction() (src/lib/transaction/client.ts)
// has returned the real order_id, and only then writes the result to
// business_events — so the placeholder is never the value actually
// persisted.
export function buildOrderSnapshot(params: BuildOrderSnapshotParams): OrderSnapshot {
  return {
    customer: params.customer,
    measurement: params.measurementFields,
    bodyTags: params.bodyTags,
    design: params.selections,
    designSpecification: params.designSpecification,
    consultationNotes: params.humanNotes,
    qrPayload: '',
    consultationId: params.consultationId,
    consultationNumber: params.consultationNumber,
    eventInformation: params.eventInformation,
    estimationValidation: params.estimationValidation,
    fabricQuantityMeters: params.fabricQuantityMeters,
  }
}
