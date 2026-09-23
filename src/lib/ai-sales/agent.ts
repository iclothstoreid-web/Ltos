import 'server-only'
import { getOpenAIClient } from '@/lib/ai/client'
import {
  AI_SALES_STAGES,
  type AiSalesCustomerPatch,
  type AiSalesDecision,
  type AiSalesKnowledge,
  type AiSalesMessage,
  type AiSalesOrderIntent,
  type AiSalesStage,
} from './types'

const NEXT_ACTIONS = ['continue', 'handoff', 'collect_order_intent'] as const
const FITTING_PREFERENCES = ['online', 'showroom', 'home_visit', 'unknown'] as const

function isStage(value: unknown): value is AiSalesStage {
  return typeof value === 'string' && (AI_SALES_STAGES as readonly string[]).includes(value)
}

function isNextAction(value: unknown): value is AiSalesDecision['nextAction'] {
  return typeof value === 'string' && (NEXT_ACTIONS as readonly string[]).includes(value)
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function sanitizeCustomerPatch(value: unknown): AiSalesCustomerPatch {
  const source = asRecord(value)
  const keys: Array<keyof AiSalesCustomerPatch> = [
    'name',
    'phone',
    'city',
    'eventDate',
    'budget',
    'model',
    'fabric',
    'color',
    'collar',
    'cuff',
    'placket',
    'pocket',
    'notes',
  ]
  const result: AiSalesCustomerPatch = {}

  for (const key of keys) {
    const raw = source[key]
    if (typeof raw === 'string' && raw.trim()) result[key] = raw.trim()
  }

  return result
}

function sanitizeOrderIntent(value: unknown): AiSalesOrderIntent | null {
  if (value === null || value === undefined) return null
  const source = asRecord(value)
  const result: AiSalesOrderIntent = {}

  for (const key of ['model', 'fabric', 'color', 'collar', 'cuff', 'placket', 'pocket', 'customerCommitment'] as const) {
    const raw = source[key]
    if (typeof raw === 'string' && raw.trim()) result[key] = raw.trim()
  }

  const quantity = source.quantity
  if (typeof quantity === 'number' && Number.isFinite(quantity) && quantity > 0) {
    result.quantity = Math.max(1, Math.round(quantity))
  }

  const fittingPreference = source.fittingPreference
  if (
    typeof fittingPreference === 'string' &&
    (FITTING_PREFERENCES as readonly string[]).includes(fittingPreference)
  ) {
    result.fittingPreference = fittingPreference as AiSalesOrderIntent['fittingPreference']
  }

  return Object.keys(result).length ? result : null
}

function parseDecision(raw: string, currentStage: AiSalesStage): AiSalesDecision {
  const parsed = asRecord(JSON.parse(raw))
  const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : ''
  if (!reply) throw new Error('AI Sales returned an empty reply.')

  const shouldHandoff = parsed.shouldHandoff === true
  const handoffReason = typeof parsed.handoffReason === 'string' && parsed.handoffReason.trim()
    ? parsed.handoffReason.trim()
    : null

  return {
    reply,
    stage: isStage(parsed.stage) ? parsed.stage : currentStage,
    shouldHandoff,
    handoffReason,
    customerPatch: sanitizeCustomerPatch(parsed.customerPatch),
    nextAction: isNextAction(parsed.nextAction) ? parsed.nextAction : shouldHandoff ? 'handoff' : 'continue',
    orderIntent: sanitizeOrderIntent(parsed.orderIntent),
  }
}

function compactKnowledge(knowledge: AiSalesKnowledge, currentStage: AiSalesStage) {
  const stageBrain = knowledge.brainEntries.filter(entry => !entry.stage || entry.stage === currentStage)
  const stageExamples = knowledge.trainingExamples.filter(example => !example.stageBefore || example.stageBefore === currentStage)

  return {
    // Prices here are component/master-option values used by LTOS Price Snapshot,
    // NOT permission for the model to invent or sum a final quote.
    catalog_options: knowledge.options.slice(0, 180),
    available_fabrics: knowledge.fabrics.slice(0, 96),
    commercial_rules: knowledge.commercialRules,
    live_business_facts: knowledge.businessFacts.slice(0, 80),
    sales_brain: stageBrain.slice(0, 60),
    training_examples: stageExamples.slice(0, 24),
  }
}

function latestCustomerText(history: AiSalesMessage[]): string {
  return (
    [...history]
      .reverse()
      .find(message => message.role === 'customer' && message.text_content)
      ?.text_content?.trim() ?? ''
  )
}

function getContextString(context: Record<string, unknown>, key: string): string | null {
  const direct = context[key]
  if (typeof direct === 'string' && direct.trim()) return direct.trim()

  const lead = asRecord(context.lead)
  const leadValue = lead[key]
  if (typeof leadValue === 'string' && leadValue.trim()) return leadValue.trim()

  const order = asRecord(context.order)
  const orderValue = order[key]
  if (typeof orderValue === 'string' && orderValue.trim()) return orderValue.trim()

  return null
}

function hasBusinessFact(knowledge: AiSalesKnowledge, pattern: RegExp): boolean {
  return knowledge.businessFacts.some(fact =>
    pattern.test(`${fact.key} ${fact.label} ${fact.value} ${fact.notes ?? ''}`.toLowerCase())
  )
}

function trustedCommercialCorpus(knowledge: AiSalesKnowledge, context: Record<string, unknown>): string {
  return [
    ...knowledge.businessFacts.map(fact => `${fact.key} ${fact.label} ${fact.value} ${fact.notes ?? ''}`),
    JSON.stringify(context),
  ]
    .join(' ')
    .toLowerCase()
}

function extractRupiahAmounts(text: string): string[] {
  const results: string[] = []
  const regex = /rp\s*([0-9][0-9. ,]*)/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(text))) {
    const digits = match[1].replace(/\D/g, '')
    if (digits) results.push(digits)
  }
  return results
}

