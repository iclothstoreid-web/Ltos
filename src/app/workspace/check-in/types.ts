export interface Customer {
  id: string
  name: string
  phone: string | null
  address: string | null
  created_at: string
  is_preferred_client: boolean
}

// Exactly the 7 values the DB's consultations_status_check constraint
// allows (audited directly against Postgres 2026-07-30 — there is no
// "Business Rules" runtime-config table for this: Business Rules (Sprint K)
// only ever holds operational parameters, never workflow state — see
// project_ltos_business_config_layer memory). PRODUCTION/QC/DELIVERY/DONE
// are NOT values of this column: once a consultation reaches
// 'order_created' its own lifecycle is over — the order's subsequent
// Production/QC/Delivery stages live entirely on production_stage_records,
// a different table this type doesn't model.
export type ConsultationStatus =
  | 'check_in'
  | 'waiting_measurement'
  | 'measurement'
  | 'design'
  | 'review'
  | 'order_created'
  | 'cancelled'

export const CONSULTATION_STATUSES: readonly ConsultationStatus[] = [
  'check_in',
  'waiting_measurement',
  'measurement',
  'design',
  'review',
  'order_created',
  'cancelled',
]

// Single source of truth for "is this consultation's workflow still in
// progress" — shared by findActiveConsultationForCustomer's DB filter
// (actions.ts) and resumeRouteForConsultation below, so the two can never
// disagree about which statuses are terminal.
export const TERMINAL_CONSULTATION_STATUSES: readonly ConsultationStatus[] = ['order_created', 'cancelled']

export function isConsultationActive(status: ConsultationStatus): boolean {
  return !TERMINAL_CONSULTATION_STATUSES.includes(status)
}

export interface Consultation {
  id: string
  consultation_number: string
  status: ConsultationStatus
  notes: string | null
  completed_at: string | null
  created_at: string
  // PS-01.2 (Optimistic Conflict Protection) — every page-load selects
  // `*` from `consultations`, so this column was always in the fetched row;
  // only newly exposed on the type so Measurement/Consultation Review/
  // Design Studio can use it as the optimistic-lock comparison value. See
  // src/lib/consultation/notesSave.ts.
  updated_at: string
}

export interface RecentConsultation {
  id: string
  consultation_number: string
  status: string
  created_at: string
  customers: {
    id: string
    name: string
    phone: string | null
  } | null
}

export interface CreateConsultationResult {
  success: boolean
  error: string | null
  consultationId: string | null
  consultationNumber: string | null
}

export interface CreateCustomerResult {
  success: boolean
  error: string | null
  customer: Customer | null
}

export interface SearchResult {
  customers: Customer[]
  error: string | null
}

export interface ConsultationHistoryResult {
  consultations: Consultation[]
  error: string | null
}

export interface RecentConsultationsResult {
  consultations: RecentConsultation[]
  error: string | null
}

// Unreachable in practice (every real ConsultationStatus is handled below)
// — exists purely so TypeScript fails to compile if the CHECK constraint
// ever grows an 8th value that this switch doesn't explicitly handle,
// instead of that value silently falling through to a default route.
function assertNeverConsultationStatus(status: never): never {
  throw new Error(`resumeRouteForConsultation: unhandled consultation status "${status}"`)
}

// "Resume, Don't Recreate" — where a Fitter lands when picking a customer
// who already has an in-progress consultation, so the workflow continues
// from wherever it was left instead of starting over. Every one of the 7
// real statuses is listed explicitly (no default case) — terminal statuses
// return null (not resumable; caller should treat this the same as "no
// active consultation", i.e. safe to start a new one), everything else
// returns its exact resume route:
//
//   check_in / waiting_measurement / measurement -> Measurement
//     (per MeasurementWorkspace.tsx: 'measurement' is only ever set on the
//     re-measure path, meaning "still needs to be (re-)measured" — it never
//     means "measured, waiting for Design," so there is no ambiguity here;
//     'waiting_measurement' is a reserved value nothing currently writes)
//   design    -> Design Studio (measurement completed, flips status here)
//   review    -> Consultation Review (Design's "Lanjutkan" flips status here)
//   order_created / cancelled -> null (terminal, see isConsultationActive)
export function resumeRouteForConsultation(
  status: ConsultationStatus,
  consultationId: string
): string | null {
  switch (status) {
    case 'check_in':
    case 'waiting_measurement':
    case 'measurement':
      return `/workspace/measurement/${consultationId}`
    case 'design':
      return `/workspace/design-studio/${consultationId}`
    case 'review':
      return `/workspace/consultation-review/${consultationId}`
    case 'order_created':
    case 'cancelled':
      return null
    default:
      return assertNeverConsultationStatus(status)
  }
}

// Dashboard Fitter's "Order Monitoring" (Task 1) — one row per order ever
// created, newest first. status_produksi/estimasi are pre-resolved server
// side (see getFitterOrders) so the Order Card can render without its own
// data fetch.
export interface FitterOrder {
  id: string
  order_number: string
  created_at: string
  customer_name: string
  status_produksi: string
  status_category: 'waiting' | 'in_progress' | 'completed'
  estimasi: string
}

export interface FitterOrdersResult {
  orders: FitterOrder[]
  error: string | null
}