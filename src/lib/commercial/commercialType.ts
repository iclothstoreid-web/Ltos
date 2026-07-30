// Single source of truth for Commercial Type — see
// supabase/migrations/20260820000000_add_transactions_commercial_type_engine.sql
// (transactions.commercial_type check constraint mirrors this list exactly).
//
// NORMAL/DP/FULL_PAYMENT all behave identically today (invoice generated,
// revenue counted) — DP vs Full only affects which payment_type gets
// recorded later via record_order_payment. There is exactly one behavioral
// branch, `requiresInvoice`, never re-encoded elsewhere.
//
// Naming note: "KOL" already exists in this codebase as a discount reason
// code (apply_order_kol/kol_code, still produces a normal invoice — relabeled
// "Diskon Influencer" in OrderCommercialSection to avoid confusion). This
// `kol` value is a different concept: a Commercial Type with no invoice at
// all, for sponsorship/KOL garments given away for exposure.

export type CommercialType =
  | 'normal'
  | 'dp'
  | 'full_payment'
  | 'kol'
  | 'sponsor'
  | 'warranty'
  | 'internal_sample'

export interface CommercialTypeOption {
  value: CommercialType
  label: string
  requiresInvoice: boolean
}

export const COMMERCIAL_TYPES: CommercialTypeOption[] = [
  { value: 'normal', label: 'Normal', requiresInvoice: true },
  { value: 'dp', label: 'DP (Uang Muka)', requiresInvoice: true },
  { value: 'full_payment', label: 'Lunas di Muka', requiresInvoice: true },
  { value: 'kol', label: 'KOL / Sponsorship (Tanpa Invoice)', requiresInvoice: false },
  { value: 'sponsor', label: 'Sponsor (Tanpa Invoice)', requiresInvoice: false },
  { value: 'warranty', label: 'Garansi / Remake (Tanpa Invoice)', requiresInvoice: false },
  { value: 'internal_sample', label: 'Sample Internal (Tanpa Invoice)', requiresInvoice: false },
]

export const COMMERCIAL_TYPE_LABELS: Record<CommercialType, string> = Object.fromEntries(
  COMMERCIAL_TYPES.map(t => [t.value, t.label])
) as Record<CommercialType, string>

const NON_BILLABLE_TYPES: CommercialType[] = ['kol', 'sponsor', 'warranty', 'internal_sample']

export function requiresInvoice(type: CommercialType): boolean {
  return !NON_BILLABLE_TYPES.includes(type)
}
