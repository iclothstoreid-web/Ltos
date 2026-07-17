import type { MeasurementFields } from '@/components/workspace/measurement/types'
import type { DesignSelections } from '@/components/workspace/design-studio/types'

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
  consultationNotes: string
  qrPayload: string
  consultationId: string
  consultationNumber: string
}

// Prepared for future wiring — no inventory table exists yet, and the
// brief explicitly says not to fabricate a reservation. quantityMeters is
// null because no fabric-usage calculator exists either (same reasoning
// used in Design Studio's Production Metrics card).
export interface InventoryReservationRequest {
  orderId: string
  fabricName: string
  colorName: string
  quantityMeters: number | null
}

// Prepared for future wiring — no WhatsApp/messaging integration exists.
export interface OrderCreatedNotificationPayload {
  orderId: string
  orderNumber: string
  customerName: string
  customerPhone: string | null
  trackingUrl: string
}
