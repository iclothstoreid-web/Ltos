import { ProductionPacketSkeleton } from '@/components/workspace/production/ProductionPacketSkeleton'

// Route-level Suspense boundary — shown immediately on navigation into
// /production/[orderId] while page.tsx's server-side data fetch
// (get_production_packet + rules + communications/customer notes) is still
// in flight, instead of leaving the previous screen frozen with no
// feedback until the whole response arrives. Same shell
// ProductionAccessGate now falls back to while it validates the scan
// token, so there's no visual seam between this boundary handing off and
// that gate's own pending state.
export default function ProductionPacketLoading() {
  return <ProductionPacketSkeleton />
}
