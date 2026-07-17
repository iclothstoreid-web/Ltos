'use client'

import { useState } from 'react'

interface CustomerTrackingActionsProps {
  trackingUrl: string
}

// "Copy Link" is real (Clipboard API, copies the actual QR payload URL).
// WhatsApp/Email/Print have no backend (no messaging/PDF integration
// exists) — left as inert buttons rather than faking a send/print action.
export function CustomerTrackingActions({ trackingUrl }: CustomerTrackingActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — no
      // fallback needed here, the URL is already visible on screen.
    }
  }

  return (
    <section className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#c4c7c7]/40 shadow-sm p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-3 bg-white border border-[#c4c7c7] rounded gap-4">
          <span className="font-sans text-sm text-[#444748] truncate">{trackingUrl}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="font-sans text-xs text-[#151c27] uppercase font-bold hover:underline shrink-0"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'chat', label: 'WhatsApp' },
            { icon: 'mail', label: 'Email' },
            { icon: 'print', label: 'Print' },
          ].map(action => (
            <button
              key={action.label}
              type="button"
              disabled
              title="Not wired to a backend yet"
              className="flex items-center justify-center gap-2 py-3 border border-[#c4c7c7] text-[#444748]
                         opacity-50 cursor-not-allowed font-sans text-xs uppercase"
            >
              <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
