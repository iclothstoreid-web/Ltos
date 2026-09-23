import 'server-only'
import { getOpenAIClient } from '@/lib/ai/client'
import { AI_SALES_STAGES, type AiSalesDecision, type AiSalesKnowledge, type AiSalesMessage, type AiSalesStage } from './types'

const NEXT_ACTIONS = ['continue', 'handoff', 'collect_order_intent'] as const

function isStage(value: unknown): value is AiSalesStage {
  return typeof value === 'string' && (AI_SALES_STAGES as readonly string[]).includes(value)
}

function isNextAction(value: unknown): value is AiSalesDecision['nextAction'] {
  return typeof value === 'string' && (NEXT_ACTIONS as readonly string[]).includes(value)
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
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
    customerPatch: asRecord(parsed.customerPatch) as AiSalesDecision['customerPatch'],
    nextAction: isNextAction(parsed.nextAction) ? parsed.nextAction : shouldHandoff ? 'handoff' : 'continue',
    orderIntent: parsed.orderIntent === null ? null : (asRecord(parsed.orderIntent) as AiSalesDecision['orderIntent']),
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
  return parseDecision(content, params.currentStage)
}
