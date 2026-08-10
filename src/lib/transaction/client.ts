// Milestone B: Multi-Garment Transaction Engine
//
// Thin wrappers around the Multi-Garment RPCs from
// supabase/migrations/20260821000000_milestone_b_multi_garment.sql.

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AddGarmentResult,
  DuplicateGarmentResult,
  OpenTransactionForCustomer,
  TransactionDetail,
  TransactionStatus,
} from './types'

/**
 * Inserts a new order (garment) under a transaction that is already known
 * to be OPEN -- atomically validating that and computing the next
 * garment_index. This is the single order-insert primitive used by
 * createOrderFromConsultation() for both a brand new transaction's first
 * garment and a garment added to an existing OPEN transaction (Milestone B
 * Phase 2, Decision 1 -- one canonical "add garment" implementation).
 *
 * Deliberately does not write the order.created business_events snapshot:
 * the caller needs the returned order_id to build qrPayload first, and is
 * the single source of truth for that snapshot's shape (see
 * src/lib/order/snapshot.ts).
 */
export async function addGarmentToTransaction(
  supabase: SupabaseClient,
  params: {
    transactionId: string
    customerId: string
    orderNumber: string
    customerToken: string
    // PS-01.5 (Transaction Integrity) — optional; finalize_order_creation
    // passes a client-generated id through here so buildQrPayload(orderId)
    // can be computed before the insert (see createOrder.ts). Omitted by
    // every other caller (e.g. GarmentOrderList's "add another garment"),
    // which keeps the exact prior behavior of the DB generating one.
    orderId?: string
  }
): Promise<AddGarmentResult> {
  const { data, error } = await supabase.rpc('add_garment_to_transaction', {
    p_transaction_id: params.transactionId,
    p_customer_id: params.customerId,
    p_order_number: params.orderNumber,
    p_customer_token: params.customerToken,
    p_order_id: params.orderId ?? null,
  })
  if (error) throw error
  return data as unknown as AddGarmentResult
}

/**
 * Duplicates an existing garment (order) within the same transaction.
 * Copies design, measurement, material selection, accessories, embroidery
 * from the source order's snapshot. Generates a completely new production
 * identity (new order_number, QR, customer_token, production_stage_records).
 */
export async function duplicateGarment(
  supabase: SupabaseClient,
  params: {
    sourceOrderId: string
    newOrderNumber: string
    newCustomerToken: string
  }
): Promise<DuplicateGarmentResult> {
  const { data, error } = await supabase.rpc('duplicate_garment', {
    p_source_order_id: params.sourceOrderId,
    p_new_order_number: params.newOrderNumber,
    p_new_customer_token: params.newCustomerToken,
  })
  if (error) throw error
  return data as unknown as DuplicateGarmentResult
}

/**
 * Removes a garment (order) from its transaction.
 * Only allowed if production hasn't started on that order.
 * The order record stays for audit trail (transaction_id set to null).
 */
export async function removeGarmentFromTransaction(
  supabase: SupabaseClient,
  orderId: string
): Promise<void> {
  const { error } = await supabase.rpc('remove_garment_from_transaction', {
    p_order_id: orderId,
  })
  if (error) throw error
}

/**
 * Fetches full transaction detail including all orders/garments.
 *
 * Coalesces concurrent calls for the same transactionId into one in-flight
 * request (React Strict Mode replays TransactionGarmentsPanel's mount effect
 * once in dev). The cache entry clears as soon as it settles, so a later
 * call — e.g. the onGarmentAdded/onGarmentRemoved refresh — always hits the
 * network fresh.
 */
const inFlightTransactionDetail = new Map<string, Promise<TransactionDetail | null>>()

export async function getTransactionDetail(
  supabase: SupabaseClient,
  transactionId: string
): Promise<TransactionDetail | null> {
  const existing = inFlightTransactionDetail.get(transactionId)
  if (existing) return existing

  const promise = (async () => {
    const { data, error } = await supabase.rpc('get_transaction_detail', {
      p_transaction_id: transactionId,
    })
    if (error) throw error
    return data as unknown as TransactionDetail | null
  })()

  inFlightTransactionDetail.set(transactionId, promise)
  try {
    return await promise
  } finally {
    inFlightTransactionDetail.delete(transactionId)
  }
}

/**
 * Returns all OPEN transactions for a given customer.
 * Used by Scenario 4 to prompt "Tambahkan ke transaksi yang masih berjalan?"
 */
export async function getOpenTransactionsForCustomer(
  supabase: SupabaseClient,
  customerId: string
): Promise<OpenTransactionForCustomer[]> {
  const { data, error } = await supabase.rpc('get_open_transactions_for_customer', {
    p_customer_id: customerId,
  })
  if (error) throw error
  return (data as unknown as OpenTransactionForCustomer[]) || []
}

/**
 * Updates transaction status with validation.
 * Rules: OPEN → PARTIALLY_COMPLETED / COMPLETED / CANCELLED
 *        PARTIALLY_COMPLETED → COMPLETED / CANCELLED
 */
export async function updateTransactionStatus(
  supabase: SupabaseClient,
  transactionId: string,
  newStatus: TransactionStatus,
  reason?: string | null
): Promise<void> {
  const { error } = await supabase.rpc('update_transaction_status', {
    p_transaction_id: transactionId,
    p_new_status: newStatus,
    p_reason: reason ?? null,
  })
  if (error) throw error
}

