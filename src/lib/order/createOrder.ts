import type { SupabaseClient } from '@supabase/supabase-js'
import type { Consultation } from '@/app/workspace/check-in/types'
import type { MeasurementFields } from '@/components/workspace/measurement/types'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import type { DesignSpecification } from '@/lib/designSpecification/types'
import type { OrderSnapshot } from './types'
import { buildQrPayload, generateCustomerToken, buildCustomerJourneyUrl } from './qr'
import { reserveInventory } from './inventory'
import { notifyOrderCreated } from './notifications'
import { mapEstimasiToServiceLevel, setOrderService } from './service'

interface CreateOrderParams {
  supabase: SupabaseClient
  consultation: Consultation & {
    customers: {
      id: string
      name: string
      phone: string | null
      address: string | null
      is_preferred_client: boolean
    }
  }
  measurementFields: MeasurementFields
  bodyTags: string[]
  humanNotes: string
  selections: DesignSelections
  designSpecification?: DesignSpecification | null
  userId: string
}

interface CreateOrderResult {
  orderId: string
  orderNumber: string
  qrPayload: string
  customerToken: string
  customerJourneyUrl: string
}

// Thrown for pre-insert validation failures (as opposed to Supabase/DB
// errors) so the UI can tell the two apart and describe which part of the
// submission was the problem, not just "something went wrong".
export class OrderValidationError extends Error {
  field?: string

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'OrderValidationError'
    this.field = field
  }
}

/**
 * Implements the Sprint 05 Create Order workflow (LTOS-CREATE-ORDER-01..10):
 * creates the order, links it to the consultation, advances both statuses,
 * generates the order number + QR payload, snapshots design/measurement
 * data, and logs the three required business events. `orders` has no
 * consultation_id/qr/notes column (no schema change authorized this
 * sprint), so the consultation<->order link and the full snapshot both
 * live on the business_events rows instead — see types.ts for why that's
 * actually the correct place for an immutable snapshot.
 */
export async function createOrderFromConsultation({
  supabase,
  consultation,
  measurementFields,
  bodyTags,
  humanNotes,
  selections,
  designSpecification = null,
  userId,
}: CreateOrderParams): Promise<CreateOrderResult> {
  // Root cause of "Create Order gagal tanpa alasan": order_number is
  // derived deterministically from consultation_number (below), and
  // orders.order_number is UNIQUE. Nothing currently stops a Fitter from
  // navigating back into Measurement/Design Studio for a consultation that
  // already produced an order — doing so resets consultations.status back
  // to 'measurement'/'design'/'review', but the earlier order (and its
  // order_number) still exists. Re-submitting Create Order for that same
  // consultation then hits a duplicate-key violation on the second insert.
  // Guard against that specific, real scenario here instead of letting it
  // reach Supabase as an opaque unique-constraint error.
  if (consultation.status === 'order_created') {
    throw new OrderValidationError(
      `Konsultasi ${consultation.consultation_number} sudah memiliki Order sebelumnya. Order tidak dapat dibuat dua kali dari konsultasi yang sama.`,
      'consultation.status'
    )
  }

  // 6. Generate official order number — orders.order_number is NOT NULL
  // with no DB-side generator (unlike consultation_number). Derived
  // deterministically from the already-unique consultation_number so it
  // can never collide.
  const orderNumber = consultation.consultation_number.replace('LT-CS-', 'LT-ORD-')

  // Customer Journey's public identity — generated once, here, and never
  // touched again. Kept entirely separate from order_number/order id, which
  // stay internal to Fitter/Production/Owner.
  const customerToken = generateCustomerToken()

  // 1. Create the order. current_state check constraint has no 'confirmed'
  // value — 'order' is the closest existing one and is already labeled
  // "Order Confirmed" in this app's own STATE_LABELS (src/lib/ltos.ts).
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: consultation.customers.id,
      order_number: orderNumber,
      current_state: 'order',
      customer_token: customerToken,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    throw orderError || new Error('Order insert returned no row')
  }

  // 7. QR payload based on Order ID (never Customer ID)
  const qrPayload = buildQrPayload(order.id)
  const customerJourneyUrl = buildCustomerJourneyUrl(customerToken)

  // Service Engine: commit the Fitter's Estimasi Pengerjaan pick (already
  // previewed with 🟢/🟡/🔴 in EstimationCard) as the order's real
  // service_level, resolving + locking Hari D at the same time. Best-effort
  // and non-blocking -- if the Fitter left it unset, or no capacity slot is
  // found, the order still gets created and get_production_packet falls
  // back to created_at + 14 days, same as every pre-Sprint-C order.
  const serviceLevel = mapEstimasiToServiceLevel(designSpecification?.estimatedProductionSpeed ?? '')
  if (serviceLevel) {
    try {
      await setOrderService(supabase, order.id, serviceLevel)
    } catch (err) {
      console.error('set_order_service failed, order keeps legacy +14 day estimate:', err)
    }
  }

  // 9/10. Full snapshot — customer, measurement, body tags, design, notes —
  // captured now so it never drifts if the source records change later.
  const snapshot: OrderSnapshot = {
    customer: {
      id: consultation.customers.id,
      name: consultation.customers.name,
      phone: consultation.customers.phone,
      address: consultation.customers.address,
      isPreferredClient: consultation.customers.is_preferred_client,
    },
    measurement: measurementFields,
    bodyTags,
    design: selections,
    designSpecification,
    consultationNotes: humanNotes,
    qrPayload,
    consultationId: consultation.id,
    consultationNumber: consultation.consultation_number,
  }

  // 3. Consultation -> order_created
  await supabase.from('consultations').update({ status: 'order_created' }).eq('id', consultation.id)

  // 2/5/8. Link consultation<->order and log the event carrying the full
  // snapshot + QR payload. business_events supports both consultation_id
  // and order_id on the same row, which is what makes the two records
  // queryably linked without a new FK column.
  await supabase.from('business_events').insert({
    consultation_id: consultation.id,
    order_id: order.id,
    event_type: 'order.created',
    event_data: { ...snapshot, order_number: orderNumber },
    created_by: userId,
  })

  await supabase.from('business_events').insert({
    consultation_id: consultation.id,
    order_id: order.id,
    event_type: 'consultation.completed',
    event_data: { order_number: orderNumber },
    created_by: userId,
  })

  await supabase.from('business_events').insert({
    consultation_id: consultation.id,
    order_id: order.id,
    event_type: 'workflow.order_created',
    event_data: { from_status: 'review', to_status: 'order_created', order_state: 'order' },
    created_by: userId,
  })

  // Reservation is wired to the Inventory schema (see reserveInventory) but
  // quantityMeters stays null — no fabric-usage calculator exists yet (same
  // gap noted on InventoryReservationRequest), so it no-ops until one does.
  // notifyOrderCreated is still an intentional no-op — no WhatsApp/messaging
  // integration exists in this repo.
  await reserveInventory(supabase, {
    orderId: order.id,
    fabricName: selections.fabric,
    colorName: selections.color,
    quantityMeters: null,
  })
  notifyOrderCreated({
    orderId: order.id,
    orderNumber,
    customerName: consultation.customers.name,
    customerPhone: consultation.customers.phone,
    trackingUrl: qrPayload,
  })

  return { orderId: order.id, orderNumber, qrPayload, customerToken, customerJourneyUrl }
}
