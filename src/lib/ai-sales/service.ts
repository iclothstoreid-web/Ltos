import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { decideAiSalesReply } from './agent'
import { loadAiSalesKnowledge } from './knowledge'
import { cancelPendingFollowUps, scheduleFirstFollowUp } from './follow-up'
import { selectAiSalesMediaAssets, type AiSalesMediaAsset } from './media'
import {
  appendInboundMessage,
  appendOutboundMessage,
  createSalesAction,
  getOrCreateConversation,
  isConversationAi,
  isLatestInboundMessage,
  listRecentMessages,
  listSentMediaAssetKeys,
  resolveAiSalesCustomerContact,
  updateConversationState,
  updateConversationStateIfAi,
  updateOutboundDeliveryStatus,
} from './repository'
import { sendWhatsAppImage, sendWhatsAppText, setWhatsAppReadAndTyping } from './whatsapp'
import type {
  AiSalesConversation,
  AiSalesCustomerPatch,
  AiSalesOrderIntent,
  WhatsAppInboundMessage,
  WhatsAppMessageEcho,
  WhatsAppStatusUpdate,
} from './types'

const HUMAN_FALLBACK = 'Siap, sebentar ya. Saya cek dulu biar nggak salah kasih info.'
const STARTER_MEDIA_HOOK = 'Nah, biasanya dari detail begini customer mulai kebayang thobe yang dia mau. Ada yang paling kena di selera Kang?'

const REOPEN_GREETING_MS = 12 * 60 * 60 * 1000

function cleanCustomerName(value: string | null): string | null {
  const cleaned = value?.trim().replace(/^~+/, '').replace(/\s+/g, ' ')
  if (!cleaned) return null
  return cleaned.slice(0, 80)
}

function shouldGreetByName(previousInboundAt: string | null): boolean {
  if (!previousInboundAt) return true
  const previous = new Date(previousInboundAt).getTime()
  return Number.isFinite(previous) && Date.now() - previous >= REOPEN_GREETING_MS
}

function hasRespectfulTitle(name: string): boolean {
  return /^(?:kangbro|kang|pak|bapak|mas|bang|kak|ustadz|ustad|haji|h\.)\b/i.test(name)
}

function respectfulCustomerName(name: string): string {
  return hasRespectfulTitle(name) ? name : 'Kang ' + name
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^$()|[\]\\]/g, '\\$&')
}

function preventBareNameAddress(reply: string, displayName: string | null): string {
  const name = cleanCustomerName(displayName)
  if (!name || hasRespectfulTitle(name)) return reply

  const escaped = escapeRegExp(name)
  const patterns = [
    new RegExp('^(\\s*)' + escaped + '(?=[,!?.\\s]|$)', 'i'),
    new RegExp(
      '((?:sama-sama|siap|baik|halo|hai|terima kasih|makasih|bismillaah,?\\s*siap|assalamu[\'’]?alaikum)\\s*,?\\s*)' +
        escaped +
        '(?=[,!?.\\s]|$)',
      'i'
    ),
  ]

  let next = reply
  for (const pattern of patterns) {
    next = next.replace(pattern, (_match, prefix: string) => prefix + 'Kang ' + name)
  }
  return next
}

