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

export async function loadAiSalesKnowledge(supabase: SupabaseClient): Promise<AiSalesKnowledge> {
  const [
    masterOptions,
    fabricResult,
    commercialRules,
    businessFactsResult,
    brainEntriesResult,
    trainingExamplesResult,
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
      .limit(60),
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

  return {
    options,
    fabrics,
    commercialRules: {
      minDpPercent: commercialRules.min_dp_percent ?? null,
      fullPaymentOnly: commercialRules.full_payment_only ?? null,
    },
    businessFacts,
    brainEntries,
    trainingExamples,
  }
}
