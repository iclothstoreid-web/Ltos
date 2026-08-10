import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createAnonClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import type {
  MaterialCatalogEntry,
  MaterialPreparationItem,
  NotificationRules,
  Operator,
  PatternTemplate,
  PendingAssignment,
  ProductionPacket,
  ProductionRules,
  ProductionStage,
  ProductionStageOverrideAuditLogEntry,
  ReturnRules,
} from './types'
import type { MeasurementFields } from '@/components/workspace/measurement/types'

// Thin wrappers around the SECURITY DEFINER RPC surface — this is the only
// way the kiosk (no login) touches production data. Every function takes an
// explicit `supabase` client (server or browser) rather than constructing
// its own, same as `lib/order/createOrder.ts`.

export async function getProductionPacket(
  supabase: SupabaseClient,
  orderId: string
): Promise<ProductionPacket | null> {
  const { data, error } = await supabase.rpc('get_production_packet', {
    p_order_id: orderId,
  })
  if (error) throw error
  return data as ProductionPacket | null
}

export async function searchOperators(
  supabase: SupabaseClient,
  query: string,
  divisionId?: string | null
): Promise<Operator[]> {
  const { data, error } = await supabase.rpc('search_operators', {
    p_query: query,
    p_division_id: divisionId ?? null,
  })
  if (error) throw error
  return (data as Operator[]) || []
}

export async function upsertOperator(
  supabase: SupabaseClient,
  nama: string,
  divisionId?: string | null
): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_operator', {
    p_nama: nama,
    p_division_id: divisionId ?? null,
  })
  if (error) throw error
  return data as string
}

// Full active operator list for the Owner's "Pilih Operator" picker (Tugaskan
// flow) — unlike searchOperators, not capped at 10 and not query-driven.
export async function listActiveOperators(
  supabase: SupabaseClient,
  divisionId?: string | null
): Promise<Operator[]> {
  const { data, error } = await supabase.rpc('list_active_operators', {
    p_division_id: divisionId ?? null,
  })
  if (error) throw error
  return (data as Operator[]) || []
}

export async function assignStageOperator(
  supabase: SupabaseClient,
  params: { orderId: string; stageRecordId: string; operatorId: string }
): Promise<void> {
  const { error } = await supabase.rpc('assign_stage_operator', {
    p_order_id: params.orderId,
    p_stage_record_id: params.stageRecordId,
    p_operator_id: params.operatorId,
  })
  if (error) throw error
}

// Kiosk-wide unread job list for the /production landing page bell panel —
// see supabase/migrations/20260726000000_add_operator_assignment_and_notifications.sql
// for why this is kiosk-wide rather than per-operator (operators have no login).
export async function listPendingAssignments(supabase: SupabaseClient): Promise<PendingAssignment[]> {
  const { data, error } = await supabase.rpc('list_pending_assignments')
  if (error) throw error
  return (data as PendingAssignment[]) || []
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  notificationId: string
): Promise<void> {
  const { error } = await supabase.rpc('mark_notification_read', {
    p_notification_id: notificationId,
  })
  if (error) throw error
}

export async function startStage(
  supabase: SupabaseClient,
  params: {
    orderId: string
    stage: ProductionStage
    operatorId: string
    division: string
  }
): Promise<string> {
  const { data, error } = await supabase.rpc('start_stage', {
    p_order_id: params.orderId,
    p_stage: params.stage,
    p_operator_id: params.operatorId,
    p_division: params.division,
  })
  if (error) throw error
  return data as string
}

export async function completeStage(
  supabase: SupabaseClient,
  params: {
    orderId: string
    stageRecordId: string
    checklist: Record<string, boolean>
    evidenceUrl: string | null
    notes: string
    decision?: 'approved' | 'alter' | null
    alterCategory?: string | null
    // Captured at "Scan QR Penyelesaian" success, not at Setujui/Kembalikan
    // click time — the operator may spend time on evidence/checklist in
    // between, and Jam Selesai should reflect when the work actually ended.
    completedAt?: string | null
  }
): Promise<void> {
  const { error } = await supabase.rpc('complete_stage', {
    p_order_id: params.orderId,
    p_stage_record_id: params.stageRecordId,
    p_checklist: params.checklist,
    p_evidence_url: params.evidenceUrl,
    p_notes: params.notes,
    p_decision: params.decision ?? null,
    p_alter_category: params.alterCategory ?? null,
    p_completed_at: params.completedAt ?? null,
  })
  if (error) throw error
}