function personalizeFirstReply(
  reply: string,
  displayName: string | null,
  isExistingCustomer: boolean,
  greet: boolean
): string {
  const name = cleanCustomerName(displayName)
  if (!name) return reply

  if (!greet) return preventBareNameAddress(reply, name)

  const addressedName = respectfulCustomerName(name)
  const cleanedReply = reply
    .replace(
      /^(?:assalamu['’]?alaikum|bismillaah),?\s*(?:siap|halo|hai|senang bisa bantu lagi)?(?:\s+(?:kangbro|kang|kak|pak|bapak|mas|bang|bro|ustadz|ustad))?(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ.'’ -]{1,80})?\s*[🙏🙂😊!,.]*\s*/i,
      ''
    )
    .trim()

  const greeting = isExistingCustomer
    ? "Assalamu'alaikum " + addressedName + ', senang bisa bantu lagi 🙏'
    : 'Bismillaah, siap ' + addressedName + ' 🙏'

  return cleanedReply ? greeting + '\n\n' + cleanedReply : greeting
}
function humanReplyDelayMs(text: string, providerMessageId: string): number {
  const variation = providerMessageId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 900
  return Math.min(4300, 1700 + variation + Math.floor(text.length * 3.2))
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function processWhatsAppStatusUpdate(status: WhatsAppStatusUpdate): Promise<void> {
  const supabase = createAdminClient()
  const { conversationId } = await updateOutboundDeliveryStatus(
    supabase,
    status.providerMessageId,
    status.status
  )

  if (status.status === 'failed' && conversationId) {
    await createSalesAction(
      supabase,
      conversationId,
      'whatsapp_delivery_failed',
      {
        providerMessageId: status.providerMessageId,
        recipientId: status.recipientId,
        errors: status.errors,
      },
      'failed'
    )
  }
}

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
  asset: AiSalesMediaAsset,
  captionOverride?: string
): Promise<void> {
  const supabase = createAdminClient()
  const caption = captionOverride === undefined ? asset.caption : captionOverride
  const providerMessageId = await sendWhatsAppImage(to, asset.imageUrl, caption)
  await appendOutboundMessage(supabase, {
    conversation_id: conversationId,
    direction: 'outbound',
    role: 'assistant',
    provider_message_id: providerMessageId,
    message_type: 'image',
    text_content: caption || asset.title,
    raw_payload: {
      asset_key: asset.assetKey,
      category: asset.category,
      image_url: asset.imageUrl,
      title: asset.title,
      customer_caption: caption || null,
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
  const previousInboundAt = conversation.last_inbound_at

  const identity = await resolveAiSalesCustomerContact(
    supabase,
    message.from,
    message.profileName
  ).catch(() => null)

  const identityContext: Record<string, unknown> = {
    ...conversation.context,
    customerIdentity: {
      displayName: identity?.displayName ?? conversation.customer_name ?? message.profileName ?? null,
      whatsappProfileName: identity?.whatsappProfileName ?? message.profileName ?? null,
      isExistingCustomer: identity?.isExistingCustomer ?? false,
      orderCount: identity?.orderCount ?? 0,
    },
  }

  if (identity) {
    await updateConversationState(supabase, conversation.id, {
      customerId: identity.customerId,
      customerName: identity.displayName,
      context: identityContext,
    })
  }

  const activeConversation: AiSalesConversation = {
    ...conversation,
    customer_id: identity?.customerId ?? conversation.customer_id,
    customer_name: identity?.displayName ?? conversation.customer_name ?? message.profileName ?? null,
    customer_phone: identity?.phoneE164 ?? conversation.customer_phone ?? message.from,
    context: identityContext,
  }

  const inserted = await appendInboundMessage(supabase, {
    conversation_id: activeConversation.id,
    direction: 'inbound',
    role: 'customer',
    provider_message_id: message.providerMessageId,
    message_type: message.type,
    text_content: message.text || null,
    raw_payload: {
      ...message.rawPayload,
      whatsapp_profile_name: message.profileName,
    },
    delivery_status: 'received',
  })

  // Meta retries webhook deliveries. The provider message id is the hard
  // idempotency boundary: never run AI twice or send two replies for one input.
  if (!inserted) return

  // A new customer turn makes every pending reminder about the previous turn stale.
  await cancelPendingFollowUps(supabase, activeConversation.id)

  const autoReplyEnabled = await isWhatsAppAutoReplyEnabled(supabase)
  const willAutoReply = autoReplyEnabled && activeConversation.mode === 'ai'

  // Customer immediately sees blue ticks. When AI is going to reply, WhatsApp
  // also shows the native typing indicator while we compose the answer.
  try {
    await setWhatsAppReadAndTyping(message.providerMessageId, willAutoReply)
  } catch (presenceError) {
    await createSalesAction(
      supabase,
      activeConversation.id,
      'whatsapp_presence_failed',
      { reason: presenceError instanceof Error ? presenceError.message : String(presenceError) },
      'failed'
    )
  }

  // Keep storing/reading inbound messages even when automatic replies are off.
  if (!autoReplyEnabled) return

  if (activeConversation.mode === 'human') return

  // Human WhatsApp conversations often arrive as 2–3 short messages in a burst.
  // Wait briefly so the newest message can absorb the whole turn. If a newer
  // inbound arrived, this handler stays silent and lets that newer turn answer once.
  await wait(3500)
  if (!(await isLatestInboundMessage(supabase, activeConversation.id, message.providerMessageId))) {
    return
  }

  // Reactions and stickers are conversational acknowledgements, not reasons to
  // disable the AI thread or send a robotic fallback. Store them, then wait for
  // the customer's next meaningful message.
  if (['reaction', 'sticker'].includes(message.type)) return

  if (!message.text || !['text', 'interactive'].includes(message.type)) {
    await handoffUnsupportedMessage(activeConversation, message)
    return
  }

  try {
    const [history, knowledge] = await Promise.all([
      listRecentMessages(supabase, activeConversation.id),
      loadAiSalesKnowledge(supabase),
    ])

    const decision = await decideAiSalesReply({
      currentStage: activeConversation.stage,
      context: activeConversation.context,
      history,
      knowledge,
    })

    const nextContext = mergeContext(activeConversation, decision.customerPatch, decision.orderIntent)
    const handoff = decision.shouldHandoff || decision.nextAction === 'handoff'

    const stillAi = await updateConversationStateIfAi(supabase, activeConversation.id, {
      stage: decision.stage,
      mode: handoff ? 'human' : 'ai',
      handoffReason: handoff ? decision.handoffReason ?? 'ai_requested_handoff' : null,
      customerName: decision.customerPatch.name ?? activeConversation.customer_name,
      context: nextContext,
    })
    if (!stillAi) return

    if (decision.nextAction === 'collect_order_intent' && decision.orderIntent) {
      await createSalesAction(
        supabase,
        activeConversation.id,
        'order_intent',
        decision.orderIntent as Record<string, unknown>,
        'proposed'
      )
    }

    if (handoff) {
      await createSalesAction(
        supabase,
        activeConversation.id,
        'handoff',
        { reason: decision.handoffReason ?? 'ai_requested_handoff' },
        'executed'
      )
    }

    try {
      // A reply sent from the WhatsApp Business App may have taken over while
      // the AI was composing its response. Do not speak over the human seller.
      if (!handoff && !(await isConversationAi(supabase, activeConversation.id))) return

      const reply = personalizeFirstReply(
        decision.reply,
        activeConversation.customer_name,
        identity?.isExistingCustomer ?? false,
        shouldGreetByName(previousInboundAt)
      )
      await wait(humanReplyDelayMs(reply, message.providerMessageId))

      // The customer may add one more message while the reply is being composed.
      // Never send an answer to an already-superseded turn.
      if (!(await isLatestInboundMessage(supabase, activeConversation.id, message.providerMessageId))) {
        return
      }
      if (!handoff && !(await isConversationAi(supabase, activeConversation.id))) return

      await sendAndPersist(activeConversation.id, message.from, reply)

      if (!handoff) {
        try {
          const sentAssetKeys = await listSentMediaAssetKeys(supabase, activeConversation.id)
          const mediaAssets = await selectAiSalesMediaAssets(supabase, {
            customerText: message.text,
            currentStage: activeConversation.stage,
            sentAssetKeys,
            lead: nextContext.lead && typeof nextContext.lead === 'object'
              ? nextContext.lead as Record<string, unknown>
              : {},
          })

          const isStarterSequence =
            mediaAssets.length > 1 && mediaAssets.every(asset => asset.isStarter)
          let sentMediaCount = 0

          for (const asset of mediaAssets) {
            if (!(await isConversationAi(supabase, activeConversation.id))) break
            try {
              await sendImageAndPersist(
                activeConversation.id,
                message.from,
                asset,
                isStarterSequence ? '' : undefined
              )
              sentMediaCount += 1
              await createSalesAction(
                supabase,
                activeConversation.id,
                'media_sent',
                {
                  assetKey: asset.assetKey,
                  category: asset.category,
                  title: asset.title,
                  starterSequence: isStarterSequence,
                },
                'executed'
              )
            } catch (mediaSendError) {
              await createSalesAction(
                supabase,
                activeConversation.id,
                'media_send_failed',
                {
                  assetKey: asset.assetKey,
                  reason: mediaSendError instanceof Error ? mediaSendError.message : String(mediaSendError),
                },
                'failed'
              )
            }
          }

          if (
            isStarterSequence &&
            sentMediaCount >= 3 &&
            (await isConversationAi(supabase, activeConversation.id)) &&
            (await isLatestInboundMessage(supabase, activeConversation.id, message.providerMessageId))
          ) {
            await wait(650)
            await sendAndPersist(activeConversation.id, message.from, STARTER_MEDIA_HOOK)
          }
        } catch (mediaSelectError) {
          await createSalesAction(
            supabase,
            activeConversation.id,
            'media_select_failed',
            { reason: mediaSelectError instanceof Error ? mediaSelectError.message : String(mediaSelectError) },
            'failed'
          )
        }
        try {
          await scheduleFirstFollowUp(supabase, activeConversation.id, message.text)
        } catch (followUpError) {
          await createSalesAction(supabase, activeConversation.id, 'follow_up_schedule_failed', {
            reason: followUpError instanceof Error ? followUpError.message : String(followUpError),
          }, 'failed')
        }
      }
    } catch (sendError) {
      await updateConversationState(supabase, activeConversation.id, {
        mode: 'human',
        handoffReason: 'outbound_send_failed',
      })
      await createSalesAction(
        supabase,
        activeConversation.id,
        'outbound_send_failed',
        { reason: sendError instanceof Error ? sendError.message : String(sendError) },
        'failed'
      )
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    await updateConversationState(supabase, activeConversation.id, {
      mode: 'human',
      handoffReason: 'agent_runtime_error',
    })
    await createSalesAction(supabase, activeConversation.id, 'agent_runtime_error', { reason }, 'failed')

    try {
      await sendAndPersist(activeConversation.id, message.from, HUMAN_FALLBACK)
    } catch (sendError) {
      await createSalesAction(
        supabase,
        activeConversation.id,
        'outbound_send_failed',
        { reason: sendError instanceof Error ? sendError.message : String(sendError) },
        'failed'
      )
    }
  }
}
