import type { ServiceLevel } from '@/lib/order/service'

export const SERVICE_LEVEL_LABELS: Record<ServiceLevel, string> = {
  standard: 'Standard',
  fast: 'Fast',
  very_fast: 'Very Fast',
}

export const SERVICE_LEVELS: ServiceLevel[] = ['standard', 'fast', 'very_fast']

// Placeholder working-day counts for the PUBLIC configurator only. The real,
// admin-configurable values live in `service_sla_rules`
// (getServiceSlaRules()/get_service_sla_rules(), see src/lib/order/service.ts)
// and factor in live capacity/Hari-D signals via previewServiceValidation().
// This route is anonymous — it must not expose that internal capacity data
// — so it uses the day counts the W2-3 brief specifies as a stand-in until a
// production sprint wires the real Service Engine in here. See computeEta's
// ENGINE SEAM note below for exactly what to swap.
const PLACEHOLDER_SERVICE_LEVEL_DAYS: Record<ServiceLevel, number> = {
  standard: 14,
  fast: 9,
  very_fast: 3,
}

export interface EtaResult {
  productionDays: number
  completionDateIso: string
  completionDateFormatted: string
}

// Mirrors public.add_working_days() exactly (see
// supabase/migrations/20260728000000_add_service_sla_engine.sql): the start
// date itself doesn't count as a working day, Senin-Sabtu all count, Minggu
// (Sunday, getDay() === 0) is skipped. Kept algorithmically identical on
// purpose so a later swap to the real RPC changes zero call sites.
function addWorkingDays(start: Date, workingDays: number): Date {
  const result = new Date(start)
  let remaining = workingDays
  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    if (result.getDay() !== 0) {
      remaining -= 1
    }
  }
  return result
}

// ENGINE SEAM: replace this function's body with a call into
// previewServiceValidation()/getServiceSlaRules() (src/lib/order/service.ts)
// once this configurator is wired to the real Service/Capacity Engine — the
// EtaResult return shape is designed to stay the same across that swap.
export function computeEta(serviceLevel: ServiceLevel, from: Date = new Date()): EtaResult {
  const productionDays = PLACEHOLDER_SERVICE_LEVEL_DAYS[serviceLevel]
  const completion = addWorkingDays(from, productionDays)
  return {
    productionDays,
    completionDateIso: completion.toISOString(),
    completionDateFormatted: completion.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }
}
