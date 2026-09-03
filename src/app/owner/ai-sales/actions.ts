'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { appendOutboundMessage, createSalesAction } from '@/lib/ai-sales/repository'
import { sendWhatsAppText } from '@/lib/ai-sales/whatsapp'

async function requireOwner() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile || !['admin', 'owner'].includes(profile.role)) {
    throw new Error('Owner/Admin access required.')
  }

  return { supabase, user }
}

export async function setAiSalesMode(formData: FormData) {
  const conversationId = String(formData.get('conversationId') ?? '')
  const mode = String(formData.get('mode') ?? '')
  if (!conversationId || !['ai', 'human'].includes(mode)) return

  const { supabase, user } = await requireOwner()
  const handoffReason = mode === 'human' ? 'manual_owner_takeover' : null
  const { error } = await supabase
    .from('ai_sales_conversations')
    .update({ mode, handoff_reason: handoffReason, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
  if (error) throw error

  await createSalesAction(
    supabase,
    conversationId,
    mode === 'human' ? 'human_takeover' : 'ai_resumed',
    { actorUserId: user.id },
    'executed'
  )

  revalidatePath('/owner/ai-sales')
}

export async function sendAiSalesHumanReply(formData: FormData) {
  const conversationId = String(formData.get('conversationId') ?? '')
  const text = String(formData.get('text') ?? '').trim().slice(0, 3000)
  if (!conversationId || !text) return

  const { supabase, user } = await requireOwner()
  const { data: conversation, error } = await supabase
    .from('ai_sales_conversations')
    .select('external_contact_id')
    .eq('id', conversationId)
    .single()
  if (error || !conversation) throw error ?? new Error('AI Sales conversation not found.')

  const providerMessageId = await sendWhatsAppText(conversation.external_contact_id, text)

  await appendOutboundMessage(supabase, {
    conversation_id: conversationId,
    direction: 'outbound',
    role: 'human',
    provider_message_id: providerMessageId,
    message_type: 'text',
    text_content: text,
    delivery_status: 'sent',
  })

  const { error: modeError } = await supabase
    .from('ai_sales_conversations')
    .update({
      mode: 'human',
      handoff_reason: 'manual_owner_reply',
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
  if (modeError) throw modeError

  await createSalesAction(
    supabase,
    conversationId,
    'human_reply',
    { actorUserId: user.id, providerMessageId },
    'executed'
  )

  revalidatePath('/owner/ai-sales')
}
