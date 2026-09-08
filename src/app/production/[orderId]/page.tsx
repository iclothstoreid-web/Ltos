import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getProductionPacket, getCachedProductionRules, getCachedReturnRules } from '@/lib/production/client'
import { getCurrentStageRecord } from '@/lib/production/stageConfig'
import { getCustomerPhotoAndReferencesForOrder } from '@/lib/production/customerNotes'
import { timedQuery } from '@/lib/production/perfInstrumentation'
import { ProductionMobileWorkspace } from '@/components/workspace/production/ProductionMobileWorkspace'
import { ProductionAccessGate } from '@/components/workspace/production/ProductionAccessGate'
import { ProductionCommunicationBoundary } from '@/components/workspace/production/ProductionCommunicationBoundary'
import { CustomerReferenceBoundary } from '@/components/workspace/production/CustomerReferenceBoundary'
import { CommunicationPanelSkeleton, MediaProduksiCardSkeleton } from '@/components/workspace/production/DeferredPanelSkeletons'
import { ReferenceModelCard } from '@/components/workspace/production/ReferenceModelCard'
import { MaterialSpecCard } from '@/components/workspace/production/MaterialSpecCard'

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

  // Query Consolidation (Sprint N5) — started immediately, in parallel with
  // packet/rules below, instead of being gated behind `packet` resolving
  // first (that gate turned this into a waterfall: Promise.all(packet,
  // rules) THEN a separate awaited customer-notes call). Not knowing yet
  // whether `packet` exists is fine here — the one call this triggers on the
  // rare "order not found" path is a negligible cost against removing a real
  // sequential wait on the common path. Its Promise is also handed to
  // CustomerReferenceBoundary below (see that file's doc comment) instead of
  // that boundary firing a second get_production_customer_notes call — one
  // RPC call now serves both HeroCard's customerPhotoUrl (critical) and
  // Media Produksi's customerReferences (deferred).
  const customerNotesPromise = timedQuery('customerNotes (critical, shared)', () =>
    getCustomerPhotoAndReferencesForOrder(supabase, params.orderId)
  )
  customerNotesPromise.catch(() => {})

  const [packet, productionRules, returnRules] = await Promise.all([
    timedQuery('packet (critical)', () => getProductionPacket(supabase, params.orderId)),
    timedQuery('productionRules (critical, cached 60s)', () => getCachedProductionRules()),
    timedQuery('returnRules (critical, cached 60s)', () => getCachedReturnRules()),
  ])
  const isInProgress = packet
    ? getCurrentStageRecord(packet.stage_records)?.status === 'in_progress'
    : false

  const { customerPhotoUrl } = packet
    ? await customerNotesPromise
    : { customerPhotoUrl: null }

  const packingVideoUrl = packet
    ? [...packet.stage_records]
        .filter(r => r.stage === 'packing')
        .sort((a, b) => b.attempt - a.attempt)[0]?.video_url ?? null
    : null

  return (
    <ProductionAccessGate orderId={params.orderId} isInProgress={isInProgress}>
      {!packet ? (
        <div className="min-h-screen bg-surface-01 flex items-center justify-center p-6">
          <p className="font-hanken text-sm text-secondary">
            Production Packet tidak ditemukan untuk order ini.
          </p>
        </div>
      ) : (
        <ProductionMobileWorkspace
          initialPacket={packet}
          orderId={params.orderId}
          customerPhotoUrl={customerPhotoUrl}
          productionRules={productionRules}
          returnReasons={returnRules.reasons}
          referenceModelSlot={<ReferenceModelCard design={packet.design} />}
          materialSpecSlot={
            <MaterialSpecCard design={packet.design} consultationNotes={packet.consultation_notes} />
          }
          communicationSlot={
            <Suspense fallback={<CommunicationPanelSkeleton />}>
              <ProductionCommunicationBoundary orderId={params.orderId} />
            </Suspense>
          }
          referenceSlot={
            <Suspense fallback={<MediaProduksiCardSkeleton />}>
              <CustomerReferenceBoundary
                customerNotesPromise={customerNotesPromise}
                packingVideoUrl={packingVideoUrl}
              />
            </Suspense>
          }
        />
      )}
    </ProductionAccessGate>
  )
}
