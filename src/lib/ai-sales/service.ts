import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { decideAiSalesReply } from './agent'
import { loadAiSalesKnowledge } from './knowledge'
import { recordConversationLearningSignal } from './learning'
import { cancelPendingFollowUps, scheduleFirstFollowUp } from './follow-up'
import { isAiSalesVisualRequest, selectAiSalesMediaAssets, type AiSalesMediaAsset } from './media'
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
  AiSalesMessage,
  AiSalesOrderIntent,
  WhatsAppInboundMessage,
  WhatsAppMessageEcho,
  WhatsAppStatusUpdate,
} from './types'

const HUMAN_FALLBACK = 'Siap, sebentar ya 🙏 Saya sambungkan ke admin biar lanjutannya langsung ditangani.'
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

type PreferredAddress = NonNullable<AiSalesCustomerPatch['preferredAddress']>

function respectfulCustomerName(name: string, preferredAddress?: PreferredAddress | null): string {
  return hasRespectfulTitle(name) ? name : (preferredAddress ?? 'Kang') + ' ' + name
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^$()|[\]\\]/g, '\\$&')
}

function preventBareNameAddress(
  reply: string,
  displayName: string | null,
  preferredAddress?: PreferredAddress | null
): string {
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
    next = next.replace(pattern, (_match, prefix: string) => prefix + (preferredAddress ?? 'Kang') + ' ' + name)
  }
  return next
}

function alignPreferredAddress(reply: string, preferredAddress?: PreferredAddress | null): string {
  if (!preferredAddress || preferredAddress === 'Kang') return reply
  return reply
    .replace(/\bKangBro\b/gi, preferredAddress)
    .replace(/\bKang\b/gi, preferredAddress)
}

function personalizeFirstReply(
  reply: string,
  displayName: string | null,
  isExistingCustomer: boolean,
  greet: boolean,
  preferredAddress?: PreferredAddress | null
): string {
  const alignedReply = alignPreferredAddress(reply, preferredAddress)
  const name = cleanCustomerName(displayName)
  if (!name) return alignedReply

  if (!greet) return preventBareNameAddress(alignedReply, name, preferredAddress)

  const addressedName = respectfulCustomerName(name, preferredAddress)
  const cleanedReply = alignedReply
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

function latestCustomerTurnText(history: AiSalesMessage[]): string {
  const turn: string[] = []
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const message = history[index]
    if (message.role !== 'customer') break
    if (message.text_content?.trim()) turn.unshift(message.text_content.trim())
  }
  return turn.join('\n').trim()
}

function currentPreferredAddress(context: Record<string, unknown>): PreferredAddress | null {
  const lead = context.lead && typeof context.lead === 'object'
    ? context.lead as Record<string, unknown>
    : {}
  const value = lead.preferredAddress
  return typeof value === 'string' &&
    ['Pak', 'Bapak', 'Kang', 'Kak', 'Mas', 'Bang', 'Ustadz'].includes(value)
    ? value as PreferredAddress
    : null
}

function inferPreferredAddress(text: string, existing: PreferredAddress | null): PreferredAddress | null {
  if (/\b(?:saya|aku|ana)\s+(?:akhwat|perempuan|wanita)\b/i.test(text)) return 'Kak'
  const requested = text.match(/\b(?:panggil|sapaan|sebut)\s+(?:saya|aku|ana)?\s*(pak|bapak|kang|kak|mas|bang|ustadz)\b/i)?.[1]
  if (requested) {
    const normalized: Record<string, PreferredAddress> = {
      pak: 'Pak',
      bapak: 'Bapak',
      kang: 'Kang',
      kak: 'Kak',
      mas: 'Mas',
      bang: 'Bang',
      ustadz: 'Ustadz',
    }
    return normalized[requested.toLowerCase()] ?? existing
  }
  return existing
}

function asksForHumanSeller(text: string): boolean {
  return /(?:minta|mau|ingin|boleh|bisa).{0,24}(?:admin|orang(?:nya)?|manusia|sales(?:nya)?|cs\b)|(?:admin|orang(?:nya)?|manusia|sales(?:nya)?).{0,24}(?:dong|aja|saja|langsung|tolong)|bukan\s+(?:bot|ai)|ngobrol\s+(?:sama|dengan)\s+(?:admin|orang|manusia)/i.test(text)
}

function isConversationLoopFrustration(text: string): boolean {
  return /(?:pusing|cape|capek|muter|berputar|ngulang|ulang terus|kok gak nyambung|kok nggak nyambung|tidak nyambung|nggak nyambung)/i.test(text)
}

