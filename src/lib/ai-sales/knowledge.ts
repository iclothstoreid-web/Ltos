import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchActiveMasterOptions } from '@/lib/design/masterData'
import { getCommercialRules } from '@/lib/commercial/client'
import type { AiSalesKnowledge } from './types'

export async function loadAiSalesKnowledge(supabase: SupabaseClient): Promise<AiSalesKnowledge> {
  const [masterOptions, fabricResult, commercialRules] = await Promise.all([
    fetchActiveMasterOptions(supabase),
    supabase.rpc('list_fabric_catalog'),
    getCommercialRules(supabase),
  ])

  if (fabricResult.error) throw fabricResult.error

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

  return {
    options,
    fabrics,
    commercialRules: {
      minDpPercent: commercialRules.min_dp_percent ?? null,
      fullPaymentOnly: commercialRules.full_payment_only ?? null,
    },
  }
}
