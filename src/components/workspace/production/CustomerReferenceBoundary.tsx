import type { ConsultationDocument } from '@/components/workspace/consultation-review/fitterEnhancementsCodec'
import { timedQuery } from '@/lib/production/perfInstrumentation'
import { MediaProduksiCard } from './MediaProduksiCard'

interface CustomerReferenceBoundaryProps {
  // Sprint N5 (Query Consolidation) — page.tsx starts
  // getCustomerPhotoAndReferencesForOrder exactly once (needed on the
  // critical path for HeroCard's customerPhotoUrl) and hands the *same*
  // in-flight Promise down here instead of this boundary firing its own
  // second get_production_customer_notes call. Awaiting a Promise more than
  // once never re-runs the underlying work, so this stays a real streaming
  // boundary (it still `await`s before rendering, so <Suspense> still
  // applies if the shared fetch is ever the slow one) while cutting the
  // request's RPC count for this data from 2 back to 1.
  customerNotesPromise: Promise<{
    customerPhotoUrl: string | null
    customerReferences: ConsultationDocument[]
  }>
  // Derived from stage_records the same way ProductionPacketWorkspace used
  // to (largest Packing attempt's video_url) — page.tsx re-derives this pure
  // read from the already-fetched critical `packet`, no new query.
  packingVideoUrl: string | null
}

export async function CustomerReferenceBoundary({
  customerNotesPromise,
  packingVideoUrl,
}: CustomerReferenceBoundaryProps) {
  const { customerPhotoUrl, customerReferences } = await timedQuery(
    'customerNotes (deferred, shared with critical path)',
    () => customerNotesPromise
  )
  return (
    <MediaProduksiCard
      customerPhotoUrl={customerPhotoUrl}
      customerReferences={customerReferences}
      packingVideoUrl={packingVideoUrl}
    />
  )
}
