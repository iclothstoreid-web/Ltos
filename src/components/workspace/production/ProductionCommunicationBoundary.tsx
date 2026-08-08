import { createClient } from '@/lib/supabase/server'
import { getOrderCommunications } from '@/lib/communication/kiosk'
import { timedQuery } from '@/lib/production/perfInstrumentation'
import { ProductionCommunicationPanel } from './ProductionCommunicationPanel'

interface ProductionCommunicationBoundaryProps {
  orderId: string
}

// Streaming boundary (Sprint N4) — Komunikasi Order is a secondary panel;
// HeroCard/StageProgressRail/the active stage panel don't read from it, so
// it no longer has to finish before page.tsx can respond. This Server
// Component does the exact same get_order_communications read page.tsx used
// to do inline, just deferred behind its own <Suspense> so it streams in
// after the critical shell instead of blocking it. Deliberately never
// cached (Sprint N5) — live order communication, must always read fresh.
export async function ProductionCommunicationBoundary({ orderId }: ProductionCommunicationBoundaryProps) {
  const supabase = createClient()
  const initialMessages = await timedQuery('communications (deferred)', () =>
    getOrderCommunications(supabase, orderId)
  )
  return <ProductionCommunicationPanel orderId={orderId} initialMessages={initialMessages} />
}
