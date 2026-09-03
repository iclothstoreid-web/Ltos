import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchActiveMasterOptions } from '@/lib/design/masterData'
import { getCommercialRules } from '@/lib/commercial/client'
import type { AiSalesKnowledge } from './types'

export async function loadAiSalesKnowledge(supabase: SupabaseClient): Promise<AiSalesKnowledge> {
  const [masterOptions, fabricResult, commercialRules] = await Promise.all([
    fetchActiveMasterOptions(supabase),
    supabase.rpc('get_public_fabric_catalog', { p_limit: 96, p_offset: 0 }),
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
    gsm: typeof row.gsm === 'number' ? row.gsm : row.gsm ? Number(row.gsm) : null,
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
