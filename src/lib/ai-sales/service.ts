import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { decideAiSalesReply } from './agent'
import { loadAiSalesKnowledge } from './knowledge'
import {
  appendInboundMessage,
  appendOutboundMessage,
  createSalesAction,
  getOrCreateConversation,
  listRecentMessages,
  updateConversationState,
} from './repository'
import { sendWhatsAppText } from './whatsapp'
import type { AiSalesConversation, AiSalesCustomerPatch, AiSalesOrderIntent, WhatsAppInboundMessage } from './types'

const HUMAN_FALLBACK = 'Pesannya sudah kami terima. Saya teruskan ke tim Local Tailor supaya bisa dibantu dengan tepat ya.'

function mergeContext(
  conversation: AiSalesConversation,
  customerPatch: AiSalesCustomerPatch,
  orderIntent: AiSalesOrderIntent | null
): Record<string, unknown> {
  const currentLead =
    conversation.context.lead && typeof conversation.context.lead === 'object'
      ? (conversation.context.lead as Record<string, unknown>)
      : {}

  return {
    ...conversation.context,
    lead: { ...currentLead, ...customerPatch },
    ...(orderIntent ? { orderIntent } : {}),
  }
}

async function sendAndPersist(
  conversationId: string,
  to: string,
  body: string
): Promise<void> {
  const supabase = createAdminClient()
  const providerMessageId = await sendWhatsAppText(to, body)
  await appendOutboundMessage(supabase, {
    conversation_id: conversationId,
    direction: 'outbound',
    role: 'assistant',
    provider_message_id: providerMessageId,
    message_type: 'text',
    text_content: body,
    delivery_status: 'sent',
  })
}

async function handoffUnsupportedMessage(
  conversation: AiSalesConversation,
  message: WhatsAppInboundMessage
): Promise<void> {
  const supabase = createAdminClient()
  const reason = `unsupported_whatsapp_message:${message.type}`

  await updateConversationState(supabase, conversation.id, {
    mode: 'human',
    handoffReason: reason,
  })
  await createSalesAction(supabase, conversation.id, 'handoff', { reason, messageType: message.type }, 'executed')

  try {
    await sendAndPersist(conversation.id, message.from, HUMAN_FALLBACK)
  } catch (error) {
    await createSalesAction(
      supabase,
      conversation.id,
      'outbound_send_failed',
      { reason: error instanceof Error ? error.message : String(error) },
      'failed'
    )
  }
}

export async function processWhatsAppInbound(message: WhatsAppInboundMessage): Promise<void> {
  const supabase = createAdminClient()
  const conversation = await getOrCreateConversation(supabase, message.from)

  const inserted = await appendInboundMessage(supabase, {
    conversation_id: conversation.id,
    direction: 'inbound',
    role: 'customer',
    provider_message_id: message.providerMessageId,
    message_type: message.type,
    text_content: message.text || null,
    raw_payload: message.rawPayload,
    delivery_status: 'received',
  })

  // Meta retries webhook deliveries. The provider message id is the hard
  // idempotency boundary: never run AI twice or send two replies for one input.
  if (!inserted) return

  if (conversation.mode === 'human') return

  if (!message.text || !['text', 'interactive'].includes(message.type)) {
    await handoffUnsupportedMessage(conversation, message)
    return
  }

  try {
    const [history, knowledge] = await Promise.all([
      listRecentMessages(supabase, conversation.id),
      loadAiSalesKnowledge(supabase),
    ])

    const decision = await decideAiSalesReply({
      currentStage: conversation.stage,
      context: conversation.context,
      history,
      knowledge,
    })

    const nextContext = mergeContext(conversation, decision.customerPatch, decision.orderIntent)
    const handoff = decision.shouldHandoff || decision.nextAction === 'handoff'

    await updateConversationState(supabase, conversation.id, {
      stage: decision.stage,
      mode: handoff ? 'human' : 'ai',
      handoffReason: handoff ? decision.handoffReason ?? 'ai_requested_handoff' : null,
      customerName: decision.customerPatch.name ?? conversation.customer_name,
      context: nextContext,
    })

    if (decision.nextAction === 'collect_order_intent' && decision.orderIntent) {
      await createSalesAction(
        supabase,
        conversation.id,
        'order_intent',
        decision.orderIntent as Record<string, unknown>,
        'proposed'
      )
    }

    if (handoff) {
      await createSalesAction(
        supabase,
        conversation.id,
        'handoff',
        { reason: decision.handoffReason ?? 'ai_requested_handoff' },
        'executed'
      )
    }

    try {
      await sendAndPersist(conversation.id, message.from, decision.reply)
    } catch (sendError) {
      await updateConversationState(supabase, conversation.id, {
        mode: 'human',
        handoffReason: 'outbound_send_failed',
      })
      await createSalesAction(
        supabase,
        conversation.id,
        'outbound_send_failed',
        { reason: sendError instanceof Error ? sendError.message : String(sendError) },
        'failed'
      )
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    await updateConversationState(supabase, conversation.id, {
      mode: 'human',
      handoffReason: 'agent_runtime_error',
    })
    await createSalesAction(supabase, conversation.id, 'agent_runtime_error', { reason }, 'failed')

    try {
      await sendAndPersist(conversation.id, message.from, HUMAN_FALLBACK)
    } catch (sendError) {
      await createSalesAction(
        supabase,
        conversation.id,
        'outbound_send_failed',
        { reason: sendError instanceof Error ? sendError.message : String(sendError) },
        'failed'
      )
    }
  }
}
