// Not implemented — no WhatsApp/messaging integration exists in this repo
// yet (same situation as src/lib/order/notifications.ts), and there is no
// `finance` role/contact configured to send to either. Per the brief: send
// WhatsApp to Finance on low stock, never to Owner. Just prepare the
// callback shape, don't send anything, so the call site already exists
// when WA/Finance infra is wired up.
export interface LowStockNotificationPayload {
  materialId: string
  materialName: string
  availableStock: number
  minStock: number
  unit: string
}

export function notifyLowStock(payload: LowStockNotificationPayload): void {
  console.info('[inventory] low stock WhatsApp-to-Finance not yet implemented, skipping', payload)
}
