import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Operator,
  PatternTemplate,
  PendingAssignment,
  ProductionPacket,
  ProductionStage,
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
  query: string
): Promise<Operator[]> {
  const { data, error } = await supabase.rpc('search_operators', { p_query: query })
  if (error) throw error
  return (data as Operator[]) || []
}

export async function upsertOperator(
  supabase: SupabaseClient,
  nama: string
): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_operator', { p_nama: nama })
  if (error) throw error
  return data as string
}

// Full active operator list for the Owner's "Pilih Operator" picker (Tugaskan
// flow) — unlike searchOperators, not capped at 10 and not query-driven.
export async function listActiveOperators(supabase: SupabaseClient): Promise<Operator[]> {
  const { data, error } = await supabase.rpc('list_active_operators')
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

export async function savePatternFormulation(
  supabase: SupabaseClient,
  params: {
    orderId: string
    template: PatternTemplate
    patternMeasurements: MeasurementFields
    operatorId: string
  }
): Promise<void> {
  const { error } = await supabase.rpc('save_pattern_formulation', {
    p_order_id: params.orderId,
    p_template: params.template,
    p_pattern_measurements: params.patternMeasurements,
    p_operator_id: params.operatorId,
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