function normalizeDigits(text: string): string {
  return text.replace(/\D/g, '')
}

function applyDeterministicGuardrails(
  decision: AiSalesDecision,
  params: {
    currentStage: AiSalesStage
    context: Record<string, unknown>
    history: AiSalesMessage[]
    knowledge: AiSalesKnowledge
  }
): AiSalesDecision {
  const rawMessage = latestCustomerText(params.history)
  const message = rawMessage.toLowerCase()
  let next: AiSalesDecision = {
    ...decision,
    customerPatch: sanitizeCustomerPatch(decision.customerPatch),
    orderIntent: sanitizeOrderIntent(decision.orderIntent),
  }

  const forceHandoff = (reason: string, reply?: string) => {
    next = {
      ...next,
      ...(reply ? { reply } : {}),
      shouldHandoff: true,
      handoffReason: reason,
      nextAction: 'handoff',
      orderIntent: null,
    }
  }

  const isComplaint =
    params.currentStage === 'order' &&
    /(komplain|kecewa|tidak nyaman|nggak nyaman|kurang nyaman|sempit|ketarik|kebesaran|kekecilan|rusak|salah ukuran|tidak sesuai|nggak sesuai)/i.test(
      rawMessage
    )

  if (isComplaint) {
    forceHandoff('after_sales_issue')
  }

  const asksSizeFromSparseBodyData =
    /(size|ukuran)/i.test(rawMessage) &&
    /(tinggi|berat)/i.test(rawMessage) &&
    !/(lingkar|bahu|pundak|dada|perut|panggul|biceps|siku|lengan|leher|pergelangan)/i.test(rawMessage)

  if (asksSizeFromSparseBodyData) {
    next = {
      ...next,
      reply:
        'Data tinggi dan berat membantu sebagai konteks awal, Kang, tapi belum cukup untuk menentukan size custom. Saya perlu beberapa ukuran badan utama atau reference thobe yang sudah nyaman supaya panjang, lebar, dan ease-nya tidak ditebak.',
      stage: params.currentStage === 'new' ? 'qualified' : params.currentStage,
      shouldHandoff: false,
      handoffReason: null,
      nextAction: 'continue',
      orderIntent: null,
    }
  }

  const asksAccount = /(rekening|nomor rekening|transfer ke mana|transfer kemana)/i.test(rawMessage)
  const asksExactDp =
    /((dp|down payment).*(berapa|nominal))|((berapa|nominal).*(dp|down payment))/i.test(rawMessage)
  const asksCod = /(\bcod\b|bayar.*(setelah|saat).*(terima|sampai)|bayar.*barang.*sampai)/i.test(rawMessage)
  const asksDiscount = /(diskon|discount|potongan|promo)/i.test(rawMessage)

  const hasPaymentFact = hasBusinessFact(params.knowledge, /(rekening|bank|payment|pembayaran|cod|dp)/i)
  const hasPromoFact = hasBusinessFact(params.knowledge, /(diskon|discount|potongan|promo)/i)
  const hasApprovedQuote =
    typeof params.context.approvedQuote === 'number' ||
    typeof params.context.approvedQuote === 'string' ||
    typeof asRecord(params.context.order).approvedQuote === 'number' ||
    typeof asRecord(params.context.order).approvedQuote === 'string'

  if (
    (asksAccount && !hasPaymentFact) ||
    (asksExactDp && (!hasPaymentFact || !hasApprovedQuote)) ||
    (asksCod && !hasPaymentFact) ||
    (asksDiscount && !hasPromoFact)
  ) {
    forceHandoff(
      'commercial_fact_missing',
      'Siap. Untuk nominal DP, rekening, COD, atau diskon saya tidak akan menebak. Saya cek data pembayaran/promo yang aktif di LTOS dan saya teruskan ke admin supaya informasinya tepat.'
    )
  }

  const asksColorAvailability =
    /(warna lain|warna apa|warna.*(ada|tersedia|pilihan)|pilihan warna)/i.test(rawMessage)
  if (asksColorAvailability) {
    const fabricName = getContextString(params.context, 'fabric')

    if (!fabricName) {
      next = {
        ...next,
        reply:
          'Bisa, Kang. Supaya warna yang saya kirim benar-benar tersedia, bahan yang dimaksud yang mana dulu? Setelah bahannya jelas, saya ambil warna aktifnya dari katalog LTOS.',
        shouldHandoff: false,
        handoffReason: null,
        nextAction: 'continue',
        orderIntent: null,
      }
    } else {
      const colors = Array.from(
        new Set(
          params.knowledge.fabrics
            .filter(fabric => fabric.name.toLowerCase() === fabricName.toLowerCase() && fabric.color)
            .map(fabric => fabric.color as string)
        )
      )

      if (colors.length) {
        next = {
          ...next,
          reply: `Untuk ${fabricName}, warna yang tercatat aktif di LTOS: ${colors.join(', ')}. Kang paling condong ke warna gelap atau terang?`,
          shouldHandoff: false,
          handoffReason: null,
          nextAction: 'continue',
        }
      } else {
        forceHandoff(
          'fabric_color_unavailable',
          `Saya belum menemukan data warna aktif yang terverifikasi untuk ${fabricName}. Saya cek dulu ke katalog/admin supaya tidak kasih pilihan yang ternyata tidak tersedia.`
        )
      }
    }
  }

  const asksOrderStatus =
    /(sudah.*kirim|sudah dikirim|status.*pesan|status.*order|pesanan.*(gimana|bagaimana|mana)|order.*(gimana|bagaimana|mana))/i.test(
      rawMessage
    )
  if (asksOrderStatus) {
    const orderStatus = getContextString(params.context, 'orderStatus') ?? getContextString(params.context, 'status')
    if (orderStatus) {
      const normalized = orderStatus.toLowerCase().replace(/[\s-]+/g, '_')
      const statusLabel: Record<string, string> = {
        production: 'masih dalam proses produksi dan belum tercatat sebagai dikirim',
        in_production: 'masih dalam proses produksi dan belum tercatat sebagai dikirim',
        ready_to_ship: 'sudah siap dikirim',
        shipped: 'sudah tercatat dikirim',
        delivered: 'sudah tercatat diterima',
      }
      next = {
        ...next,
        reply: `Siap. Status order yang tercatat di LTOS saat ini ${statusLabel[normalized] ?? `adalah ${orderStatus}`}.`,
        shouldHandoff: false,
        handoffReason: null,
        nextAction: 'continue',
      }
    }
  }

  const trustedCorpus = trustedCommercialCorpus(params.knowledge, params.context)
  const trustedDigits = normalizeDigits(trustedCorpus)
  const untrustedMoney = extractRupiahAmounts(next.reply).find(amount => !trustedDigits.includes(amount))

  const longNumbers = next.reply.match(/\b\d{8,16}\b/g) ?? []
  const untrustedAccount = longNumbers.find(number => !trustedDigits.includes(number))

  if (untrustedMoney || untrustedAccount) {
    forceHandoff(
      'unverified_commercial_value',
      'Untuk nominal atau detail pembayaran pastinya saya cek data aktif LTOS dulu ya. Saya tidak akan menyebut angka/rekening sebelum datanya terverifikasi.'
    )
  }

  return next
}

