'use client'

import { useState, type ReactNode } from 'react'
import { SectionShell } from './SectionShell'

type SharePlatform = 'whatsapp' | 'instagram' | 'facebook' | 'x' | 'copy'

interface ShareMomentSectionProps {
  heading: string
  message: string
  shareUrl: string
  platforms?: SharePlatform[]
  variant?: 'default' | 'prominent'
}

const DEFAULT_PLATFORMS: SharePlatform[] = ['whatsapp', 'instagram', 'copy']

// Invites the customer to share this moment — not a promotional CTA. "Salin
// Link" is the one real action here (Clipboard API, same pattern as
// CustomerTrackingActions elsewhere in the app). WhatsApp / Instagram Story /
// Facebook / X have no integration yet — per brief, that's built in a future
// sprint — so their handlers are deliberate no-op placeholders, easy to wire
// up later. `platforms` + `variant` let Milestone 4 (subtle, 3 icons) and
// Milestone 5 (prominent, 5 icons — the page's biggest CTA) share this one
// component instead of duplicating it.
export function ShareMomentSection({
  heading,
  message,
  shareUrl,
  platforms = DEFAULT_PLATFORMS,
  variant = 'default',
}: ShareMomentSectionProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — no
      // fallback needed, nothing else on this section depends on it.
    }
  }

  const noop = () => {}

  const ICONS: Record<SharePlatform, { label: string; onClick: () => void; path: ReactNode }> = {
    whatsapp: {
      label: 'Bagikan ke WhatsApp',
      onClick: noop,
      path: (
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.3c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.7-2.8-1-4.6-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.5 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1 .2-.3.4-.2.6-.1.2.1 1.5.7 1.7.8.2.1.4.2.4.3.1.2.1.6-.1 1.2Z" />
      ),
    },
    instagram: {
      label: 'Bagikan ke Instagram Story',
      onClick: noop,
      path: (
        <path d="M12 2.2c2.7 0 3 0 4 .1 1 .1 1.7.2 2.3.5.6.2 1.1.6 1.6 1.1.5.5.8.9 1.1 1.6.2.6.4 1.3.5 2.3.1 1 .1 1.3.1 4s0 3-.1 4c-.1 1-.2 1.7-.5 2.3-.2.6-.6 1.1-1.1 1.6-.5.5-.9.8-1.6 1.1-.6.2-1.3.4-2.3.5-1 .1-1.3.1-4 .1s-3 0-4-.1c-1-.1-1.7-.2-2.3-.5-.6-.2-1.1-.6-1.6-1.1-.5-.5-.8-.9-1.1-1.6-.2-.6-.4-1.3-.5-2.3-.1-1-.1-1.3-.1-4s0-3 .1-4c.1-1 .2-1.7.5-2.3.2-.6.6-1.1 1.1-1.6.5-.5.9-.8 1.6-1.1.6-.2 1.3-.4 2.3-.5 1-.1 1.3-.1 4-.1Zm0 1.8c-2.6 0-2.9 0-4 .1-.8.1-1.3.2-1.6.3-.4.2-.7.3-1 .6-.3.3-.4.6-.6 1-.1.3-.3.8-.3 1.6-.1 1.1-.1 1.4-.1 4s0 2.9.1 4c.1.8.2 1.3.3 1.6.2.4.3.7.6 1 .3.3.6.4 1 .6.3.1.8.3 1.6.3 1.1.1 1.4.1 4 .1s2.9 0 4-.1c.8-.1 1.3-.2 1.6-.3.4-.2.7-.3 1-.6.3-.3.4-.6.6-1 .1-.3.3-.8.3-1.6.1-1.1.1-1.4.1-4s0-2.9-.1-4c-.1-.8-.2-1.3-.3-1.6-.2-.4-.3-.7-.6-1-.3-.3-.6-.4-1-.6-.3-.1-.8-.3-1.6-.3-1.1-.1-1.4-.1-4-.1Zm0 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 1.8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm5-2a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" />
      ),
    },
    facebook: {
      label: 'Bagikan ke Facebook',
      onClick: noop,
      path: <path d="M13.5 21v-7.8h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.5-1.5h1.6V4.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H9.9v3h2.6V21h3Z" />,
    },
    x: {
      label: 'Bagikan ke X',
      onClick: noop,
      path: (
        <path d="M13.6 10.6 20 3h-1.6l-5.5 6.6L8.5 3H3l6.8 9.9L3 21h1.6l5.9-7 4.7 7H21l-7.4-10.4Zm-2.1 2.5-.7-1L5.4 4.2h2.2l4.4 6.3.7 1 5.8 8.3h-2.2l-4.8-6.9Z" />
      ),
    },
    copy: {
      label: 'Salin link',
      onClick: handleCopyLink,
      path: copied ? (
        <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
      ) : (
        <path d="M17 7h-4a5 5 0 0 0 0 10h4v-1.5h-4a3.5 3.5 0 1 1 0-7h4V7Zm-10 5a3.5 3.5 0 0 1 3.5-3.5h4V7h-4a5 5 0 0 0 0 10h4v-1.5h-4A3.5 3.5 0 0 1 7 12Zm1 .75h8v-1.5H8v1.5Z" />
      ),
    },
  }

  const isProminent = variant === 'prominent'

  return (
    <SectionShell spacing="lg" centered>
      <h2 className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary mb-4">{heading}</h2>
      <p
        className={`font-fraunces text-on-surface leading-relaxed max-w-md mx-auto mb-8 ${
          isProminent ? 'text-xl' : 'text-lg'
        }`}
      >
        {message}
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        {platforms.map(platform => {
          const { label, onClick, path } = ICONS[platform]
          return (
            <button
              key={platform}
              type="button"
              onClick={onClick}
              aria-label={label}
              className={`rounded-full border border-[#151c27]/15 flex items-center justify-center text-secondary hover:text-primary hover:border-primary/40 transition-colors ${
                isProminent ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-11 h-11'
              }`}
            >
              <svg viewBox="0 0 24 24" className={`fill-current ${isProminent ? 'w-6 h-6' : 'w-5 h-5'}`}>
                {path}
              </svg>
            </button>
          )
        })}
      </div>
      {copied && <p className="font-sans text-[10px] uppercase tracking-widest text-primary mt-3">Link disalin</p>}
    </SectionShell>
  )
}
