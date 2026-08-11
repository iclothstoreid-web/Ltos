import type { SupabaseClient } from '@supabase/supabase-js'
import type { DesignConfig, Estimate, ServiceLevel } from '@/types/configurator'
import type { ConfiguratorCatalog } from './mapping'
import type { EtaResult } from './eta'
import type { DesignSession } from './session'

// W2-5 "interface abstraction" — TypeScript contracts for every swappable
// seam, kept in this standalone file rather than edited into estimate.ts /
// eta.ts / session.ts / mapping.ts themselves (all locked this sprint).
// TypeScript's structural typing means each seam's existing exported
// function ALREADY satisfies its interface below with zero code changes —
// these types exist purely so a future swap has a named contract to
// implement against, and so "does the new implementation still fit?" is a
// single type-check instead of a manual read-through.
//
// A file that wants to lean on these for real (e.g. a factory that picks
// a stub vs. production implementation) can import the interface and do
// `const engine: PricingEngine = computeEstimate` — that assignment only
// compiles if the shapes truly match.

// Swap target: a real Commercial Engine pricing call.
// Current implementation: computeEstimate() in estimate.ts.
export interface PricingEngine {
  (config: DesignConfig, serviceLevel: ServiceLevel, catalog: ConfiguratorCatalog): Estimate
}

// Swap target: previewServiceValidation()/getServiceSlaRules()
// (src/lib/order/service.ts) once this configurator is wired to the real
// Service/Capacity Engine.
// Current implementation: computeEta() in eta.ts.
export interface EtaEngine {
  (serviceLevel: ServiceLevel, from?: Date): EtaResult
}

// Swap target: a real design_sessions table (insert -> id, select by id)
// instead of a signed stateless token.
// Current implementation: encodeDesignSession()/decodeDesignSession() in
// session.ts.
export interface PersistenceEngine {
  encode(session: DesignSession): string
  decode(slug: string): DesignSession | null
}

// Swap target: none planned — this already IS the single source of truth
// for LTOS Master Data reads. Documented here anyway so every other
// contract in this file has a consistent counterpart to point at.
// Current implementation: getConfiguratorCatalog() in mapping.ts.
export interface MappingLayer {
  (supabase: SupabaseClient): Promise<ConfiguratorCatalog>
}
