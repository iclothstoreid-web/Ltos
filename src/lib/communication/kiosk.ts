import type { SupabaseClient } from '@supabase/supabase-js'
import type { CommunicationMessage, SenderRole } from './types'

// Kiosk (no-login) counterpart to messages.ts's direct-table functions.
// Production Packet has no auth.uid(), so it can't satisfy the "All staff"
// RLS policies on communication_messages the same way Owner OS/Fitter do —
// it goes through the get/send_order_communication SECURITY DEFINER RPCs
// instead, same pattern as every other kiosk write in
// src/lib/production/client.ts. Same table, same rows, just a different
// access path for a caller with no session.

export async function getOrderCommunications(
  supabase: SupabaseClient,
  orderId: string
): Promise<CommunicationMessage[]> {
  const { data, error } = await supabase.rpc('get_order_communications', { p_order_id: orderId })
  if (error) throw error
  return (data as CommunicationMessage[]) || []
}

export async function sendOrderCommunication(
  supabase: SupabaseClient,
  params: { orderId: string; senderRole: SenderRole; senderName: string; body: string }
): Promise<CommunicationMessage> {
  const { data, error } = await supabase.rpc('send_order_communication', {
    p_order_id: params.orderId,
    p_sender_role: params.senderRole,
    p_sender_name: params.senderName,
    p_body: params.body.trim(),
  })
  if (error) throw error
  return data as CommunicationMessage
}
