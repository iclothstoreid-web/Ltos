'use client'

import { useRouter } from 'next/navigation'
import { parseProductionQrPayload } from '@/lib/order/qr'
import { scanTokenKey } from '@/lib/production/accessToken'
import { QrScanModal } from '@/components/workspace/production/QrScanModal'
import { AssignedJobsPanel } from '@/components/workspace/production/AssignedJobsPanel'

// Sole entry point of the Production app. There is no order list here —
// Fitter prints the QR, sticks it on the physical order, and this scanner
// is the only door into that order's Production Packet. On a valid scan it
// drops a short-lived token (read by ProductionAccessGate) and redirects to
// /production/[orderId].
export default function ProductionScanEntryPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex items-center justify-center p-6">
      <AssignedJobsPanel />

      {/* App identity, shown above the (always-open, non-dismissible) scan
          modal's backdrop — purely visual, no effect on the scan flow below. */}
      <div className="fixed top-0 inset-x-0 z-[60] text-center pt-8 pb-4 px-6 pointer-events-none">
        <p className="font-jetbrains text-[10px] uppercase tracking-[0.35em] text-white/70">
          Local Tailor Operating System
        </p>
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
