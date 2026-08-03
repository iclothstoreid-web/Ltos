import type { SupabaseClient } from '@supabase/supabase-js'
import type { CommercialType } from './commercialType'

export interface MultiGarmentKpiData {
  avgGarmentsPerTransaction: number
  largestTransactionGarmentCount: number
  largestTransactionNumber: string | null
  openTransactions: number
  completedTransactions: number
  cancelledTransactions: number
  familyOrders: number
  byCommercialType: Record<CommercialType, number>
}

// Milestone B: Multi-Garment KPIs for the Owner Dashboard.
// Queries transactions and orders directly (no new RPC needed; the tables
// already exist and are readable by staff profiles via RLS). Computes all
// metrics in one pass to avoid N+1.
export async function getMultiGarmentKPIs(supabase: SupabaseClient): Promise<MultiGarmentKpiData> {
  // Fetch all transactions with their order counts and commercial types
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select(`
      id,
      transaction_number,
      status,
      commercial_type,
      orders!inner (id)
    `)
    .order('created_at', { ascending: false })

  if (txError) throw txError

  const rows = (transactions || []) as Array<{
    id: string
    transaction_number: string
    status: string
    commercial_type: CommercialType
    orders: Array<{ id: string }>
  }>

  // Fetch family order detection: transactions with orders having different customer_ids
  const { data: familyTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      transaction_number,
      orders!inner (customer_id)
    `)

  const familyTxIds = new Set<string>()
  for (const tx of (familyTransactions || []) as Array<{
    id: string
    transaction_number: string
    orders: Array<{ customer_id: string }>
  }>) {
    const uniqueCustomers = new Set(tx.orders.map((o) => o.customer_id))
    if (uniqueCustomers.size > 1) {
      familyTxIds.add(tx.id)
    }
  }

  // Compute metrics
  let totalGarments = 0
  let maxGarments = 0
  let maxTxNumber: string | null = null
  let openCount = 0
  let completedCount = 0
  let cancelledCount = 0
  let familyOrderCount = 0
  const byType: Record<string, number> = {}

  for (const tx of rows) {
    const garmentCount = tx.orders?.length || 0
    totalGarments += garmentCount

    if (garmentCount > maxGarments) {
      maxGarments = garmentCount
      maxTxNumber = tx.transaction_number
    }

    if (tx.status === 'open') openCount++
    else if (tx.status === 'completed') completedCount++
    else if (tx.status === 'cancelled') cancelledCount++

    if (familyTxIds.has(tx.id)) familyOrderCount++

    byType[tx.commercial_type] = (byType[tx.commercial_type] || 0) + 1
  }

  const transactionCount = rows.length

  return {
    avgGarmentsPerTransaction: transactionCount > 0 ? totalGarments / transactionCount : 0,
    largestTransactionGarmentCount: maxGarments,
    largestTransactionNumber: maxTxNumber,
    openTransactions: openCount,
    completedTransactions: completedCount,
    cancelledTransactions: cancelledCount,
    familyOrders: familyOrderCount,
    byCommercialType: byType as Record<CommercialType, number>,
  }
}