// Production Rules (Runtime Configuration) — see
// supabase/migrations/20260811000000_add_business_rules_runtime_config.sql
// and 20260812000000_replace_skip_stage_with_emergency_override.sql.
// get_production_rules() has no role gate (the anon kiosk workspace reads it
// to decide whether the QR scan / QC checklist / courier+tracking gates
// apply); set_production_rules() is admin/owner-gated inside the RPC itself.

export async function getProductionRules(supabase: SupabaseClient): Promise<ProductionRules> {
  const { data, error } = await supabase.rpc('get_production_rules')
  if (error) throw error
  return data as ProductionRules
}

// Cache Strategy (STEP 5.2) — get_production_rules() has RLS `using (true)`
// (no role gate, see above), so unlike every other function in this file it
// deliberately does NOT take the caller's `supabase` client: unstable_cache
// persists its result across requests/users, and a per-request client built
// on next/headers' cookies() can't safely be reused there. Read-only
// consumers on the hot path (e.g. the Production kiosk packet page, opened
// on every scan) should call this instead of getProductionRules() directly.
// Admin screens that write these rules (owner/business-rules/production,
// ProductionRulesManager) keep calling getProductionRules() unchanged so an
// admin's own edit is reflected immediately, not after the cache window.
export const getCachedProductionRules = unstable_cache(
  async (): Promise<ProductionRules> => {
    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase.rpc('get_production_rules')
    if (error) throw error
    return data as ProductionRules
  },
  ['production-rules'],
  { revalidate: 60 }
)

export async function setProductionRules(
  supabase: SupabaseClient,
  rules: Pick<
    ProductionRules,
    | 'qr_required'
    | 'qc_checklist_required'
    | 'max_alter_attempts'
    | 'alter_return_stage'
    | 'delivery_confirmation_required'
    | 'auto_close_after_delivered'
  >
): Promise<ProductionRules> {
  const { data, error } = await supabase.rpc('set_production_rules', {
    p_qr_required: rules.qr_required,
    p_qc_checklist_required: rules.qc_checklist_required,
    p_max_alter_attempts: rules.max_alter_attempts,
    p_alter_return_stage: rules.alter_return_stage,
    p_delivery_confirmation_required: rules.delivery_confirmation_required,
    p_auto_close_after_delivered: rules.auto_close_after_delivered,
  })
  if (error) throw error
  return data as ProductionRules
}

// Return Rules — QC "Kategori Temuan" picklist. get_return_rules() is
// anon-callable (the no-login kiosk renders the picklist from it);
// set_return_rules() is admin/owner-gated inside the RPC.

export async function getReturnRules(supabase: SupabaseClient): Promise<ReturnRules> {
  const { data, error } = await supabase.rpc('get_return_rules')
  if (error) throw error
  return data as ReturnRules
}

// Cache Strategy (STEP 5.2) — same reasoning as getCachedProductionRules
// above: get_return_rules() is anon-callable with RLS `using (true)`, so a
// cookie-independent client is safe to cache across requests. Admin screens
// (owner/business-rules/return, ReturnRulesManager) keep calling
// getReturnRules() unchanged.
export const getCachedReturnRules = unstable_cache(
  async (): Promise<ReturnRules> => {
    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase.rpc('get_return_rules')
    if (error) throw error
    return data as ReturnRules
  },
  ['return-rules'],
  { revalidate: 60 }
)

export async function setReturnRules(
  supabase: SupabaseClient,
  reasons: string[]
): Promise<ReturnRules> {
  const { data, error } = await supabase.rpc('set_return_rules', { p_reasons: reasons })
  if (error) throw error
  return data as ReturnRules
}

// Notification Rules — read by assign_stage_operator() server-side; this
// pair only feeds the owner panel.

export async function getNotificationRules(supabase: SupabaseClient): Promise<NotificationRules> {
  const { data, error } = await supabase.rpc('get_notification_rules')
  if (error) throw error
  return data as NotificationRules
}

export async function setNotificationRules(
  supabase: SupabaseClient,
  assignmentNotificationEnabled: boolean
): Promise<NotificationRules> {
  const { data, error } = await supabase.rpc('set_notification_rules', {
    p_assignment_notification_enabled: assignmentNotificationEnabled,
  })
  if (error) throw error
  return data as NotificationRules
}

// Emergency Override — NOT a Business Rule (no toggle anywhere enables or
// disables this). Owner/Admin-only and a mandatory reason are enforced
// inside emergency_override_stage() itself, same defense-in-depth pattern
// as every other write RPC in this app; every call is scoped to exactly one
// order+stage and logged to production_stage_override_audit_log.
export async function emergencyOverrideStage(
  supabase: SupabaseClient,
  params: { orderId: string; stageRecordId: string; reason: string }
): Promise<void> {
  const { error } = await supabase.rpc('emergency_override_stage', {
    p_order_id: params.orderId,
    p_stage_record_id: params.stageRecordId,
    p_reason: params.reason,
  })
  if (error) throw error
}

