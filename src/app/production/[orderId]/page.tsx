import { createClient } from '@/lib/supabase/server'
import { getProductionPacket, getCachedProductionRules, getCachedReturnRules } from '@/lib/production/client'
import { getCurrentStageRecord } from '@/lib/production/stageConfig'
import { getCustomerPhotoAndReferencesForOrder } from '@/lib/production/customerNotes'
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

  // Request Flow Optimization (STEP 3) — productionRules/returnRules don't
  // depend on the packet, so they're fetched alongside it instead of after.
  // Cache Strategy (STEP 5.2) — both are relatively static, admin-configured
  // rules (RLS `using (true)`, no per-user variation), cached 60s instead of
  // hitting Postgres on every single kiosk scan.
  const [packet, productionRules, returnRules] = await Promise.all([
    getProductionPacket(supabase, params.orderId),
    getCachedProductionRules(),
    getCachedReturnRules(),
  ])
  const isInProgress = packet
    ? getCurrentStageRecord(packet.stage_records)?.status === 'in_progress'
    : false

  // communications and customer notes/references both only need packet to
  // exist (not any of its fields) and don't depend on each other — fetched
  // together instead of sequentially. Query Optimization (STEP 2, P1) —
  // photo and references still come from one get_production_customer_notes
  // call instead of two.
  const [initialMessages, { customerPhotoUrl, customerReferences }] = packet
    ? await Promise.all([
        getOrderCommunications(supabase, params.orderId),
        getCustomerPhotoAndReferencesForOrder(supabase, params.orderId),
      ])
    : [[], { customerPhotoUrl: null, customerReferences: [] }]

  return (
    <ProductionAccessGate orderId={params.orderId} isInProgress={isInProgress}>
      {!packet ? (
        <div className="min-h-screen bg-surface-01 flex items-center justify-center p-6">
          <p className="font-hanken text-sm text-secondary">
            Production Packet tidak ditemukan untuk order ini.
          </p>
        </div>
      ) : (
        <ProductionPacketWorkspace
          initialPacket={packet}
          orderId={params.orderId}
          initialMessages={initialMessages}
          customerPhotoUrl={customerPhotoUrl}
          customerReferences={customerReferences}
          productionRules={productionRules}
          returnReasons={returnRules.reasons}
        />
      )}
    </ProductionAccessGate>
  )
}
