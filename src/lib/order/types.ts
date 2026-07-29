import type { MeasurementFields } from '@/components/workspace/measurement/types'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import type { DesignSpecification } from '@/lib/designSpecification/types'
import type { EventInformation } from '@/components/workspace/consultation-review/eventInformationCodec'
import type { EstimationValidationResult } from '@/lib/order/estimationValidation'

// Full order snapshot, captured once at Create Order time. `orders` has no
// flexible/JSONB column (id, customer_id, order_number, current_state,
// created_at, updated_at only) and a schema change wasn't authorized this
// sprint, so this snapshot lives in the immutable `order.created`
// business_events row instead (event_data is jsonb). That's actually a
// better fit than a mutable column would be: events are append-only, so
// the snapshot can never drift if the customer/consultation record changes
// later — which is exactly what "snapshot tidak boleh bergantung pada data
// Consultation yang bisa berubah" requires.
export interface OrderSnapshot {
  customer: {
    id: string
    name: string
    phone: string | null
    address: string | null
    isPreferredClient: boolean
  }
  measurement: MeasurementFields
  bodyTags: string[]
  design: DesignSelections
  // Frozen ID/price snapshot of the same choices `design` describes by name
  // — optional so older orders created before this sprint (which have no
  // such event key) still decode fine. Null if Design Studio was never
  // saved for this consultation.
  designSpecification?: DesignSpecification | null
  consultationNotes: string
  qrPayload: string
  consultationId: string
  consultationNumber: string
  // Milestone 3 (Consultation Decision Engine) -- optional so pre-existing
  // order.created events (which have no such key) still decode fine. Null
  // estimationValidation means Target Usage Date or Estimasi Pengerjaan was
  // left empty at Create Order time, not that validation failed.
  eventInformation?: EventInformation | null
  estimationValidation?: EstimationValidationResult | null
  // Fitter's manual Design Studio meter estimate (FabricQuantityField) —
  // spec-only, per the "Pindahkan Konsumsi Inventory ke Production" business
  // rule: Fitter records what an order *needs*, it never reserves or deducts
  // stock itself anymore. Optional so pre-existing order.created events
  // (which have no such key) still decode fine. Production's Persiapan
  // Bahan card reads this (via get_production_packet) to auto-fill its
  // Material quantity, editable if left null or wrong.
  fabricQuantityMeters?: number | null
}

// Prepared for future wiring — no WhatsApp/messaging integration exists.
export interface OrderCreatedNotificationPayload {
  orderId: string
  orderNumber: string
  customerName: string
  customerPhone: string | null
  trackingUrl: string
}
