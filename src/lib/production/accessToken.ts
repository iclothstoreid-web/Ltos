// Shared between the Scan QR entry page and ProductionAccessGate for the
// single-use "just scanned" marker — the narrow bridge between a valid scan
// and the moment `start_stage` actually writes status = 'in_progress' to
// the DB (picking an operator + clicking "Mulai Pekerjaan" isn't instant).
// Once that DB write happens, the marker is irrelevant: stage status itself
// is the access source of truth, with no timeout of any kind.
export function scanTokenKey(orderId: string): string {
  return `ltos_production_scan:${orderId}`
}
