import type { SupabaseClient } from '@supabase/supabase-js'
import type { InventoryReservationRequest } from './types'
import { reserveMaterialForOrder } from '@/lib/inventory/stock'

// Wired to the Inventory schema (reserve_material_for_order RPC). Fabric
// and color are reserved separately since the brief's Material Reservation
// example only ever tracks one figure (meters of fabric) — color has no
// quantity concept, so it's skipped when quantityMeters is null or not a
// positive number (Fitter left the field blank). A missing match in
// `materials` (no such item catalogued yet) never blocks order creation —
// reserveMaterialForOrder itself no-ops in that case; errors here are
// swallowed for the same reason.
export async function reserveInventory(supabase: SupabaseClient, request: InventoryReservationRequest): Promise<void> {
  if (request.quantityMeters === null || request.quantityMeters <= 0) {
    console.info('[inventory] no fabric-usage quantity to reserve, skipping', request)
    return
  }

  try {
    await reserveMaterialForOrder(supabase, {
      orderId: request.orderId,
      materialName: request.fabricName,
      quantity: request.quantityMeters,
    })
  } catch (err) {
    console.error('[inventory] reservation failed, order creation continues', err)
  }
}
