// Milestone B: Multi-Garment Transaction Engine
//
// Transaction types for the service layer. Mirrors the RPC response shapes
// from supabase/migrations/20260821000000_milestone_b_multi_garment.sql.

import type { CommercialType } from '@/lib/commercial/commercialType'

export type TransactionStatus = 'open' | 'partially_completed' | 'completed' | 'cancelled'

export interface TransactionGarmentOrder {
  order_id: string
  order_number: string
  customer_id: string
  customer_name: string | null
  current_state: string
  garment_index: number
  duplicated_from_order_id: string | null
  created_at: string
  // Measurement's canonical contract is consultation-driven
  // (/workspace/measurement/[consultationId]) -- carried here so UI never
  // needs a second lookup just to navigate there. Null only for orders
  // whose order.created business_events row is missing (shouldn't happen
  // for any order created through the normal flow).
  consultation_id: string | null
  has_production: boolean
  production_progress: number
}

export interface TransactionDetail {
  transaction_id: string
  transaction_number: string
  status: TransactionStatus
  commercial_type: CommercialType
  commercial_type_reason: string | null
  primary_customer_id: string
  primary_customer_name: string | null
  created_at: string
  closed_at: string | null
  garment_count: number
  unique_customer_count: number
  orders: TransactionGarmentOrder[]
}

export interface OpenTransactionForCustomer {
  transaction_id: string
  transaction_number: string
  commercial_type: CommercialType
  created_at: string
  garment_count: number
  orders: Array<{
    order_id: string
    order_number: string
    garment_index: number
    current_state: string
  }>
}

export interface AddGarmentResult {
  order_id: string
  order_number: string
  garment_index: number
  transaction_id: string
  transaction_number: string
}

export interface DuplicateGarmentResult {
  order_id: string
  order_number: string
  garment_index: number
  transaction_id: string
  transaction_number: string
}

