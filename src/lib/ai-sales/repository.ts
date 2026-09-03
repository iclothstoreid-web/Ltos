import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AiSalesConversation, AiSalesMessage, AiSalesStage } from './types'

export async function getOrCreateConversation(
  supabase: SupabaseClient,
  externalContactId: string
): Promise<AiSalesConversation> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('ai_sales_conversations')
    .upsert(
      {
        channel: 'whatsapp',
        external_contact_id: externalContactId,
        customer_phone: externalContactId,
        updated_at: now,
      },
      { onConflict: 'channel,external_contact_id', ignoreDuplicates: false }
    )
    .select('*')
    .single()

  if (error) throw error
  return data as AiSalesConversation
}

export async function appendInboundMessage(
  supabase: SupabaseClient,
  message: AiSalesMessage
): Promise<boolean> {
  const { error } = await supabase.from('ai_sales_messages').insert(message)

  if (error?.code === '23505') return false
  if (error) throw error

  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('ai_sales_conversations')
    .update({ last_inbound_at: now, updated_at: now })
    .eq('id', message.conversation_id)
  if (updateError) throw updateError

  return true
}

export async function appendOutboundMessage(
  supabase: SupabaseClient,
  message: AiSalesMessage
): Promise<void> {
  const { error } = await supabase.from('ai_sales_messages').insert(message)
  if (error) throw error

  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('ai_sales_conversations')
    .update({ last_outbound_at: now, updated_at: now })
    .eq('id', message.conversation_id)
  if (updateError) throw updateError
}

export async function listRecentMessages(
  supabase: SupabaseClient,
  conversationId: string,
  limit = 20
): Promise<AiSalesMessage[]> {
  const { data, error } = await supabase
    .from('ai_sales_messages')
    .select('id, conversation_id, direction, role, provider_message_id, message_type, text_content, delivery_status, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return ((data ?? []) as AiSalesMessage[]).reverse()
}

export async function updateConversationState(
  supabase: SupabaseClient,
  conversationId: string,
  params: {
    stage?: AiSalesStage
    mode?: 'ai' | 'human'
    handoffReason?: string | null
    customerName?: string | null
    context?: Record<string, unknown>
  }
): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (params.stage !== undefined) patch.stage = params.stage
  if (params.mode !== undefined) patch.mode = params.mode
  if (params.handoffReason !== undefined) patch.handoff_reason = params.handoffReason
  if (params.customerName !== undefined) patch.customer_name = params.customerName
  if (params.context !== undefined) patch.context = params.context

  const { error } = await supabase.from('ai_sales_conversations').update(patch).eq('id', conversationId)
  if (error) throw error
}

export async function createSalesAction(
  supabase: SupabaseClient,
  conversationId: string,
  actionType: string,
  payload: Record<string, unknown>,
  status: 'proposed' | 'executed' | 'rejected' | 'failed' = 'proposed'
): Promise<void> {
  const { error } = await supabase.from('ai_sales_actions').insert({
    conversation_id: conversationId,
    action_type: actionType,
    status,
    payload,
    executed_at: status === 'executed' ? new Date().toISOString() : null,
  })
  if (error) throw error
}
