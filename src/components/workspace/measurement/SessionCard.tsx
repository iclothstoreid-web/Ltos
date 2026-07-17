'use client'

import { useEffect, useState } from 'react'

interface SessionCardProps {
  sessionId: string
  fitterName: string
}

// "Started At" / "Duration" reflect real time since this page was opened
// (not fabricated demo values) — there's no server-side session-start
// timestamp to read, so this is the honest approximation.
export function SessionCard({ sessionId, fitterName }: SessionCardProps) {
  const [startedAt] = useState(() => new Date())
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])

  const durationMin = Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 60_000))

  return (
    <div className="p-6 border-[0.5px] border-[#c4c7c7] space-y-3">
      <div className="flex justify-between">
        <span className="text-xs text-[#444748]">Session ID</span>
        <span className="text-xs font-bold text-[#151c27]">{sessionId}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-[#444748]">Measured By</span>
        <span className="text-xs text-[#151c27]">{fitterName}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-[#444748]">Started At</span>
        <span className="text-xs text-[#151c27]">
          {startedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-[#444748]">Duration</span>
        <span className="text-xs text-[#151c27]">{durationMin} mins</span>
      </div>
    </div>
  )
}
