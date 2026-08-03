'use client'

import type { ServiceAvailability, ServiceLevel } from '@/lib/decision/types'

const LEVEL_ORDER: ServiceLevel[] = ['standard', 'fast', 'very_fast']
const LEVEL_LABEL: Record<ServiceLevel, string> = {
  standard: 'Standard',
  fast: 'Fast',
  very_fast: 'Very Fast',
}
const STATUS_LABEL: Record<'green' | 'yellow' | 'red', string> = {
  green: 'Available',
  yellow: 'Warning',
  red: 'Unavailable',
}
// Volume 02 Color DNA tokens replacing the old ad-hoc #dce9df/#f3e6c8/#f3d6d3 hex.
const STATUS_CLASS: Record<'green' | 'yellow' | 'red', string> = {
  green: 'bg-primary/10 text-primary',
  yellow: 'bg-warm-gold/15 text-warm-gold',
  red: 'bg-error/10 text-error',
}

// Section 4 (Sprint I brief): get_owner_summary().service_availability, one
// entry per level straight from Sprint C's compute_service_validation_signals
// -- overall_status green/yellow/red mapped to the brief's own vocabulary
// (Available/Warning/Unavailable), no new threshold introduced here.
export function ServiceAvailabilitySection({ data }: { data: ServiceAvailability }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Service Availability</h2>
        <p className="text-body text-secondary">Status penjualan layanan hari ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LEVEL_ORDER.map(level => {
          const signal = data[level]
          return (
            <div key={level} className="rounded-[14px] border border-outline-variant/85 bg-surface/45 elev-1 px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-body font-medium text-on-surface">{LEVEL_LABEL[level]}</p>
                <span
                  className={`text-label px-2 py-1 rounded-full uppercase tracking-widest ${STATUS_CLASS[signal.overall_status]}`}
                >
                  {STATUS_LABEL[signal.overall_status]}
                </span>
              </div>
              {signal.reasons.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {signal.reasons.map((reason, i) => (
                    <li key={i} className="text-body text-secondary">
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
