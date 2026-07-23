'use client'

import { useEffect, useState } from 'react'

// Traps the Android hardware/gesture back button (this kiosk is a plain web
// app in a browser/webview, no PWA wrapper — back just fires `popstate`).
// A sentinel history entry is pushed on mount so the first back press is
// caught as a popstate instead of leaving the page; ExitConfirmModal then
// decides whether to actually navigate away.
export function useProductionBackGuard() {
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    history.pushState(null, '', location.href)

    function handlePopState() {
      setShowExitConfirm(true)
      // Re-arm the trap immediately so a cancelled exit still intercepts the
      // next back press, without the operator needing to scan again.
      history.pushState(null, '', location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return { showExitConfirm, dismiss: () => setShowExitConfirm(false) }
}
