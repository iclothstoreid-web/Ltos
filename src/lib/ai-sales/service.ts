import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { decideAiSalesReply } from './agent'
import { loadAiSalesKnowledge } from './knowledge'
import { selectAiSalesMediaAssets, type AiSalesMediaAsset } from './media'
import {
  appendInboundMessage,
  appendOutboundMessage,
  createSalesAction,
  getOrCreateConversation,
  isConversationAi,
  listRecentMessages,
  listSentMediaAssetKeys,
  updateConversationState,
  updateConversationStateIfAi,
} from './repository'
import { sendWhatsAppImage, sendWhatsAppText } from './whatsapp'
import type { AiSalesConversation, AiSalesCustomerPatch, AiSalesOrderIntent, WhatsAppInboundMessage, WhatsAppMessageEcho } from './types'

const HUMAN_FALLBACK = 'Siap, sebentar ya. Saya cek dulu biar nggak salah kasih info.'

export async function processWhatsAppMessageEcho(echo: WhatsAppMessageEcho): Promise<void> {
  const supabase = createAdminClient()
  const conversation = await getOrCreateConversation(supabase, echo.to)
  const { error } = await supabase.from('ai_sales_messages').insert({
    conversation_id: conversation.id,
    direction: 'outbound',
    role: 'human',
    provider_message_id: echo.providerMessageId,
    message_type: echo.type,
    text_content: echo.text || null,
    raw_payload: echo.rawPayload,
    delivery_status: 'sent',
  })
  if (error?.code === '23505') return
  if (error) throw error

  await updateConversationState(supabase, conversation.id, {
    mode: 'human',
    handoffReason: 'whatsapp_business_app_reply',
  })
  await createSalesAction(supabase, conversation.id, 'human_takeover',
    { source: 'whatsapp_business_app', providerMessageId: echo.providerMessageId }, 'executed')
}

async function isWhatsAppAutoReplyEnabled(
  supabase: ReturnType<typeof createAdminClient>
): Promise<boolean> {
  if (process.env.WHATSAPP_AI_FORCE_DISABLED === 'true') return false

  const { data, error } = await supabase
    .from('ai_sales_runtime_settings')
    .select('bool_value')
    .eq('key', 'whatsapp_auto_reply_enabled')
    .maybeSingle()

  if (error) return false
  return data?.bool_value === true
}

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

async function sendImageAndPersist(
  conversationId: string,
  to: string,
  asset: AiSalesMediaAsset
): Promise<void> {
  const supabase = createAdminClient()
  const providerMessageId = await sendWhatsAppImage(to, asset.imageUrl, asset.caption)
  await appendOutboundMessage(supabase, {
    conversation_id: conversationId,
    direction: 'outbound',
    role: 'assistant',
    provider_message_id: providerMessageId,
    message_type: 'image',
    text_content: asset.caption || asset.title,
    raw_payload: {
      asset_key: asset.assetKey,
      category: asset.category,
      image_url: asset.imageUrl,
      title: asset.title,
    },
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

  // Keep the webhook healthy and continue storing inbound messages while the
  // WhatsApp app review is in progress, but never call the AI or send an
  // automatic WhatsApp reply unless production explicitly enables it.
  if (!(await isWhatsAppAutoReplyEnabled(supabase))) return

  if (conversation.mode === 'human') return

  // Reactions and stickers are conversational acknowledgements, not reasons to
  // disable the AI thread or send a robotic fallback. Store them, then wait for
  // the customer's next meaningful message.
  if (['reaction', 'sticker'].includes(message.type)) return

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

    const stillAi = await updateConversationStateIfAi(supabase, conversation.id, {
      stage: decision.stage,
      mode: handoff ? 'human' : 'ai',
      handoffReason: handoff ? decision.handoffReason ?? 'ai_requested_handoff' : null,
      customerName: decision.customerPatch.name ?? conversation.customer_name,
      context: nextContext,
    })
    if (!stillAi) return

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
      // A reply sent from the WhatsApp Business App may have taken over while
      // the AI was composing its response. Do not speak over the human seller.
      if (!handoff && !(await isConversationAi(supabase, conversation.id))) return
      await sendAndPersist(conversation.id, message.from, decision.reply)

      if (!handoff) {
        try {
          const sentAssetKeys = await listSentMediaAssetKeys(supabase, conversation.id)
          const mediaAssets = await selectAiSalesMediaAssets(supabase, {
            customerText: message.text,
            currentStage: conversation.stage,
            sentAssetKeys,
            lead: nextContext.lead && typeof nextContext.lead === 'object'
              ? nextContext.lead as Record<string, unknown>
              : {},
          })

          for (const asset of mediaAssets) {
            if (!(await isConversationAi(supabase, conversation.id))) break
            try {
              await sendImageAndPersist(conversation.id, message.from, asset)
              await createSalesAction(
                supabase,
                conversation.id,
                'media_sent',
                {
                  assetKey: asset.assetKey,
                  category: asset.category,
                  title: asset.title,
                },
                'executed'
              )
            } catch (mediaSendError) {
              await createSalesAction(
                supabase,
                conversation.id,
                'media_send_failed',
                {
                  assetKey: asset.assetKey,
                  reason: mediaSendError instanceof Error ? mediaSendError.message : String(mediaSendError),
                },
                'failed'
              )
            }
          }
        } catch (mediaSelectError) {
          await createSalesAction(
            supabase,
            conversation.id,
            'media_select_failed',
            { reason: mediaSelectError instanceof Error ? mediaSelectError.message : String(mediaSelectError) },
            'failed'
          )
        }
      }
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
