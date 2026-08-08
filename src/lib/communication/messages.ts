import type { SupabaseClient } from '@supabase/supabase-js'
import type { CommunicationMessage, SenderRole } from './types'

// All communication reads, for either Owner OS view, go through this one
// query shape — Per Stage only adds a client-side filter on top of the same
// rows fetched here, per the brief's "jangan menduplikasi pesan" rule.
//
// Fetch Strategy (STEP 5.4, pagination) — this had no limit at all: every
// message ever sent across every order, unbounded, even though both
// consumers (PerOrderList, PerStageList, CommunicationThread) immediately
// filter it down to one order's thread client-side. Capped to the 1000 most
// recent messages system-wide instead — fetched newest-first then reversed
// so the returned array keeps its existing ascending-by-created_at contract.
export async function fetchAllMessages(supabase: SupabaseClient): Promise<CommunicationMessage[]> {
  const { data, error } = await supabase
    .from('communication_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) throw error
  return ((data ?? []) as CommunicationMessage[]).reverse()
}

// Same table, scoped to a single order — for authenticated, single-order
// pages (Fitter's Order Created) that don't need every order's thread the
// way Owner OS's two views do.
export async function fetchOrderMessages(supabase: SupabaseClient, orderId: string): Promise<CommunicationMessage[]> {
  const { data, error } = await supabase
    .from('communication_messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as CommunicationMessage[]
}

export async function sendMessage(
  supabase: SupabaseClient,
  params: { orderId: string; senderRole: SenderRole; senderName: string | null; createdBy: string | null; body: string }
): Promise<CommunicationMessage> {
  const { data, error } = await supabase
    .from('communication_messages')
    .insert({
      order_id: params.orderId,
      sender_role: params.senderRole,
      sender_name: params.senderName,
      created_by: params.createdBy,
      body: params.body.trim(),
    })
    .select('*')
    .single()

  if (error) throw error
  return data as CommunicationMessage
}
