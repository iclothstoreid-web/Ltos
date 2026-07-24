'use client'

import type { FitterKpiRow } from '@/lib/fitter/types'

function formatPct(pct: number | null): string {
  return pct == null ? '—' : `${pct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

// "Semua consultation menjadi KPI fitter" — reads get_fitter_kpi_list()
// (Sprint K), same table shell/interaction pattern as OperatorKpiTable
// (Sprint G) one section below it on the same page.
export function FitterKpiTable({
  fitters,
  onSelectFitter,
}: {
  fitters: FitterKpiRow[]
  onSelectFitter: (fitterId: string) => void
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-3">
        <h2 className="text-label text-secondary uppercase tracking-[0.24em]">Daftar Fitter</h2>
        <p className="text-body text-secondary">Klik baris untuk detail</p>
      </div>

      <div className="rounded-[4px] border border-border-subtle bg-surface-01/40 overflow-hidden relative elev-2">
        {fitters.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-title text-on-surface mb-2">Belum ada konsultasi tercatat</p>
            <p className="text-body text-secondary">
              Data Fitter muncul setelah Check-In memilih Fitter untuk sebuah konsultasi.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="bg-on-surface/5 border-b border-outline-variant/80">
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Nama Fitter
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Total Konsultasi
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Konsultasi Selesai
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Order Dibuat
                  </th>
                  <th className="text-left px-5 py-3 text-label text-secondary uppercase tracking-widest whitespace-nowrap">
                    Konversi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {fitters.map(f => (
                  <tr
                    key={f.fitter_id}
                    onClick={() => onSelectFitter(f.fitter_id)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectFitter(f.fitter_id)
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-on-surface/5 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                  >
                    <td className="px-5 py-4 text-body font-medium text-on-surface whitespace-nowrap">{f.nama}</td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">{f.total_konsultasi}</td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">{f.konsultasi_selesai}</td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">{f.order_dibuat}</td>
                    <td className="px-5 py-4 text-body text-secondary whitespace-nowrap">
                      {formatPct(f.conversion_rate_pct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
