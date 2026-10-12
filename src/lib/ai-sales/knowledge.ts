import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchActiveMasterOptions } from '@/lib/design/masterData'
import { getCommercialRules } from '@/lib/commercial/client'
import type {
  AiSalesBrainEntry,
  AiSalesBusinessFact,
  AiSalesKnowledge,
  AiSalesTrainingExample,
} from './types'

function sanitizeOwnerExampleText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/https?:\/\/\S+/gi, '[link]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]')
    .replace(/\b(?:\+?62|0)[0-9\s-]{8,16}\b/g, '[nomor]')
    .replace(/\b(?:rekening|rek|account)\s*[:.-]?\s*\d{6,20}\b/gi, '[rekening]')
    .replace(/\bRp\.?\s*[0-9][0-9.,\s]*(?:jt|juta|rb|ribu|k)?\b/gi, '[harga]')
    .replace(/\b(Pak|Bapak|Kang|Kak|Mas|Bang|Ustadz|Ustad)\s+[A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]{1,40}\b/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 900)
}

export async function loadAiSalesKnowledge(supabase: SupabaseClient): Promise<AiSalesKnowledge> {
  const [
    masterOptions,
    fabricResult,
    commercialRules,
    businessFactsResult,
    brainEntriesResult,
    trainingExamplesResult,
    ownerExamplesResult,
  ] = await Promise.all([
    fetchActiveMasterOptions(supabase),
    supabase.rpc('list_fabric_catalog'),
    getCommercialRules(supabase),
    supabase
      .from('ai_sales_business_facts')
      .select('fact_key, category, label, value, notes')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(80),
    supabase
      .from('ai_sales_brain_entries')
      .select('category, title, content, stage, tags, priority')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(120),
    supabase
      .from('ai_sales_training_examples')
      .select('stage_before, stage_after, situation, customer_message, ideal_reply, rationale, outcome, priority')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(200),
    supabase
      .from('ai_sales_owner_learning_examples')
      .select('customer_message, ideal_reply, customer_reaction, outcome, priority, created_at')
      .order('created_at', { ascending: false })
      .limit(300),
  ])

  if (fabricResult.error) throw fabricResult.error
  if (businessFactsResult.error) throw businessFactsResult.error
  if (brainEntriesResult.error) throw brainEntriesResult.error
  if (trainingExamplesResult.error) throw trainingExamplesResult.error

  const options = Object.values(masterOptions)
    .flat()
    .map(option => ({
      category: option.category,
      name: option.name,
      price: Number(option.price || 0),
      sellingPoints: option.selling_points ?? [],
    }))

  const fabrics = ((fabricResult.data ?? []) as Array<Record<string, unknown>>).map(row => ({
    name: String(row.name ?? ''),
    category: row.category ? String(row.category) : null,
    color: row.color ? String(row.color) : null,
    composition: row.composition ? String(row.composition) : null,
    gsm: typeof row.weight_gsm === 'number' ? row.weight_gsm : row.weight_gsm ? Number(row.weight_gsm) : null,
    highlight: row.highlight ? String(row.highlight) : null,
  }))

  const businessFacts = ((businessFactsResult.data ?? []) as Array<Record<string, unknown>>).map(row => ({
    key: String(row.fact_key ?? ''),
    category: String(row.category ?? 'other') as AiSalesBusinessFact['category'],
    label: String(row.label ?? ''),
    value: String(row.value ?? ''),
    notes: row.notes ? String(row.notes) : null,
  }))

  const brainEntries = ((brainEntriesResult.data ?? []) as Array<Record<string, unknown>>).map(row => ({
    category: String(row.category ?? 'playbook') as AiSalesBrainEntry['category'],
    title: String(row.title ?? ''),
    content: String(row.content ?? ''),
    stage: row.stage ? (String(row.stage) as AiSalesBrainEntry['stage']) : null,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    priority: Number(row.priority ?? 50),
  }))

  const trainingExamples = ((trainingExamplesResult.data ?? []) as Array<Record<string, unknown>>).map(row => ({
    stageBefore: row.stage_before ? (String(row.stage_before) as AiSalesTrainingExample['stageBefore']) : null,
    stageAfter: row.stage_after ? (String(row.stage_after) as AiSalesTrainingExample['stageAfter']) : null,
    situation: String(row.situation ?? ''),
    customerMessage: row.customer_message ? String(row.customer_message) : null,
    idealReply: String(row.ideal_reply ?? ''),
    rationale: row.rationale ? String(row.rationale) : null,
    outcome: String(row.outcome ?? 'unknown'),
    priority: Number(row.priority ?? 50),
  }))

  // Dynamic owner examples teach rhythm and next-step selection from real WhatsApp
  // outcomes. They are sanitized and deliberately carry no business-fact authority.
  const ownerExamples: AiSalesTrainingExample[] = ownerExamplesResult.error
    ? []
    : ((ownerExamplesResult.data ?? []) as Array<Record<string, unknown>>)
        .map(row => {
          const customerMessage = sanitizeOwnerExampleText(row.customer_message)
          const idealReply = sanitizeOwnerExampleText(row.ideal_reply)
          const customerReaction = sanitizeOwnerExampleText(row.customer_reaction)
          return {
            stageBefore: null,
            stageAfter: null,
            situation: customerReaction
              ? `Owner WhatsApp reply followed by customer reaction: ${customerReaction}`
              : 'Owner WhatsApp reply followed by continued customer engagement.',
            customerMessage: customerMessage || null,
            idealReply,
            rationale: 'Behavior/cadence reference from an owner reply; not a source of prices, stock, payment details, or product truth.',
            outcome: String(row.outcome ?? 'unknown'),
            priority: Math.min(94, Math.max(60, Number(row.priority ?? 72))),
          } as AiSalesTrainingExample
        })
        .filter(example => example.customerMessage && example.idealReply)
        .slice(0, 120)

  return {
    options,
    fabrics,
    commercialRules: {
      minDpPercent: commercialRules.min_dp_percent ?? null,
      fullPaymentOnly: commercialRules.full_payment_only ?? null,
    },
    businessFacts,
    brainEntries,
    trainingExamples: [...trainingExamples, ...ownerExamples],
  }
}
