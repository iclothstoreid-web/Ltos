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
    .select('id, conversation_id, direction, role, provider_message_id, message_type, text_content, raw_payload, delivery_status, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return ((data ?? []) as AiSalesMessage[]).reverse()
}

export async function listSentMediaAssetKeys(
  supabase: SupabaseClient,
  conversationId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('ai_sales_messages')
    .select('raw_payload')
    .eq('conversation_id', conversationId)
    .eq('direction', 'outbound')
    .eq('message_type', 'image')

  if (error) throw error
  return (data ?? [])
    .map(row => row.raw_payload?.asset_key)
    .filter((key): key is string => typeof key === 'string')
}

export async function updateConversationState(
  supabase: SupabaseClient,
  conversationId: string,
  params: {
    stage?: AiSalesStage
    mode?: 'ai' | 'human'
    handoffReason?: string | null
    customerId?: string | null
    customerName?: string | null
    context?: Record<string, unknown>
  }
): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (params.stage !== undefined) patch.stage = params.stage
  if (params.mode !== undefined) patch.mode = params.mode
  if (params.handoffReason !== undefined) patch.handoff_reason = params.handoffReason
  if (params.customerId !== undefined) patch.customer_id = params.customerId
  if (params.customerName !== undefined) patch.customer_name = params.customerName
  if (params.context !== undefined) patch.context = params.context

  const { error } = await supabase.from('ai_sales_conversations').update(patch).eq('id', conversationId)
  if (error) throw error
}

export async function updateConversationStateIfAi(
  supabase: SupabaseClient,
  conversationId: string,
  params: {
    stage: AiSalesStage
    mode: 'ai' | 'human'
    handoffReason: string | null
    customerName: string | null
    context: Record<string, unknown>
  }
): Promise<boolean> {
  const { data, error } = await supabase
    .from('ai_sales_conversations')
    .update({
      stage: params.stage,
      mode: params.mode,
      handoff_reason: params.handoffReason,
      customer_name: params.customerName,
      context: params.context,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .eq('mode', 'ai')
    .select('id')
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function isConversationAi(supabase: SupabaseClient, conversationId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('ai_sales_conversations')
    .select('mode')
    .eq('id', conversationId)
    .single()
  if (error) throw error
  return data.mode === 'ai'
}

export interface AiSalesResolvedContact {
  phoneE164: string
  displayName: string | null
  whatsappProfileName: string | null
  customerId: string | null
  isExistingCustomer: boolean
  orderCount: number
}

export async function resolveAiSalesCustomerContact(
  supabase: SupabaseClient,
  phone: string,
  whatsappProfileName: string | null
): Promise<AiSalesResolvedContact | null> {
  const { data, error } = await supabase.rpc('ai_sales_resolve_customer_contact', {
    p_phone: phone,
    p_whatsapp_profile_name: whatsappProfileName,
  })
  if (error) throw error

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null

  return {
    phoneE164: String(row.phone_e164),
    displayName: typeof row.display_name === 'string' ? row.display_name : null,
    whatsappProfileName:
      typeof row.whatsapp_profile_name === 'string' ? row.whatsapp_profile_name : null,
    customerId: typeof row.customer_id === 'string' ? row.customer_id : null,
    isExistingCustomer: row.is_existing_customer === true,
    orderCount: Number(row.order_count ?? 0),
  }
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
