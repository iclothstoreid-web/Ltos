'use client'

import { useEffect, useState } from 'react'

// Minimal reusable success toast — no toast library exists in this project
// yet (Design Bible pages use plain Tailwind + design tokens directly), so
// this reuses the same primary/elev tokens as decision-primary/elev-2
// instead of introducing a new dependency.
export function Toast({ message, duration = 4000 }: { message: string; duration?: number }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!visible) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="elev-2 bg-primary text-white text-body px-6 py-3 rounded-[14px]">
        {message}
      </div>
    </div>
  )
}
