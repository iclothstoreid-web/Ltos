import { createClient } from '@/lib/supabase/server'
import { getProductionPacket } from '@/lib/production/client'
import { getCurrentStageRecord } from '@/lib/production/stageConfig'
import { getOrderCommunications } from '@/lib/communication/kiosk'
import { ProductionPacketWorkspace } from '@/components/workspace/production/ProductionPacketWorkspace'
import { ProductionAccessGate } from '@/components/workspace/production/ProductionAccessGate'

interface Props {
  params: { orderId: string }
}

// Kiosk page — deliberately NO auth check, unlike every other workspace
// page. Operators use a shared shop-floor device with no login (per the
// master prompt); all reads/writes go through SECURITY DEFINER RPCs scoped
// to exactly what this page needs, so the anon key never touches
// orders/customers/business_events directly.
//
// Entry is still gated, just not by auth: ProductionAccessGate bounces
// anyone who didn't just come from the /production Scan QR
// screen back to it, so this URL can't be opened directly/bookmarked.
// The stage's own status ('in_progress' or not) is the source of truth for
// that gate, not a session timeout — so a refresh, a dropped connection, or
// a browser restart mid-stage never locks the operator out.
export default async function ProductionPacketPage({ params }: Props) {
  const supabase = createClient()
  const packet = await getProductionPacket(supabase, params.orderId)
  const isInProgress = packet
    ? getCurrentStageRecord(packet.stage_records)?.status === 'in_progress'
    : false
  const initialMessages = packet ? await getOrderCommunications(supabase, params.orderId) : []

  return (
    <ProductionAccessGate orderId={params.orderId} isInProgress={isInProgress}>
      {!packet ? (
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6">
          <p className="font-sans text-sm text-[#444748]">
            Production Packet tidak ditemukan untuk order ini.
          </p>
        </div>
      ) : (
        <ProductionPacketWorkspace initialPacket={packet} orderId={params.orderId} initialMessages={initialMessages} />
      )}
    </ProductionAccessGate>
  )
}