function asksUnsupportedWomensGarment(text: string): boolean {
  return /(?:abaya|gamis\s*(?:wanita|akhwat)|dress\s*wanita|baju\s*wanita|women'?s?\s*(?:dress|abaya|garment))/i.test(text)
}

function handoffAddress(preferredAddress: PreferredAddress | null): string {
  return preferredAddress ?? 'Kak'
}

function plannedMediaForAgent(assets: AiSalesMediaAsset[]) {
  return assets.map(asset => ({
    assetKey: asset.assetKey,
    category: asset.category,
    title: asset.title,
    modelFamily: asset.modelFamily,
    fabricName: asset.fabricName,
    colorName: asset.colorName,
    partName: asset.partName,
  }))
}

async function captureHumanCorrectionCandidate(
  supabase: ReturnType<typeof createAdminClient>,
  conversationId: string,
  humanText: string,
  humanCreatedAt: string
): Promise<void> {
  const text = humanText.trim()
  if (text.length < 8) return

  const { data: previousAssistant } = await supabase
    .from('ai_sales_messages')
    .select('id, created_at')
    .eq('conversation_id', conversationId)
    .eq('direction', 'outbound')
    .eq('role', 'assistant')
    .lt('created_at', humanCreatedAt)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: latestInbound } = await supabase
    .from('ai_sales_messages')
    .select('created_at')
    .eq('conversation_id', conversationId)
    .eq('direction', 'inbound')
    .lt('created_at', humanCreatedAt)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!previousAssistant?.id || !previousAssistant.created_at || !latestInbound?.created_at) return

  const humanAt = new Date(humanCreatedAt).getTime()
  const assistantAt = new Date(previousAssistant.created_at).getTime()
  const inboundAt = new Date(latestInbound.created_at).getTime()
  if (![humanAt, assistantAt, inboundAt].every(Number.isFinite)) return
  if (assistantAt < inboundAt || humanAt - assistantAt > 15 * 60 * 1000) return

  await supabase.from('ai_sales_message_reviews').upsert(
    {
      message_id: previousAssistant.id,
      verdict: 'candidate',
      corrected_reply: text,
      notes: 'Auto-captured human takeover candidate. Owner review required before training.',
      reviewed_by: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'message_id' }
  )
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
  const { data: humanMessage, error } = await supabase.from('ai_sales_messages').insert({
    conversation_id: conversation.id,
    direction: 'outbound',
    role: 'human',
    provider_message_id: echo.providerMessageId,
    message_type: echo.type,
    text_content: echo.text || null,
    raw_payload: echo.rawPayload,
    delivery_status: 'sent',
  }).select('id, created_at').single()
  if (error?.code === '23505') return
  if (error) throw error

  if (echo.text && humanMessage?.created_at) {
    await captureHumanCorrectionCandidate(
      supabase,
      conversation.id,
      echo.text,
      humanMessage.created_at
    ).catch(() => undefined)
  }

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
  orderIntent: AiSalesOrderIntent | null,
  conversationSense?: { tone: string; concern: string | null; nextStep: string | null }
): Record<string, unknown> {
  const currentLead =
    conversation.context.lead && typeof conversation.context.lead === 'object'
      ? (conversation.context.lead as Record<string, unknown>)
      : {}

  return {
    ...conversation.context,
    lead: { ...currentLead, ...customerPatch },
    ...(orderIntent ? { orderIntent } : {}),
    ...(conversationSense ? { conversationSense } : {}),
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

  // Store an outcome signal for owner review, never as automatic training truth.
  if (message.text) {
    const { data: inbound } = await supabase.from('ai_sales_messages')
      .select('id').eq('provider_message_id', message.providerMessageId).maybeSingle()
    if (inbound?.id) {
      await recordConversationLearningSignal(supabase, activeConversation.id, inbound.id, message.text)
    }
  }

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
  // Customers often send a photo first and type their question seconds later.
  // Give image-only turns a longer window, without switching the chat to human mode.
  await wait(message.type === 'image' ? 13000 : 3500)
  if (!(await isLatestInboundMessage(supabase, activeConversation.id, message.providerMessageId))) {
    return
  }

  // Reactions and stickers are acknowledgements; an image alone needs a short,
  // useful clarifier. Do not claim to recognize fabric or price from its pixels.
  if (['reaction', 'sticker'].includes(message.type)) return

  if (message.type === 'image' && !message.text) {
    const address = handoffAddress(currentPreferredAddress(activeConversation.context))
    await sendAndPersist(
      activeConversation.id,
      message.from,
      `Fotonya sudah masuk, ${address} 🙏 Mau tanya soal model, bahan, atau harganya?`
    )
    return
  }

  if (!message.text || !['text', 'interactive', 'image'].includes(message.type)) {
    await handoffUnsupportedMessage(activeConversation, message)
    return
  }

  try {
    const [history, knowledge, sentAssetKeys] = await Promise.all([
      listRecentMessages(supabase, activeConversation.id, 32),
      loadAiSalesKnowledge(supabase),
      listSentMediaAssetKeys(supabase, activeConversation.id),
    ])

    const customerTurnText = latestCustomerTurnText(history) || message.text
    const existingAddress = currentPreferredAddress(activeConversation.context)
    const preferredAddress = inferPreferredAddress(customerTurnText, existingAddress)
    const existingLead =
      activeConversation.context.lead && typeof activeConversation.context.lead === 'object'
        ? activeConversation.context.lead as Record<string, unknown>
        : {}
    const workingContext: Record<string, unknown> = {
      ...activeConversation.context,
      lead: {
        ...existingLead,
        ...(preferredAddress ? { preferredAddress } : {}),
      },
    }
    const workingConversation: AiSalesConversation = {
      ...activeConversation,
      context: workingContext,
    }
    const address = handoffAddress(preferredAddress)

    // Explicit requests for a person, or clear "this bot is looping" feedback,
    // are deterministic handoffs. Do not ask the model whether it should keep talking.
    if (asksForHumanSeller(customerTurnText) || isConversationLoopFrustration(customerTurnText)) {
      const reason = asksForHumanSeller(customerTurnText)
        ? 'customer_requested_human'
        : 'conversation_loop_frustration'
      await updateConversationState(supabase, activeConversation.id, {
        mode: 'human',
        handoffReason: reason,
        context: workingContext,
      })
      await createSalesAction(
        supabase,
        activeConversation.id,
        'handoff',
        { reason, customerTurnText },
        'executed'
      )
      await sendAndPersist(
        activeConversation.id,
        message.from,
        `Siap ${address} 🙏 Saya sambungkan ke admin ya. Biar lanjutannya langsung ditangani orang dan nggak muter lagi.`
      )
      return
    }

    // Women's garments are not yet represented by a verified LTOS visual/product
    // library. Handle the thobe context honestly, then give the couple request to a human.
    if (asksUnsupportedWomensGarment(customerTurnText)) {
      const reason = 'womens_garment_requires_human'
      await updateConversationState(supabase, activeConversation.id, {
        mode: 'human',
        handoffReason: reason,
        context: workingContext,
      })
      await createSalesAction(
        supabase,
        activeConversation.id,
        'handoff',
        { reason, customerTurnText },
        'executed'
      )
      await sendAndPersist(
        activeConversation.id,
        message.from,
        `Siap ${address} 🙏 Untuk thobe-nya bisa kami bantu di sini. Untuk abaya/gamis wanitanya saya sambungkan ke admin supaya referensi dan arahnya benar, nggak saya tebak-tebak.`
      )
      return
    }

    const visualRequested = isAiSalesVisualRequest(customerTurnText)
    let mediaAssets: AiSalesMediaAsset[] = []
    try {
      mediaAssets = await selectAiSalesMediaAssets(supabase, {
        customerText: customerTurnText,
        currentStage: activeConversation.stage,
        sentAssetKeys,
        lead: workingContext.lead && typeof workingContext.lead === 'object'
          ? workingContext.lead as Record<string, unknown>
          : {},
      })
    } catch (mediaSelectError) {
      await createSalesAction(
        supabase,
        activeConversation.id,
        'media_select_failed',
        { reason: mediaSelectError instanceof Error ? mediaSelectError.message : String(mediaSelectError) },
        'failed'
      )
      if (visualRequested) {
        await updateConversationState(supabase, activeConversation.id, {
          mode: 'human',
          handoffReason: 'visual_selection_failed',
          context: workingContext,
        })
        await sendAndPersist(
          activeConversation.id,
          message.from,
          `Sebentar ya ${address} 🙏 Referensi gambarnya lagi nggak kebaca dengan benar. Saya sambungkan ke admin biar dikirim yang tepat.`
        )
        return
      }
    }

    // A visual request must result in a real selected asset or an honest handoff.
    // The AI is never allowed to promise an image that the execution layer cannot send.
    if (visualRequested && mediaAssets.length === 0) {
      const reason = 'verified_visual_not_available'
      await updateConversationState(supabase, activeConversation.id, {
        mode: 'human',
        handoffReason: reason,
        context: workingContext,
      })
      await createSalesAction(
        supabase,
        activeConversation.id,
        'handoff',
        { reason, customerTurnText },
        'executed'
      )
      await sendAndPersist(
        activeConversation.id,
        message.from,
        `Siap ${address} 🙏 Untuk referensi yang persis itu belum ada di library gambar yang sudah terverifikasi. Saya sambungkan ke admin biar dikirim visual yang benar, bukan asal gambar.`
      )
      return
    }

    const decision = await decideAiSalesReply({
      currentStage: activeConversation.stage,
      context: workingContext,
      history,
      knowledge,
      visualRequested,
      plannedMedia: plannedMediaForAgent(mediaAssets),
    })

    if (preferredAddress && !decision.customerPatch.preferredAddress) {
      decision.customerPatch.preferredAddress = preferredAddress
    }

    const nextContext = mergeContext(
      workingConversation,
      decision.customerPatch,
      decision.orderIntent,
      decision.conversationSense
    )
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
      if (!handoff && !(await isConversationAi(supabase, activeConversation.id))) return

      const nextAddress = currentPreferredAddress(nextContext)
      const reply = personalizeFirstReply(
        decision.reply,
        activeConversation.customer_name,
        identity?.isExistingCustomer ?? false,
        shouldGreetByName(previousInboundAt),
        nextAddress
      )
      const isStarterSequence =
        mediaAssets.length > 1 && mediaAssets.every(asset => asset.isStarter)
      let sentMediaCount = 0

      const sendSelectedMedia = async (): Promise<number> => {
        let count = 0
        for (const asset of mediaAssets) {
          if (!(await isConversationAi(supabase, activeConversation.id))) break
          if (!(await isLatestInboundMessage(supabase, activeConversation.id, message.providerMessageId))) break
          try {
            await sendImageAndPersist(
              activeConversation.id,
              message.from,
              asset,
              isStarterSequence ? '' : undefined
            )
            count += 1
            await createSalesAction(
              supabase,
              activeConversation.id,
              'media_sent',
              {
                assetKey: asset.assetKey,
                category: asset.category,
                title: asset.title,
                starterSequence: isStarterSequence,
                visualRequested,
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
        return count
      }

      await wait(humanReplyDelayMs(reply, message.providerMessageId))
      if (!(await isLatestInboundMessage(supabase, activeConversation.id, message.providerMessageId))) return
      if (!handoff && !(await isConversationAi(supabase, activeConversation.id))) return

      // Explicit image requests are action-first: deliver the real visual before
      // the text reply. This makes "lihat contoh" behave like a human salesperson,
      // not a bot promising a future attachment.
      if (visualRequested && !handoff) {
        sentMediaCount = await sendSelectedMedia()
        if (sentMediaCount === 0) {
          await updateConversationState(supabase, activeConversation.id, {
            mode: 'human',
            handoffReason: 'visual_delivery_failed',
            context: nextContext,
          })
          await createSalesAction(
            supabase,
            activeConversation.id,
            'handoff',
            { reason: 'visual_delivery_failed' },
            'executed'
          )
          await sendAndPersist(
            activeConversation.id,
            message.from,
            `Maaf ${handoffAddress(nextAddress)} 🙏 Gambarnya gagal terkirim. Saya sambungkan ke admin biar langsung dikirim manual.`
          )
          return
        }
        await wait(350)
        if (!(await isLatestInboundMessage(supabase, activeConversation.id, message.providerMessageId))) return
        await sendAndPersist(activeConversation.id, message.from, reply)
      } else {
        await sendAndPersist(activeConversation.id, message.from, reply)
        if (!handoff && mediaAssets.length) {
          sentMediaCount = await sendSelectedMedia()
        }
      }

      if (
        !visualRequested &&
        isStarterSequence &&
        sentMediaCount >= 3 &&
        (await isConversationAi(supabase, activeConversation.id)) &&
        (await isLatestInboundMessage(supabase, activeConversation.id, message.providerMessageId))
      ) {
        await wait(650)
        await sendAndPersist(
          activeConversation.id,
          message.from,
          STARTER_MEDIA_HOOK.replace(/Kang/g, handoffAddress(nextAddress))
        )
      }

      if (!handoff) {
        try {
          await scheduleFirstFollowUp(supabase, activeConversation.id, customerTurnText)
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
