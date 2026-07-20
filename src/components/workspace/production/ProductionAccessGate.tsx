'use client'

import { useEffect, useRef, useState } from 'react'
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
// at /production, not a bookmarked/typed URL.
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
  // The scan-token check below is destructive (it consumes a single-use
  // sessionStorage token) and was observed — via direct sessionStorage
  // instrumentation — to sometimes run twice for the same mount during a
  // single client-side navigation from the QR scanner, non-deterministically.
  // The 2nd run would find the token already removed by the 1st and wrongly
  // redirect away from an otherwise-valid, already-granted session. This ref
  // makes the check idempotent per orderId: at most one run per mount (or
  // per orderId change, in case a future caller ever swaps orderId without
  // unmounting) actually reads/removes the token and decides `allowed`; any
  // further invocation is a no-op.
  const checkedForOrderIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (isInProgress) {
      setAllowed(true)
      return
    }
    if (checkedForOrderIdRef.current === orderId) return
    checkedForOrderIdRef.current = orderId

    const key = scanTokenKey(orderId)
    const justScanned = sessionStorage.getItem(key) !== null
    sessionStorage.removeItem(key)

    if (!justScanned) {
      router.replace('/production')
      return
    }
    setAllowed(true)
  }, [orderId, isInProgress, router])

  if (!allowed) return null
  return <>{children}</>
}
