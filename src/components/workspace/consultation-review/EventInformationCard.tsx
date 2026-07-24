'use client'

import { useState } from 'react'
import {
  DEADLINE_FLEXIBILITY_LABELS,
  EVENT_TYPE_OPTIONS,
  type DeadlineFlexibility,
  type EventInformation,
  type EventType,
} from './eventInformationCodec'

interface EventInformationCardProps {
  value: EventInformation
  saving: boolean
  onChange: (patch: Partial<EventInformation>) => void
}

// Milestone 3 (Consultation Decision Engine): Event Type is context only.
// Target Usage Date is the field every downstream engine (Estimation
// Validation) actually reads.
export function EventInformationCard({ value, saving, onChange }: EventInformationCardProps) {
  const [catatan, setCatatan] = useState(value.catatan)

  return (
    <section className="bg-white p-4 shadow-sm border-[0.5px] border-[#c4c7c7]">
      <h3 className="font-sans text-xs text-[#151c27] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">event</span>
        Event Information
      </h3>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-sans text-[10px] text-[#7a7a7a] uppercase tracking-widest">
            Event Type
          </span>
          <select
            value={value.eventType}
            disabled={saving}
            onChange={e => onChange({ eventType: e.target.value as EventType })}
            className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19] disabled:opacity-60"
          >
            <option value="">Pilih jenis acara</option>
            {EVENT_TYPE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-sans text-[10px] text-[#7a7a7a] uppercase tracking-widest">
            Target Usage Date
          </span>
          <input
            type="date"
            value={value.targetUsageDate}
            disabled={saving}
            onChange={e => onChange({ targetUsageDate: e.target.value })}
            className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19] disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-sans text-[10px] text-[#7a7a7a] uppercase tracking-widest">
            Deadline Flexibility
          </span>
          <select
            value={value.deadlineFlexibility}
            disabled={saving}
            onChange={e => onChange({ deadlineFlexibility: e.target.value as DeadlineFlexibility })}
            className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19] disabled:opacity-60"
          >
            <option value="">Pilih fleksibilitas</option>
            {(Object.entries(DEADLINE_FLEXIBILITY_LABELS) as [Exclude<DeadlineFlexibility, ''>, string][]).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              )
            )}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-sans text-[10px] text-[#7a7a7a] uppercase tracking-widest">
            Catatan
          </span>
          <textarea
            value={catatan}
            disabled={saving}
            onChange={e => setCatatan(e.target.value)}
            onBlur={() => {
              if (catatan !== value.catatan) onChange({ catatan })
            }}
            rows={3}
            placeholder="Catatan tambahan seputar acara..."
            className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19] disabled:opacity-60 resize-none"
          />
        </label>
      </div>
    </section>
  )
}
