import type { SupabaseClient } from '@supabase/supabase-js'
import type { Consultation } from '@/app/workspace/check-in/types'
import type { MeasurementFields } from '@/components/workspace/measurement/types'
import type { DesignSelections } from '@/components/workspace/design-studio/types'
import type { DesignSpecification } from '@/lib/designSpecification/types'
import type { EventInformation } from '@/components/workspace/consultation-review/eventInformationCodec'
import type { EstimationValidationResult } from './estimationValidation'
import type { CommercialType } from '@/lib/commercial/commercialType'
import { buildQrPayload, generateCustomerToken, buildCustomerJourneyUrl } from './qr'
import { notifyOrderCreated } from './notifications'
import { mapEstimasiToServiceLevel } from './service'
import { buildOrderSnapshot } from './snapshot'

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
  eventInformation?: EventInformation | null
  estimationValidation?: EstimationValidationResult | null
  // Sprint V1.2.1 (Fabric Quantity Input) — the Fitter's manual meters entry
  // from Design Studio. Snapshot-only per the "Pindahkan Konsumsi Inventory
  // ke Production" business rule: Fitter no longer reserves/deducts stock,
  // it only records what the order needs so Production's Persiapan Bahan
  // card can auto-fill its Material quantity.
  fabricQuantityMeters?: number | null
  // Milestone A (Commercial Type Engine) — defaults to 'normal' (today's
  // behavior: invoice generated, revenue counted) so every existing caller
  // keeps working unchanged. Every order now belongs to exactly one
  // transaction (the commercial/payment container); multi-garment
  // transactions (multiple orders sharing one transaction_id) are Milestone B.
  commercialType?: CommercialType
  // Milestone B (Multi-Garment): if provided and the transaction is OPEN,
  // the new order will be added to this existing transaction instead of
  // creating a new one. When omitted, a new transaction is created (the
  // default/legacy behavior, unchanged).
  existingTransactionId?: string | null
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
  eventInformation = null,
  estimationValidation = null,
  fabricQuantityMeters = null,
  commercialType = 'normal',
  existingTransactionId = null,
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

  // Milestone A (Commercial Type Engine) — every order belongs to a
  // transaction (the payment container). Derived from order_number the same
  // way order_number is derived from consultation_number, so it's
  // guaranteed unique. This transaction is 1:1 with the order until
  // Milestone B's "add garment to open transaction" flow exists.
  //
  // Milestone B (Multi-Garment): if an existingTransactionId is provided
  // and the transaction is OPEN, the new order is added to that existing
  // transaction instead of creating a new one. This enables the "add
  // garment to running transaction" flow.
  // Verify the existing transaction is OPEN — a read, kept client-side so
  // OrderValidationError's field-tagged UX (describeOrderError) is
  // unchanged; finalize_order_creation below re-checks this itself too
  // (defense in depth, same pattern already used by every write RPC in
  // this app), so nothing is lost if this read races with someone closing
  // the transaction in between — the RPC would just reject the write.
  let existingTransactionVerifiedId: string | null = null
  if (existingTransactionId) {
    const { data: existingTx, error: txCheckError } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('id', existingTransactionId)
      .single()
    if (txCheckError || !existingTx) {
      throw txCheckError || new Error('Existing transaction not found')
    }
    if (existingTx.status !== 'open') {
      throw new OrderValidationError(
        'Transaksi yang dipilih tidak dalam status OPEN. Silakan buat transaksi baru.',
        'existingTransactionId'
      )
    }
    existingTransactionVerifiedId = existingTx.id
  }
  const transactionNumber = 'LT-TRX-' + orderNumber.slice('LT-ORD-'.length)

  // Order id generated here (not by the DB default) so buildQrPayload can
  // be computed before finalize_order_creation runs — the QR payload is
  // itself part of the snapshot that RPC persists atomically, so it has to
  // be known going in. add_garment_to_transaction accepts this id and uses
  // it as-is instead of generating its own (see PS-01.5 migration).
  const orderId = globalThis.crypto.randomUUID()

  // 7. QR payload based on Order ID (never Customer ID).
  const qrPayload = buildQrPayload(orderId)
  const customerJourneyUrl = buildCustomerJourneyUrl(customerToken)

  const serviceLevel = mapEstimasiToServiceLevel(designSpecification?.estimatedProductionSpeed ?? '')

  // 9/10. Full snapshot — customer, measurement, body tags, design, notes —
  // captured now so it never drifts if the source records change later.
  // Milestone B Phase 2 (Decision 2 — single source of truth for the
  // snapshot shape): buildOrderSnapshot() is the only place this object is
  // assembled, reused unchanged by duplicate_garment()'s DB-side copy and
  // by any future "add garment" caller.
  const snapshot = {
    ...buildOrderSnapshot({
      customer: {
        id: consultation.customers.id,
        name: consultation.customers.name,
        phone: consultation.customers.phone,
        address: consultation.customers.address,
        isPreferredClient: consultation.customers.is_preferred_client,
      },
      measurementFields,
      bodyTags,
      selections,
      designSpecification,
      humanNotes,
      consultationId: consultation.id,
      consultationNumber: consultation.consultation_number,
      eventInformation,
      estimationValidation,
      fabricQuantityMeters,
    }),
    qrPayload,
  }

  // PS-01.5 (Transaction Integrity) — 1. Create the order (via
  // add_garment_to_transaction inside the RPC — current_state check
  // constraint has no 'confirmed' value, 'order' is the closest existing
  // one, already labeled "Order Confirmed" in STATE_LABELS), 3. advance the
  // consultation to order_created, and 2/5/8/9/10 log the 3 business_events
  // (snapshot + consultation.completed + workflow.order_created), all
  // atomically in one transaction. This used to be
  // addGarmentToTransaction() + setOrderService() + 4 separate `.from()`
  // calls, each committing independently — a failure partway through (e.g.
  // a dropped connection on the last business_events insert) left a real
  // `orders` row with no 'order.created' snapshot, which breaks
  // get_production_packet for that order. See
  // 20260901000000_ps01_5_transaction_integrity.sql; verified atomic via a
  // forced mid-flight failure against the live DB (zero orphaned rows).
  // orderId is already known (generated above), so the RPC's own returned
  // order_id/transaction_id aren't needed back here.
  const { error: finalizeError } = await supabase.rpc('finalize_order_creation', {
    p_consultation_id: consultation.id,
    p_existing_transaction_id: existingTransactionVerifiedId,
    p_new_transaction_number: transactionNumber,
    p_customer_id: consultation.customers.id,
    p_commercial_type: commercialType,
    p_order_number: orderNumber,
    p_customer_token: customerToken,
    p_service_level: serviceLevel,
    // RPC merges order_number into this itself (matches the original
    // `{ ...snapshot, order_number: orderNumber }` event_data literal).
    p_order_snapshot: snapshot,
    p_created_by: userId,
    p_order_id: orderId,
  })
  if (finalizeError) throw finalizeError

  // Inventory reservation/deduction no longer happens here — per the
  // "Pindahkan Konsumsi Inventory ke Production" business rule, Fitter only
  // records the material specification (captured in the snapshot above).
  // Production's Persiapan Bahan stage (save_material_preparation RPC) is
  // now the only place that touches materials.physical_stock.
  // notifyOrderCreated is still an intentional no-op — no WhatsApp/messaging
  // integration exists in this repo.
  notifyOrderCreated({
    orderId,
    orderNumber,
    customerName: consultation.customers.name,
    customerPhone: consultation.customers.phone,
    trackingUrl: qrPayload,
  })

  return { orderId, orderNumber, qrPayload, customerToken, customerJourneyUrl }
}
