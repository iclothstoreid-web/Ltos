import type { SupabaseClient } from '@supabase/supabase-js'

// PS-01.2 (Optimistic Conflict Protection) — `consultations.notes` is a
// single packed text blob shared by three different pages across the
// funnel: Measurement (Customer Digital Profile), Consultation Review
// (Fitter Enhancements + Event Information), and Design Studio (Design
// Specification/blueprint). Each one does read-decode-edit-encode-write of
// the WHOLE column. Every one of those writes used to be a bare
// `.update({ notes }).eq('id', id)` with no freshness check, so whichever
// save landed last silently discarded any other section's concurrent edit
// — the classic lost-update shape the sprint brief calls out. Guarded here
// on `updated_at`, a column `consultations` already has (no schema change).
//
// All three callers must keep their own "last known good" notes/updated_at
// in local state (not re-derive from the initial page-load prop on every
// save) and update it from this function's return value after a successful
// write — see ConsultationReviewWorkspace/MeasurementWorkspace/
// DesignStudioWorkspace's `rawNotes`/`consultationUpdatedAt` state.
export class StaleConsultationError extends Error {
  constructor() {
    super(
      'Data konsultasi ini sudah diubah oleh proses lain sejak terakhir dimuat. Muat ulang halaman sebelum menyimpan lagi.'
    )
    this.name = 'StaleConsultationError'
  }
}

export async function saveConsultationFields(
  supabase: SupabaseClient,
  id: string,
  expectedUpdatedAt: string,
  patch: { notes?: string; status?: string }
): Promise<string> {
  const nextUpdatedAt = new Date().toISOString()

  const { data, error } = await supabase
    .from('consultations')
    .update({ ...patch, updated_at: nextUpdatedAt })
    .eq('id', id)
    .eq('updated_at', expectedUpdatedAt)
    .select('updated_at')

  if (error) throw error
  if (!data || data.length === 0) {
    throw new StaleConsultationError()
  }
  return (data[0] as { updated_at: string }).updated_at
}

// Both RPCs below raise the exact same "sudah diubah oleh proses lain"
// text as StaleConsultationError when the optimistic-lock guard fails
// (see the migration) — re-thrown as the typed error here so callers can
// keep doing `err instanceof StaleConsultationError` regardless of whether
// the write goes through a bare `.update()` (saveConsultationFields above)
// or one of these RPCs.
function rethrowIfStale(error: { message?: string } | null): never | void {
  if (error && typeof error.message === 'string' && error.message.includes('sudah diubah oleh proses lain')) {
    throw new StaleConsultationError()
  }
  if (error) throw error
}

// PS-01.5 (Transaction Integrity) — backs MeasurementWorkspace's
// handleDecision. Used to be 3 separate network calls (measurements
// INSERT, business_events INSERT, consultations UPDATE); a failure on the
// last one left an orphaned measurement row with no completion/rejection
// event and a status that never advanced. Now one RPC call, one
// transaction — see 20260901000000_ps01_5_transaction_integrity.sql.
export async function recordMeasurementDecision(
  supabase: SupabaseClient,
  params: {
    consultationId: string
    decision: 'valid' | 'remeasure'
    chest: number | null
    shoulder: number | null
    sleeve: number | null
    length: number | null
    heightCm: number | null
    weightKg: number | null
    ageYears: number | null
    measurementNotes: string
    eventData: Record<string, unknown>
    nextConsultationNotes: string | null
    expectedUpdatedAt: string
    createdBy: string | null
  }
): Promise<string> {
  const { data, error } = await supabase.rpc('record_measurement_decision', {
    p_consultation_id: params.consultationId,
    p_decision: params.decision,
    p_chest: params.chest,
    p_shoulder: params.shoulder,
    p_sleeve: params.sleeve,
    p_length: params.length,
    p_height_cm: params.heightCm,
    p_weight_kg: params.weightKg,
    p_age_years: params.ageYears,
    p_measurement_notes: params.measurementNotes,
    p_event_data: params.eventData,
    p_next_consultation_notes: params.nextConsultationNotes,
    p_expected_updated_at: params.expectedUpdatedAt,
    p_created_by: params.createdBy,
  })
  rethrowIfStale(error)
  return data as string
}

// PS-01.5 (Transaction Integrity) — backs DesignStudioWorkspace's
// persist(). Used to be a consultations UPDATE followed by a separate
// business_events INSERT; a failure on the event insert after the notes
// update already committed silently lost the audit trail with no retry
// signal. Now one RPC call, one transaction.
export async function saveDesignSelections(
  supabase: SupabaseClient,
  params: {
    consultationId: string
    notes: string
    nextStatus: string | null
    eventType: string
    eventData: Record<string, unknown>
    expectedUpdatedAt: string
    createdBy: string | null
  }
): Promise<string> {
  const { data, error } = await supabase.rpc('save_design_selections', {
    p_consultation_id: params.consultationId,
    p_notes: params.notes,
    p_next_status: params.nextStatus,
    p_event_type: params.eventType,
    p_event_data: params.eventData,
    p_expected_updated_at: params.expectedUpdatedAt,
    p_created_by: params.createdBy,
  })
  rethrowIfStale(error)
  return data as string
}
