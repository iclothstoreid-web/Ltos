'use client'

import type { StageRecord } from '@/lib/production/types'
import { STAGE_LABELS } from '@/lib/production/stageConfig'

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

  return (
    <div className="border border-[#c6c6cc]/60 bg-white/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-hanken text-sm font-semibold text-[#161b29]">
          {STAGE_LABELS[record.stage]}
          {record.attempt > 1 ? ` (Percobaan ${record.attempt})` : ''}
        </p>
        <span
          className={`font-hanken text-[9px] uppercase tracking-widest px-2 py-0.5 ${
            record.decision === 'alter'
              ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
              : 'bg-[#161b29]/10 text-[#161b29]'
          }`}
        >
          {record.decision === 'alter' ? 'Alter' : 'Selesai'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-hanken text-xs text-[#46464c] mb-3">
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
          <p className="font-hanken text-[9px] uppercase tracking-widest text-[#46464c] mb-1">
            Checklist
          </p>
          <ul className="font-hanken text-xs text-[#46464c] space-y-0.5">
            {checklistEntries.map(([item, done]) => (
              <li key={item}>
                {done ? '✓' : '✗'} {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {record.evidence_url && (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL
        <img
          src={record.evidence_url}
          alt={`Bukti ${STAGE_LABELS[record.stage]}`}
          className="w-full max-h-40 object-cover mb-3"
        />
      )}

      {record.alter_category && (
        <p className="font-hanken text-xs text-[#ba1a1a] mb-1">
          Kategori Temuan: {record.alter_category}
        </p>
      )}

      {record.notes && (
        <p className="font-hanken text-xs text-[#46464c] italic">&quot;{record.notes}&quot;</p>
      )}
    </div>
  )
}
