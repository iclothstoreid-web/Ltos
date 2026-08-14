'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { parseProductionQrPayload } from '@/lib/order/qr'
import { scanTokenKey } from '@/lib/production/accessToken'
import { QrScanModal } from '@/components/workspace/production/QrScanModal'
import { Logo } from '@/components/brand/Logo'

// Secondary panel (notification bell, badge count) — pulls in the full
// Supabase client SDK (~66kB gzipped) to fetch pending assignments on
// mount. Deferred to its own chunk so that SDK isn't part of the scan
// entry screen's initial JS. Still server-rendered (default ssr: true), so
// the bell icon appears in the initial HTML exactly as before — no loading
// state, no layout shift.
const AssignedJobsPanel = dynamic(
  () => import('@/components/workspace/production/AssignedJobsPanel').then(m => m.AssignedJobsPanel)
)

// Sole entry point of the Production app. There is no order list here —
// Fitter prints the QR, sticks it on the physical order, and this scanner
// is the only door into that order's Production Packet. On a valid scan it
// drops a short-lived token (read by ProductionAccessGate) and redirects to
// /production/[orderId].
export default function ProductionScanEntryPage() {
  const router = useRouter()

  return (
    // Brand System Upgrade — atelier-bg (walnut wood-grain, shared with
    // Owner OS/Inventory Hub) for consistency across every LTOS app shell.
    <div className="min-h-screen bg-surface-01 atelier-bg flex items-center justify-center p-6">
      <AssignedJobsPanel />

      {/* App identity, shown above the (always-open, non-dismissible) scan
          modal's backdrop — purely visual, no effect on the scan flow below. */}
      <div className="fixed top-0 inset-x-0 z-[60] text-center pt-8 pb-4 px-6 pointer-events-none">
        {/* Brand System Upgrade — 2x the previous h-7/28px. */}
        <Logo variant="horizontalTagline" className="mx-auto h-14 w-auto text-white/90" />
        <p className="font-caslon text-2xl text-white mt-1">Production Flow</p>
        <p className="font-hanken text-xs text-white/70 mt-1">
          Manage and monitor bespoke garment production workflow.
        </p>
      </div>
      <QrScanModal
        title="Scan QR Produksi"
        description="Scan QR yang ditempel Fitter pada order fisik untuk membuka Production Packet-nya."
        validate={value => parseProductionQrPayload(value) !== null}
        dismissible={false}
        onSuccess={value => {
          const orderId = parseProductionQrPayload(value)
          if (!orderId) return
          sessionStorage.setItem(scanTokenKey(orderId), '1')
          router.push(`/production/${orderId}`)
        }}
        onClose={() => {}}
      />
    </div>
  )
}
