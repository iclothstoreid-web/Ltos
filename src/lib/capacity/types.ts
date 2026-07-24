// Sprint K (LOCK V1) §12-14 -- one row per date from get_capacity_calendar,
// now a computed/override split rather than a single manual number.
export interface CapacityCalendarDay {
  calendar_date: string
  computed_max_orders: number
  effective_max_orders: number
  is_override: boolean
  override_reason: string | null
  overridden_by: string | null
  overridden_at: string | null
  notes: string | null
}

export interface CapacityOverrideAuditLogEntry {
  id: string
  calendar_date: string
  old_max_orders: number | null
  new_max_orders: number | null
  reason: string
  changed_by: string | null
  changed_at: string
}