export async function getProductionStageOverrideAuditLog(
  supabase: SupabaseClient,
  orderId: string
): Promise<ProductionStageOverrideAuditLogEntry[]> {
  const { data, error } = await supabase
    .from('production_stage_override_audit_log')
    .select('*')
    .eq('order_id', orderId)
    .order('overridden_at', { ascending: false })
  if (error) throw error
  return (data as ProductionStageOverrideAuditLogEntry[]) || []
}

export async function setShippingInfo(
  supabase: SupabaseClient,
  params: { orderId: string; stageRecordId: string; courier: string; trackingNumber: string }
): Promise<void> {
  const { error } = await supabase.rpc('set_shipping_info', {
    p_order_id: params.orderId,
    p_stage_record_id: params.stageRecordId,
    p_courier: params.courier,
    p_tracking_number: params.trackingNumber,
  })
  if (error) throw error
}

// Persiapan Bahan's anon-safe catalog read — direct SELECT on `materials`
// is RLS-blocked for the no-login kiosk session, so this goes through the
// same SECURITY DEFINER pattern as get_production_packet.
export async function listMaterialCatalogForPreparation(
  supabase: SupabaseClient
): Promise<MaterialCatalogEntry[]> {
  const { data, error } = await supabase.rpc('list_material_catalog_for_preparation')
  if (error) throw error
  return (data as MaterialCatalogEntry[]) || []
}

// Persiapan Bahan's single "Reserve Material" action — the only place left
// in the app that reduces physical_stock as a consequence of an order (see
// 20260819010000_refine_material_preparation_dynamic_categories.sql). Items
// are keyed by category (dynamic — whatever Material Categories currently
// have an active material), not a fixed item list. Sends the full set every
// save (including explicit None rows), so the RPC can replace this
// attempt's rows atomically rather than patching one at a time.
export async function saveMaterialPreparation(
  supabase: SupabaseClient,
  params: {
    orderId: string
    stageRecordId: string
    items: {
      categoryId: string
      categoryName: string | null
      materialId: string | null
      materialName: string | null
      quantity: number | null
      used: boolean
    }[]
  }
): Promise<MaterialPreparationItem[]> {
  const { data, error } = await supabase.rpc('save_material_preparation', {
    p_order_id: params.orderId,
    p_stage_record_id: params.stageRecordId,
    p_items: params.items.map(item => ({
      category_id: item.categoryId,
      category_name: item.categoryName,
      material_id: item.materialId,
      material_name: item.materialName,
      quantity: item.quantity,
      used: item.used,
    })),
  })
  if (error) throw error
  return (data as MaterialPreparationItem[]) || []
}

// PS-01.2 (Optimistic Conflict Protection) — `expectedUpdatedAt` should be
// the `updated_at` of the PatternFormulation this session last loaded/saved
// (null for a genuinely new formulation, i.e. `existing` was null). The RPC
// refuses the write and raises a clear error if the row has moved on since
// then; see 20260830000000_ps01_2_optimistic_conflict_protection.sql.
export async function savePatternFormulation(
  supabase: SupabaseClient,
  params: {
    orderId: string
    template: PatternTemplate
    patternMeasurements: MeasurementFields
    operatorId: string
    expectedUpdatedAt?: string | null
  }
): Promise<void> {
  const { error } = await supabase.rpc('save_pattern_formulation', {
    p_order_id: params.orderId,
    p_template: params.template,
    p_pattern_measurements: params.patternMeasurements,
    p_operator_id: params.operatorId,
    p_expected_updated_at: params.expectedUpdatedAt ?? null,
  })
  if (error) throw error
}

// Evidence photo upload — the bucket is public and its INSERT policy is
// scoped to anon/authenticated (no auth required), so this works from the
// kiosk exactly like the RPCs above. upsert must stay false: the bucket's
// RLS only grants INSERT, and upsert:true compiles to an UPSERT (which
// Postgres requires UPDATE privilege for even on a first insert), so it was
// silently failing every single upload.
export async function uploadEvidencePhoto(
  supabase: SupabaseClient,
  params: { orderId: string; stage: ProductionStage; attempt: number; file: File }
): Promise<string> {
  const ext = params.file.name.split('.').pop() || 'jpg'
  const path = `${params.orderId}/${params.stage}/${params.attempt}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('production-evidence')
    .upload(path, params.file, { upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from('production-evidence').getPublicUrl(path)
  return data.publicUrl
}
