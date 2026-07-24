'use client'

import type { DivisiKpiRow } from '@/lib/kpi/types'

type DivisiStatus = 'bottleneck' | 'overload' | 'idle' | 'unstaffed' | 'normal'

const STATUS_LABEL: Record<DivisiStatus, string> = {
  bottleneck: 'Bottleneck',
  overload: 'Overload',
  idle: 'Idle',
  unstaffed: 'Belum Ada SDM',
  normal: 'Normal',
}

const STATUS_CLASS: Record<DivisiStatus, string> = {
  bottleneck: 'bg-[#f8d7da] text-[#7a2530]',
  overload: 'bg-[#f8d7da] text-[#7a2530]',
  idle: 'bg-[#fff3cd] text-[#7a5c10]',
  unstaffed: 'bg-on-surface/10 text-secondary',
  normal: 'bg-[#dce9df] text-[#1c5a34]',
}

function formatPct(pct: number | null): string {
  return pct == null ? '—' : `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

// Bottleneck = the single staffed divisi with the least headroom (capacity -
// active_jobs, same definition compute_daily_capacity() already uses) --
// only flagged when headroom <= 0, an actual constraint rather than just the
// smallest of several comfortable margins. Overload (>100% utilisasi) and
// idle (0 active_jobs) reuse OperatorAttentionSection's per-operator
// thresholds, applied per divisi instead of per operator. Unstaffed (0 SDM)
// is kept distinct from idle -- an empty divisi is a data-tagging gap, not a
// performance signal (per compute_daily_capacity()'s own documented rule).
// Keyed by division_id (falling back to divisi text only for the id-less
// "Belum Terhubung ke Divisi" bucket) -- master_divisions.name has no
// uniqueness constraint, so the id is the only collision-safe key.
function rowKey(row: DivisiKpiRow): string {
  return row.division_id ?? row.divisi
}

function classify(rows: DivisiKpiRow[]): Record<string, DivisiStatus> {
  const result: Record<string, DivisiStatus> = {}
  let bottleneckKey: string | null = null
  let minHeadroom = Infinity

  for (const row of rows) {
    if (row.jumlah_sdm === 0) {
      result[rowKey(row)] = 'unstaffed'
      continue
    }

    const headroom = row.total_capacity - row.active_jobs
    if (headroom < minHeadroom) {
      minHeadroom = headroom
      bottleneckKey = rowKey(row)
    }

    if (row.capacity_utilization_pct != null && row.capacity_utilization_pct > 100) {
      result[rowKey(row)] = 'overload'
    } else if (row.active_jobs === 0) {
      result[rowKey(row)] = 'idle'
    } else {
      result[rowKey(row)] = 'normal'
    }
  }

  if (bottleneckKey && minHeadroom <= 0) {
    result[bottleneckKey] = 'bottleneck'
  }

  return result
}

// Per-divisi breakdown of SDM Produksi Aktif (audit fix -- this used to be
// one flat "Total Operator Aktif" number with no divisi awareness). Reads
// get_divisi_kpi_list() as-is; classification above is pure client-side
// derivation over numbers the RPC already computed, same
// "no new business logic in a new RPC" approach OperatorAttentionSection
// used for its Over Capacity/Normal/Idle buckets. Click -> DivisiMembersModal.
export function DivisiKpiGrid({
  divisiRows,
  onSelectDivisi,
}: {
  divisiRows: DivisiKpiRow[]
  onSelectDivisi: (division: { id: string | null; label: string }) => void
}) {
  const statusByDivisi = classify(divisiRows)

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">SDM Produksi per Divisi</h2>
        <p className="text-body text-secondary">Klik divisi untuk lihat anggota</p>
      </div>

      {divisiRows.length === 0 ? (
        <div className="rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-10 text-center elev-1">
          <p className="text-body text-secondary">Belum ada data divisi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {divisiRows.map(row => {
            const status = statusByDivisi[rowKey(row)] ?? 'normal'
            return (
              <button
                key={rowKey(row)}
                type="button"
                onClick={() => onSelectDivisi({ id: row.division_id, label: row.divisi })}
                className="text-left rounded-[14px] border border-outline-variant/85 bg-surface/45 px-5 py-4 elev-1 hover:-translate-y-[1px] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-body font-medium text-on-surface">{row.divisi}</p>
                  <span
                    className={`text-label px-2 py-1 rounded-full uppercase tracking-widest shrink-0 ${STATUS_CLASS[status]}`}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </div>

                <dl className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-body text-secondary">Jumlah SDM</dt>
                    <dd className="text-body text-on-surface">{row.jumlah_sdm}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-body text-secondary">Capacity</dt>
                    <dd className="text-body text-on-surface">
                      {row.active_jobs}/{row.total_capacity}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-body text-secondary">Throughput</dt>
                    <dd className="text-body text-on-surface">
                      {row.throughput_hari_ini} hari ini &middot; {row.throughput_minggu_ini} minggu ini
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-body text-secondary">KPI Divisi</dt>
                    <dd className="text-body text-on-surface">{formatPct(row.avg_efficiency_pct)}</dd>
                  </div>
                </dl>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
