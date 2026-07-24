import type { SupabaseClient } from '@supabase/supabase-js'
import type { EstimasiPengerjaan } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'

// Service Engine: the customer's service choice only. No AI, no
// recommendation -- see set_order_service / preview_service_validation in
// supabase/migrations/20260728000000_add_service_sla_engine.sql and
// 20260729000000_add_service_validation_preview.sql.
export type ServiceLevel = 'standard' | 'fast' | 'very_fast'

export interface ServiceSlaRule {
  service_level: ServiceLevel
  label: string
  working_days: number
  updated_at: string
}

export type ServiceValidationStatus = 'green' | 'yellow' | 'red'

export interface ServiceValidationResult {
  order_id?: string
  service_level: ServiceLevel
  hari_d: string | null
  estimated_completion: string | null
  overall_status: ServiceValidationStatus
  signals: {
    hari_d: ServiceValidationStatus
    capacity: ServiceValidationStatus
    kpi: ServiceValidationStatus
  }
  reasons: string[]
}

// The Fitter-facing EstimasiPengerjaan labels ('Standard'/'Fast'/'Very
// Fast') are exactly service_sla_rules.label -- this mapping is the only
// place that association is hardcoded, and only because the free-text
// notes-encoded EstimasiPengerjaan field predates the Service Engine and
// isn't itself sourced from the DB. The SLA *day counts* are never
// hardcoded here; those always come from get_service_sla_rules().
export function mapEstimasiToServiceLevel(estimasi: EstimasiPengerjaan): ServiceLevel | null {
  switch (estimasi) {
    case 'Standard':
      return 'standard'
    case 'Fast':
      return 'fast'
    case 'Very Fast':
      return 'very_fast'
    default:
      return null
  }
}

export async function getServiceSlaRules(supabase: SupabaseClient): Promise<ServiceSlaRule[]> {
  const { data, error } = await supabase.rpc('get_service_sla_rules')
  if (error) throw error
  return (data as ServiceSlaRule[]) || []
}

// Sprint K Service Rules admin — set_service_sla_rule() existed since
// Sprint C but had zero frontend caller until now (see
// src/app/owner/service-rules). Owner/admin-gated at the DB/RLS level
// already; this is just the missing write wrapper.
export async function setServiceSlaRule(
  supabase: SupabaseClient,
  serviceLevel: ServiceLevel,
  workingDays: number
): Promise<void> {
  const { error } = await supabase.rpc('set_service_sla_rule', {
    p_service_level: serviceLevel,
    p_working_days: workingDays,
  })
  if (error) throw error
}

// Live 🟢/🟡/🔴 preview -- callable before an order exists (Consultation
// Review), unlike validate_service_selection which requires one.
export async function previewServiceValidation(
  supabase: SupabaseClient,
  serviceLevel: ServiceLevel
): Promise<ServiceValidationResult> {
  const { data, error } = await supabase.rpc('preview_service_validation', {
    p_service_level: serviceLevel,
  })
  if (error) throw error
  return data as ServiceValidationResult
}

// Commits the customer's choice to the order and resolves/locks Hari D.
// Raises if no capacity slot is found within the 90-day search window.
export async function setOrderService(
  supabase: SupabaseClient,
  orderId: string,
  serviceLevel: ServiceLevel
): Promise<{ order_id: string; service_level: ServiceLevel; hari_d: string }> {
  const { data, error } = await supabase.rpc('set_order_service', {
    p_order_id: orderId,
    p_service_level: serviceLevel,
  })
  if (error) throw error
  return data as { order_id: string; service_level: ServiceLevel; hari_d: string }
}
