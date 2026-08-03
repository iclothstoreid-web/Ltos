'use client'

import type { TodaysAction } from '@/lib/decision/types'

// Volume 02 Color DNA tokens replacing the old ad-hoc #8a2c22/#7a5a12 hex.
const SEVERITY_BORDER: Record<TodaysAction['severity'], string> = {
  critical: 'border-l-error',
  warning: 'border-l-warm-gold',
  info: 'border-l-outline-variant',
}
const SEVERITY_DOT: Record<TodaysAction['severity'], string> = {
  critical: 'bg-error',
  warning: 'bg-warm-gold',
  info: 'bg-secondary/60',
}

// Section 5 (Sprint I brief): "Today's Action" -- rule-based, computed in
// src/lib/decision/actions.ts from get_owner_summary()'s fields only. No AI,
// no automation; this component only renders the resulting list.
export function TodaysActionSection({ actions }: { actions: TodaysAction[] }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Today&apos;s Action</h2>
      </div>

      <ul className="space-y-2">
        {actions.map(action => (
          <li
            key={action.id}
            className={`flex items-start gap-3 rounded-[10px] border-l-2 bg-surface/45 px-4 py-3 ${SEVERITY_BORDER[action.severity]}`}
          >
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${SEVERITY_DOT[action.severity]}`} />
            <p className="text-body text-on-surface">{action.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
