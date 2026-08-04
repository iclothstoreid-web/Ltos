'use client'

import { useState } from 'react'
import type { StageRecord } from '@/lib/production/types'
import { STAGE_LABELS } from '@/lib/production/stageConfig'
import { FullscreenMediaModal } from './FullscreenMediaModal'

interface DigitalHandoverCardProps {
  record: StageRecord
}

function formatDuration(startedAt: string | null, completedAt: string | null) {
  if (!startedAt || !completedAt) return '—'
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `${minutes} menit`
  return `${Math.floor(minutes / 60)}j ${minutes % 60}m`
}

function formatTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// The permanent record every completed stage produces per the brief:
// Operator, Jam Mulai, Jam Selesai, Durasi, Checklist, 1 Evidence, Catatan,
// Status. Used both as post-completion confirmation and in the Riwayat list.
export function DigitalHandoverCard({ record }: DigitalHandoverCardProps) {
  const checklistEntries = record.checklist ? Object.entries(record.checklist) : []
  const [showEvidence, setShowEvidence] = useState(false)

  return (
    <div className="border border-outline-variant/60 bg-white/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-hanken text-sm font-semibold text-on-surface">
          {STAGE_LABELS[record.stage]}
          {record.attempt > 1 ? ` (Percobaan ${record.attempt})` : ''}
        </p>
        <span
          className={`font-hanken text-[9px] uppercase tracking-widest px-2 py-0.5 ${
            record.decision === 'alter'
              ? 'bg-error/10 text-error'
              : 'bg-on-surface/10 text-on-surface'
          }`}
        >
          {record.decision === 'alter' ? 'Alter' : 'Selesai'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-hanken text-xs text-secondary mb-3">
        <span>Operator: {record.operator_name || '—'}</span>
        <span>Divisi: {record.division || '—'}</span>
        <span>Jam Mulai: {formatTime(record.started_at)}</span>
        <span>Jam Selesai: {formatTime(record.completed_at)}</span>
        <span className="col-span-2">
          Durasi: {formatDuration(record.started_at, record.completed_at)}
        </span>
      </div>

      {checklistEntries.length > 0 && (
        <div className="mb-3">
          <p className="font-hanken text-[9px] uppercase tracking-widest text-secondary mb-1">
            Checklist
          </p>
          <ul className="font-hanken text-xs text-secondary space-y-0.5">
            {checklistEntries.map(([item, done]) => (
              <li key={item}>
                {done ? '✓' : '✗'} {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {record.evidence_url && (
        // Sprint UX-03.1 (Photo Display Consistency) — was a full-width,
        // max-h-40 landscape strip with no way to see the whole photo.
        // Portrait aspect-[3/4] thumbnail + tap-to-fullscreen (reusing the
        // same FullscreenMediaModal every other production photo already
        // uses), same evidence_url source, no new data/upload logic.
        <button
          type="button"
          onClick={() => setShowEvidence(true)}
          className="w-40 aspect-[3/4] rounded overflow-hidden mb-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL */}
          <img
            src={record.evidence_url}
            alt={`Bukti ${STAGE_LABELS[record.stage]}`}
            className="w-full h-full object-cover"
          />
        </button>
      )}

      {showEvidence && record.evidence_url && (
        <FullscreenMediaModal
          kind="image"
          src={record.evidence_url}
          alt={`Bukti ${STAGE_LABELS[record.stage]}`}
          onClose={() => setShowEvidence(false)}
        />
      )}

      {record.alter_category && (
        <p className="font-hanken text-xs text-error mb-1">
          Kategori Temuan: {record.alter_category}
        </p>
      )}

      {record.notes && (
        <p className="font-hanken text-xs text-secondary italic">&quot;{record.notes}&quot;</p>
      )}
    </div>
  )
}
