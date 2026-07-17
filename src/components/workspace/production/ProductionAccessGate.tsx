'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { scanTokenKey } from '@/lib/production/accessToken'

interface ProductionAccessGateProps {
  orderId: string
  // Source of truth from the DB (current stage record's status === 'in_progress'),
  // computed server-side by the page. When true, access is durable — survives
  // refresh, reconnect, browser restart — no session/timeout involved at all.
  isInProgress: boolean
  children: React.ReactNode
}

// Enforces that a Production Packet was reached via the Scan QR entry point
// at /workspace/production, not a bookmarked/typed URL.
//
// Two ways in:
// 1. isInProgress (DB says the current stage is "Sedang Dikerjakan") — always
//    allowed, no expiry. This is the normal case for the entire duration of a
//    stage: the operator can refresh, lose and regain network, or restart the
//    browser and still land back on the same packet.
// 2. A single-use "just scanned" marker — the only bridge for the brief window
//    between a valid scan and `start_stage` actually persisting in_progress
//    (picking an operator + clicking "Mulai Pekerjaan" isn't instant, and the
//    DB has no in_progress record yet at that point).
// Anything else (no active stage, no fresh scan) bounces back to the scanner.
export function ProductionAccessGate({ orderId, isInProgress, children }: ProductionAccessGateProps) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(isInProgress)

  useEffect(() => {
    if (isInProgress) {
      setAllowed(true)
      return
    }

    const key = scanTokenKey(orderId)
    const justScanned = sessionStorage.getItem(key) !== null
    sessionStorage.removeItem(key)

    if (!justScanned) {
      router.replace('/workspace/production')
      return
    }
    setAllowed(true)
  }, [orderId, isInProgress, router])

  if (!allowed) return null
  return <>{children}</>
}
