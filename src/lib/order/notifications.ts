import type { OrderCreatedNotificationPayload } from './types'

// Not implemented — no WhatsApp/messaging integration exists in this repo
// yet. Per the brief: just prepare the callback shape, don't send anything.
export function notifyOrderCreated(payload: OrderCreatedNotificationPayload): void {
  console.info('[notifications] WhatsApp send not yet implemented, skipping', payload)
}
