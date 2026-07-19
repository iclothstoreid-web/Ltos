'use client'

import { useRouter } from 'next/navigation'
import { parseProductionQrPayload } from '@/lib/order/qr'
import { scanTokenKey } from '@/lib/production/accessToken'
import { QrScanModal } from '@/components/workspace/production/QrScanModal'

// Sole entry point of the Production app. There is no order list here —
// Fitter prints the QR, sticks it on the physical order, and this scanner
// is the only door into that order's Production Packet. On a valid scan it
// drops a short-lived token (read by ProductionAccessGate) and redirects to
// /production/[orderId].
export default function ProductionScanEntryPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex items-center justify-center p-6">
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
