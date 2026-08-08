'use client'

import { useEffect, useState } from 'react'

// PR-01 (Rendering Performance) — extracted out of OwnerCommandCenter so the
// 60s tick only re-renders this leaf, not the whole dashboard tree. Same
// hydration-safe pattern as before: starts null, fills in on mount, so
// server-rendered markup never shows a timestamp that would mismatch the
// client's first render. Minute-only, not per-second, per Behavior DNA
// Tempo ("never perform busyness").
export function ClockLabel() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])
  const timeLabel = now ? now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'

  return <p className="text-label text-secondary/80 tabular-nums">{timeLabel}</p>
}
