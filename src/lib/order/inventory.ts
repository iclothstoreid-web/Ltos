import type { InventoryReservationRequest } from './types'

// Not implemented — no inventory table/backend exists in this repo yet.
// Per the brief: no stock reservation this sprint, no dummy reservation
// data, just a clear integration point ready for later. Called (as a no-op)
// from createOrder.ts so the call site already exists when this is wired up.
export function reserveInventory(request: InventoryReservationRequest): void {
  console.info('[inventory] reservation not yet implemented, skipping', request)
}