export async function decideAiSalesReply(params: {
  currentStage: AiSalesStage
  context: Record<string, unknown>
  history: AiSalesMessage[]
  knowledge: AiSalesKnowledge
}): Promise<AiSalesDecision> {
  const model = process.env.AI_SALES_MODEL
  if (!model) throw new Error('Missing AI_SALES_MODEL environment variable.')

  const client = getOpenAIClient()
  const history = params.history
    .filter(message => message.text_content)
    .slice(-24)
    .map(message => ({
      role: message.role === 'customer' ? ('user' as const) : ('assistant' as const),
      content: message.text_content ?? '',
    }))

  const system = `You are the native AI Sales Agent for Local Tailor. Meta is only the WhatsApp transport. LTOS supplies business truth and customer context; you reason and compose the reply.

PRIMARY GOAL
Move the customer one natural step closer to a valid decision/order while protecting trust. Do not behave like a questionnaire and do not reopen choices that the customer has already fixed.

LANGUAGE AND SALES STYLE
- Reply in natural Indonesian unless the customer clearly uses another language.
- Be concise, warm, professional, human-sounding, and adaptive to the customer's writing style.
- Use Pak/Kang/Kak only when it fits the conversation.
- Ask at most one high-value question at a time.
- Do not repeat facts or options the customer already understood.
- Do not pressure, spam, or pretend to be a human employee.
- SALES_BRAIN below is behavioral guidance. Prefer higher-priority entries and stage-relevant entries.
- TRAINING_EXAMPLES are patterns for tone and next-step selection. They are NOT commercial truth and must not be copied mechanically.

SOURCE-OF-TRUTH RULES — HARD
- LIVE_BUSINESS_FACTS, COMMERCIAL_RULES, catalog data, customer context, and authoritative LTOS records are the only business-fact sources.
- Product/model/material facts may only come from KNOWLEDGE below or facts already supplied by the customer/context.
- NEVER invent price, discount, promo, stock, SLA, completion date, payment account, payment status, material property, model, or availability.
- catalog_options.price is a COMPONENT value from LTOS Price Snapshot, not automatically a final garment price. NEVER add/sum component prices yourself and NEVER present one component price as a final garment quote.
- You may state an explicit live "starting price" or other commercial fact only when it exists in LIVE_BUSINESS_FACTS, and must preserve its meaning (for example, a starting price is not a final quote).
- Only state an exact final garment price when context contains an explicit approvedQuote or another authoritative LTOS final-price field. If a final price is required and unavailable, collect the missing design needs and hand off when human approval is required.
- Payment account details may only be stated when they are present in an authoritative LTOS context/business fact. Never use a remembered account from a training example.
- If CONTEXT already contains an authoritative order status, answer it directly instead of saying you will check it later.
- If the customer asks for available colors but no exact fabric is selected in CONTEXT, ask which fabric they mean; do not combine colors from unrelated fabrics.
- Never claim an order is already created. You may only say the customer's choices/order intent have been recorded for the next LTOS step.
- A production order requires the existing LTOS design/measurement/fitter flow. Do not bypass it.

CUSTOMER MEMORY
- Use CONTEXT and conversation HISTORY as the customer's working memory.
- Do not ask again for facts that are already known unless confirmation is materially necessary.
- Preserve commitments and preferences already made by the customer.

HANDOFF — set shouldHandoff=true when:
- customer explicitly asks for a human/admin,
- customer is angry/complaining,
- exact commercial fact is required but unavailable,
- special discount/negotiation/exception is requested,
- input is ambiguous or risky enough that guessing could create a wrong order.

STAGES
new → qualified → offer → hot → dp → order → lost.
Do not mark dp/order merely because a customer says "jadi". Use hot + collect_order_intent until LTOS records payment/order through its authoritative flow.

ORDER INTENT
When the customer clearly commits, nextAction=collect_order_intent and return only choices actually known. Missing choices stay absent; never fill them by guess.

Return ONE valid JSON object only, with exactly this shape:
{
  "reply": "string",
  "stage": "new|qualified|offer|hot|dp|order|lost",
  "shouldHandoff": true|false,
  "handoffReason": "string or null",
  "customerPatch": {},
  "nextAction": "continue|handoff|collect_order_intent",
  "orderIntent": {} or null
}

CURRENT_STAGE: ${params.currentStage}
CONTEXT: ${JSON.stringify(params.context)}
KNOWLEDGE: ${JSON.stringify(compactKnowledge(params.knowledge, params.currentStage))}`

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'system', content: system }, ...history],
    response_format: { type: 'json_object' },
    max_completion_tokens: 900,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('AI Sales returned no content.')

  const parsed = parseDecision(content, params.currentStage)
  return applyDeterministicGuardrails(parsed, params)
}
