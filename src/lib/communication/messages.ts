import type { SupabaseClient } from '@supabase/supabase-js'
import type { CommunicationMessage, SenderRole } from './types'

// All communication reads, for either Owner OS view, go through this one
// query shape — Per Stage only adds a client-side filter on top of the same
// rows fetched here, per the brief's "jangan menduplikasi pesan" rule.
export async function fetchAllMessages(supabase: SupabaseClient): Promise<CommunicationMessage[]> {
  const { data, error } = await supabase
    .from('communication_messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as CommunicationMessage[]
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
