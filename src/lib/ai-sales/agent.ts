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
    'occasion',
    'fitConcern',
    'cutting',
    'referenceGarment',
    'fittingPreference',
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

const RETRIEVAL_STOPWORDS = new Set([
  'yang', 'dan', 'atau', 'untuk', 'dari', 'dengan', 'saya', 'aku', 'ana', 'kami', 'kita',
  'ini', 'itu', 'ada', 'bisa', 'mau', 'ingin', 'jadi', 'sudah', 'belum', 'kalau', 'kalo',
  'gimana', 'bagaimana', 'berapa', 'lebih', 'juga', 'aja', 'saja', 'nya', 'kang', 'pak',
  'kak', 'bang', 'bro', 'mas',
])

function retrievalTerms(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/)
        .map(term => term.trim())
        .filter(term => term.length > 2 && !RETRIEVAL_STOPWORDS.has(term))
    )
  )
}

function lexicalRelevance(text: string, terms: string[]): number {
  if (!terms.length) return 0
  const corpus = text.toLowerCase()
  return terms.reduce((score, term) => score + (corpus.includes(term) ? 1 : 0), 0)
}

function compactKnowledge(
  knowledge: AiSalesKnowledge,
  currentStage: AiSalesStage,
  history: AiSalesMessage[]
) {
  const recentCustomerContext = history
    .filter(message => message.role === 'customer' && message.text_content)
    .slice(-8)
    .map(message => message.text_content)
    .join(' ')
  const terms = retrievalTerms(recentCustomerContext)

  // Every curated Brain entry and training example loaded from LTOS is a
  // retrieval candidate. We send the most relevant subset per turn instead of
  // blindly taking the first rows, so the uploaded WhatsApp library actually
  // influences the reply when its situation matches the current customer.
  const stageBrain = knowledge.brainEntries
    .filter(entry => !entry.stage || entry.stage === currentStage)
    .map(entry => ({
      entry,
      score:
        lexicalRelevance(
          [entry.title, entry.content, ...(entry.tags ?? [])].join(' '),
          terms
        ) * 20 +
        entry.priority +
        (['identity', 'style', 'guardrail'].includes(entry.category) ? 25 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 45)
    .map(item => item.entry)

  const stageExamples = knowledge.trainingExamples
    .filter(example => !example.stageBefore || example.stageBefore === currentStage)
    .map(example => ({
      example,
      score:
        lexicalRelevance(
          [example.situation, example.customerMessage ?? '', example.rationale ?? ''].join(' '),
          terms
        ) * 25 +
        example.priority +
        (example.stageBefore === currentStage ? 15 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map(item => item.example)

  return {
    // Prices here are component/master-option values used by LTOS Price Snapshot,
    // NOT permission for the model to invent or sum a final quote.
    catalog_options: knowledge.options.slice(0, 180),
    available_fabrics: knowledge.fabrics.slice(0, 96),
    commercial_rules: knowledge.commercialRules,
    live_business_facts: knowledge.businessFacts.slice(0, 80),
    sales_brain: stageBrain,
    training_examples: stageExamples,
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

function getBusinessFactValue(knowledge: AiSalesKnowledge, key: string): string | null {
  const fact = knowledge.businessFacts.find(item => item.key === key)
  return fact?.value?.trim() || null
}

function asksForShowroomAddress(raw: string): boolean {
  const text = raw.trim()
  if (/^(?:alamat|lokasi|showroom)(?:\s+local\s+tailor)?(?:nya)?\s*[?.!]*$/i.test(text)) return true

  const mentionsPlace = /\b(?:alamat|lokasi|showroom)(?:nya)?\b/i.test(text)
  const asksWhere = /\b(?:di\s*mana|dimana|dmn|mana)\b/i.test(text)
  return mentionsPlace && asksWhere
}

function buildDirectShowroomAddressDecision(params: {
  currentStage: AiSalesStage
  history: AiSalesMessage[]
  knowledge: AiSalesKnowledge
}): AiSalesDecision | null {
  const raw = latestCustomerText(params.history)
  if (!asksForShowroomAddress(raw)) return null

  const address = getBusinessFactValue(params.knowledge, 'showroom_address')
  if (!address) {
    return {
      reply: 'Saya cek dulu alamat showroom yang aktif ya, biar tidak salah arah.',
      stage: params.currentStage,
      shouldHandoff: true,
      handoffReason: 'showroom_address_missing',
      customerPatch: {},
      nextAction: 'handoff',
      orderIntent: null,
    }
  }

  return {
    reply: `Siap Kang. Showroom kita di ${address} 🙏`,
    stage: params.currentStage,
    shouldHandoff: false,
    handoffReason: null,
    customerPatch: {},
    nextAction: 'continue',
    orderIntent: null,
  }
}

function buildDirectSizeDecision(params: {
  currentStage: AiSalesStage
  context: Record<string, unknown>
  history: AiSalesMessage[]
  knowledge: AiSalesKnowledge
}): AiSalesDecision | null {
  const raw = latestCustomerText(params.history).trim()
  const match = raw.match(/^(?:ukuran|size)?\s*(xs|s|m|l|xl|xxl|xxxl|xxxxl|\d{2}(?:\/\d{2})?)\s*[.!?]?$/i)
  if (!match) return null

  const sizeLabel = match[1].toUpperCase()
  const city = getContextString(params.context, 'city')
  const inBandung = city ? /bandung/i.test(city) : false

  let reply =
    `Siap Kang. ${sizeLabel} kita jadikan referensi awal ya, tapi ukuran akhirnya tetap custom sebelum produksi. `

  if (city && inBandung) {
    reply +=
      'Karena Kang di area Bandung, paling enak ukur langsung di studio/showroom Local Tailor supaya fitting-nya kita cek langsung.'
  } else if (city) {
    reply +=
      `Karena Kang di ${city}, bisa fitting online lewat video call atau pakai thobe yang ukurannya sudah nyaman sebagai acuan.`
  } else {
    reply +=
      'Kalau di area Bandung bisa ukur langsung di studio/showroom. Kalau di luar Bandung, bisa fitting online lewat video call atau pakai thobe yang ukurannya sudah nyaman sebagai acuan. Kang domisilinya di Bandung atau luar Bandung?'
  }

  return {
    reply,
    stage: params.currentStage === 'new' ? 'qualified' : params.currentStage,
    shouldHandoff: false,
    handoffReason: null,
    customerPatch: { notes: `Ready-made size reference: ${sizeLabel}` },
    nextAction: 'continue',
    orderIntent: null,
  }
}

function findUnsupportedNamedModel(
  reply: string,
  knowledge: AiSalesKnowledge,
  customerText: string
): string | null {
  if (!/\bmodel\b/i.test(reply)) return null

  const trusted = [
    ...knowledge.options.map(option => option.name),
    ...knowledge.businessFacts.map(fact => fact.value),
    customerText,
  ]
    .join(' ')
    .toLowerCase()

  const cue = /\b(?:seperti|model(?:nya)?(?:\s+yang)?(?:\s+bernama)?)\s+([A-Z][A-Za-z'-]{2,})(?:\s+atau\s+([A-Z][A-Za-z'-]{2,}))?/g
  let match: RegExpExecArray | null

  while ((match = cue.exec(reply))) {
    for (const candidate of [match[1], match[2]].filter(Boolean) as string[]) {
      if (!trusted.includes(candidate.toLowerCase())) return candidate
    }
  }

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
      'Siap. Untuk nominal DP, rekening, COD, atau diskon saya cek dulu data yang aktif biar nggak salah ya. Kalau memang butuh approval, saya teruskan ke admin.'
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
          'Bisa, Kang. Bahan yang dimaksud yang mana dulu? Biar saya kirim warna yang memang tersedia untuk bahan itu, bukan asal pilihan.',
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
          reply: `Untuk ${fabricName}, warna yang tersedia: ${colors.join(', ')}. Kang paling condong ke warna gelap atau terang?`,
          shouldHandoff: false,
          handoffReason: null,
          nextAction: 'continue',
        }
      } else {
        forceHandoff(
          'fabric_color_unavailable',
          `Untuk ${fabricName}, saya belum dapat daftar warna yang terverifikasi. Saya cek dulu ya supaya nggak kasih pilihan yang ternyata nggak tersedia.`
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
        reply: `Siap. Status pesanan saat ini ${statusLabel[normalized] ?? `adalah ${orderStatus}`}.`,
        shouldHandoff: false,
        handoffReason: null,
        nextAction: 'continue',
      }
    }
  }

  const unsupportedModel = findUnsupportedNamedModel(next.reply, params.knowledge, rawMessage)
  if (unsupportedModel) {
    const modelFamilies = getBusinessFactValue(params.knowledge, 'sales_model_families')
    const customParts = getBusinessFactValue(params.knowledge, 'sales_custom_parts')

    if (modelFamilies) {
      next = {
        ...next,
        reply: `Kalau untuk model, pilihan utamanya ${modelFamilies}. Setelah pilih arah modelnya, ${customParts ? customParts.toLowerCase() : 'detailnya'} bisa kita custom satu-satu sesuai selera Kang.`,
        shouldHandoff: false,
        handoffReason: null,
        nextAction: 'continue',
        orderIntent: null,
      }
    } else {
      forceHandoff(
        'unverified_model_name',
        'Saya cek dulu pilihan model yang aktif ya, biar nggak kasih nama model yang ternyata tidak tersedia.'
      )
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
      'Untuk nominal atau detail pembayarannya saya cek dulu yang aktif ya, biar nggak salah kasih angka atau rekening.'
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
  const directShowroomAddressDecision = buildDirectShowroomAddressDecision(params)
  if (directShowroomAddressDecision) return directShowroomAddressDecision

  const directSizeDecision = buildDirectSizeDecision(params)
  if (directSizeDecision) return directSizeDecision

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
Commercially, act like an elite consultative closer: understand what the customer values, reduce uncertainty, make the better-value option easy to desire, and keep the conversation comfortable enough that the customer wants to continue.

LANGUAGE AND SALES STYLE
- Reply in natural Indonesian unless the customer clearly uses another language.
- Sound like an exceptional human WhatsApp sales consultant: relaxed, attentive, sharp, warm, and commercially effective. Never sound like a template, call center, FAQ, or chatbot.
- Usually write 1–4 short sentences. Match the customer's pace: short/direct customer → short/direct reply; detailed customer → enough detail to make a decision.
- WhatsApp cadence matters as much as factual correctness. Write like a real salesperson typing between tasks, not like a brochure being generated. Prefer compact conversational transitions such as "Siap Kang", "Nah, kalau ukur...", "Kalau yang ini...", or "Santai aja, nanti kabari" when they fit naturally.
- Do not explain a product again just because the customer selected it. A choice like "Wool Blend Cashmere Italy" usually needs only a brief acknowledgement, then answer the customer's newest question.
- Questions are optional, not mandatory. Do NOT end every reply with "Mau saya...", "Kang mau...", "Boleh tahu...", or another sales prompt. For a simple factual question, answer it cleanly and stop unless one next step is genuinely useful.
- Never stack multiple sales moves in one turn. Do not answer + pitch + list models + ask a question when the customer only needs one thing.
- When several short customer messages arrive close together in HISTORY, treat them as one human turn and answer the combined intent once. Do not create one reply per fragment.
- Show memory by naming the exact thing already chosen when useful: e.g. "Wool Blend Cashmere Italy yang tadi", not vague phrases like "pilihan yang sudah dibicarakan".
- When the customer says they will contact again later, do not keep selling. Close warmly, preserve the selected option, and leave the door open.
- Avoid sales-language filler such as "Pilihan bahan ... memang lebih elegan", "Untuk pengukuran...", "Saya bisa bantu atur...", or "agar lebih lancar" unless that wording is genuinely natural in the current conversation.
- Mirror the customer's level of formality, familiar address terms, light emoji usage, and natural vocabulary without caricaturing them. If they use "ana/antum", Sunda words, English, Pak/Kang/Kak/Bang, adapt naturally.
- Answer the customer's actual question first. Then move only ONE useful step forward.
- Avoid stiff corporate phrases such as "Tentu", "Kami menyediakan berbagai pilihan", "Sesuai kebutuhan Anda", or "Untuk informasi lebih lanjut" unless the customer's own tone is that formal.
- Never dump a catalog when one recommendation or one question will reduce uncertainty.
- Read HISTORY for the customer's observable communication and buying behavior: direct vs exploratory, price-focused vs quality-focused, experienced vs first-time, ready-to-buy vs still browsing. Adapt the amount of explanation and next step. Do not infer sensitive personal traits.
- A broad Meta-ad opener such as asking for "info lebih lengkap" must receive useful value immediately. Present the verified entry offer first as an accessible trust anchor, then the verified premium offer with its concrete benefits. The premium option should feel like the recommended upgrade, not a forced upsell.
- That ad opener may be followed by the customer's own question in the same message or subsequent messages. Answer the newest specific question first; do not repeat the generic opener or welcome message. Vary the wording naturally, but keep verified prices exact.
- Learn the customer's occasion and desired feeling from what they actually say. For ibadah, prioritize comfort, movement, and a neat fit; for formal events or akad, discuss a composed look and their preferred details. Connect the benefit of custom fit and chosen fabric to that occasion, without promising that the garment will transform their identity or guarantee confidence.
- Make the service pleasant: acknowledge their answer, help them compare the smallest relevant choice, give a clear next step, and leave room for their own preferences. When they share a concern, resolve that concern before proposing another product. Let the quality of the consultation itself build confidence.
- When LIVE_BUSINESS_FACTS includes owner-verified craftsmanship and customer feedback, use that evidence selectively. Say that some customers praised the neat stitching and comfortable fit or returned for another order; do not imply every customer gave the same review, quote a named customer without permission, or promise every garment will fit perfectly. Only describe artisan specialization if the corresponding live fact is active. Never claim external skill recognition or certification without a verified fact.
- When a customer mentions a fit problem with a ready-made garment, acknowledge that exact discomfort and explain how measurement and fit choices can address it. Do not claim that all mass-produced thobes have poor materials, sewing, or service, and never disparage another brand.
- Validate a choice with a concrete reason tied to their stated need. Say what is already agreed, then suggest the smallest useful next decision. Once model, fabric, color, or detail is chosen, do not reopen it unless the customer changes direction.
- Visuals are sent by LTOS separately. Do not promise that you sent a photo, claim a pictured fabric/model is identical to an order, or ask a question in the text that the following image caption contradicts.
- For the opening visual sequence, do NOT narrate every photo and do NOT produce a list of technical descriptions. Let the images create desire first. LTOS sends the starter photos clean and follows them with one short conversational hook.
- A visual sequence is a selling moment, not a catalog. Avoid phrases like "detail potongan", "contoh jahitan navy", "referensi coklat" repeated photo by photo unless the customer explicitly asks what a specific image shows.
- For an open first enquiry, answer any specific question first and introduce the verified offer briefly. LTOS will show five distinct close-ups of actual workmanship from the "Kirim pertama" folder. Give the customer space to see them, then ask one relaxed question about where they plan to wear the thobe or the look they have in mind. The photos demonstrate construction, not a specific fabric or the customer's final design.
- If the customer wants a different model, invite them to design it part by part, starting with the collar. LTOS may show the verified Haybah Collar photo; describe its pointed shape and firmer, more defined look only because those are in the active catalog. Ask whether that direction suits them, then move to the next detail after they choose. Never dump every collar option at once.
- If they request another fabric, compare only verified fabrics, remembering the current choice. If they request another color, show a color reference as inspiration and check actual availability for the selected fabric before promising it. After the opening sequence, one image per turn, chosen from the customer's current question; the caption may supply the visual's exact name.
- Keep the thread alive with one relevant, easy-to-answer next step whenever the customer is engaged. Acknowledge decisions, briefly explain why they suit the stated occasion/fit, then guide toward measurement and invoice when enough is known. If they ask for time or cannot afford it, give them room and preserve their choices; do not chase or invent urgency.
- For customers who signal comfort, fabric quality, elegance, formal use, frequent wear, or low price sensitivity, confidently steer toward the premium option by explaining the relevant value difference. If the customer is clearly price-sensitive, keep the entry option comfortable and valid.
- Never devalue the entry product, manipulate with fear, or invent superiority. Premium persuasion must come from verified product benefits, fit to the customer's needs, trust, and a clear comparison.
- When the customer hesitates at the price, explain the verified fabric benefits and custom measurement in terms of their stated use. Do not call the price cheap, promise a guaranteed outcome, or claim artisan credentials, recognition, or superior precision unless LTOS has those specific facts.
- If the customer says "mahal" and then wants to stop, do not instantly give a generic goodbye. If a verified lower-priced option exists, make ONE gentle recovery attempt by offering that relevant option. Respect a clear second refusal and close warmly without pressure.
- After the first value-rich answer, use one low-friction next step: invite a reference photo or offer to help choose. Do not turn the first reply into an interrogation.
- Use Pak/Kang/Kak only when it fits the conversation.
- Ask at most one high-value question at a time.
- Do not repeat facts or options the customer already understood.
- Persuade by clarity, relevance, trust, proof, and reducing friction. Never deceive, fabricate scarcity, fake urgency, or pressure the customer.
- SALES_BRAIN is the Local Tailor behavioral playbook. Prefer higher-priority and stage-relevant entries.
- TRAINING_EXAMPLES are curated from real Local Tailor WhatsApp conversations and owner corrections. Treat them as the PRIMARY reference for cadence, wording style, objection handling, and next-step selection when relevant. They are NOT commercial truth and must not be copied mechanically.

SOURCE-OF-TRUTH RULES — HARD
- LIVE_BUSINESS_FACTS, COMMERCIAL_RULES, catalog data, customer context, and authoritative LTOS records are the only business-fact sources.
- Product/model/material facts may only come from KNOWLEDGE below or facts already supplied by the customer/context.
- NEVER invent or improvise a named model, collar, cuff, placket, pocket, cutting, fabric, or color. A named option must exactly exist in catalog_options or LIVE_BUSINESS_FACTS. Do not create poetic/marketing names.
- If the customer mentions a ready-made size label such as M/L/XL/XXL or a numeric size, treat it only as a reference. Local Tailor sizing remains custom: before production, measure the customer in Bandung studio/showroom or use remote fitting by video call/reference thobe outside Bandung.
- When discussing broad model direction, prefer the verified sales-facing model families from LIVE_BUSINESS_FACTS.
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
- Capture durable preferences in customerPatch: occasion, fitConcern, cutting, referenceGarment, fittingPreference, and existing fields. Extract only what the customer actually supplied; do not guess. Keep a previously chosen option unless the customer explicitly corrects it. A reference garment is a fit starting point, not a production measurement until verified.

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
KNOWLEDGE: ${JSON.stringify(compactKnowledge(params.knowledge, params.currentStage, params.history))}`

  let lastError = 'AI Sales returned no content.'

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: system }, ...history],
      response_format: { type: 'json_object' },
      max_completion_tokens: 1800,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      lastError = `AI Sales returned no content (finish_reason=${completion.choices[0]?.finish_reason ?? 'unknown'}).`
      continue
    }

    try {
      const parsed = parseDecision(content, params.currentStage)
      return applyDeterministicGuardrails(parsed, params)
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
  }

  throw new Error(lastError)
}
