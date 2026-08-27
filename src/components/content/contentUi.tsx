'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { websiteMediaUrl } from '@/lib/content/mediaUrl'

// Shared Owner OS "Content" chrome — matches the M3-ish light palette the
// rest of Owner OS uses (#f9f9ff surface, #151c27 text, #755b00 primary,
// #c4c7c7 hairlines).

export function ContentShell({ title, backHref = '/owner/content', children, actions }: {
  title: string
  backHref?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#151c27]">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#c4c7c7] bg-[#f9f9ff]/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#444748] transition hover:bg-[#151c27]/5"
            aria-label="Kembali"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="font-sans text-lg font-medium">{title}</h1>
        </div>
        {actions}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#755b00] px-4 py-2 font-sans text-sm text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#c4c7c7] px-4 py-2 font-sans text-sm text-[#151c27] transition hover:bg-[#151c27]/5 disabled:cursor-not-allowed disabled:opacity-40 ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-sans text-xs font-medium uppercase tracking-[0.06em] text-[#444748]">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-sans text-xs text-[#444748]">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-[#c4c7c7] bg-white px-3 py-2 font-sans text-sm text-[#151c27] outline-none focus:border-[#755b00]'

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: 'bg-[#dff2df] text-[#1f6b2c]',
    active: 'bg-[#dff2df] text-[#1f6b2c]',
    draft: 'bg-[#f3ecd8] text-[#755b00]',
    archived: 'bg-[#eceef4] text-[#444748]',
  }
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 font-sans text-[11px] uppercase tracking-[0.04em] ${map[status] ?? 'bg-[#eceef4] text-[#444748]'}`}>
      {status}
    </span>
  )
}

// A small square media preview (transform endpoint, ~200px).
export function MediaThumb({ path, alt, size = 88 }: { path: string | null; alt?: string; size?: number }) {
  const url = websiteMediaUrl(path, { width: size * 2, height: size * 2, quality: 66, resize: 'cover' })
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eceef4]"
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt ?? ''} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <span className="material-symbols-outlined text-[#755b00]/40">image</span>
      )}
    </span>
  )
}
