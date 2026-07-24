'use client'

import { X } from 'lucide-react'
import type { OperatorKpiRow } from '@/lib/kpi/types'
import { OperatorKpiTable } from './OperatorKpiTable'
import { summarizePerformance } from '@/lib/kpi/performanceMetrics'
import type { OperatorPerformanceRecord } from '@/lib/kpi/types'

// Drill-down opened by clicking a divisi card in DivisiKpiGrid -- filters
// the same get_operator_kpi_list() rows the "Daftar Operator" table already
// has in memory (no new RPC, no duplicated fetch), and reuses
// OperatorKpiTable/onSelectOperator as-is so a member row still opens the
// existing OperatorDetailModal on top of this overlay. Filters by
// division_id (the real FK), not divisi text -- master_divisions.name has
// no uniqueness constraint, so text equality isn't a safe join key even
// though it's now trigger-synced (see 20260810000000_add_operator_division_id.sql).
export function DivisiMembersModal({
  divisionId,
  label,
  operators,
  performanceRecords,
  onClose,
  onSelectOperator,
}: {
  divisionId: string | null
  label: string
  operators: OperatorKpiRow[]
  performanceRecords: OperatorPerformanceRecord[]
  onClose: () => void
  onSelectOperator: (operatorId: string) => void
}) {
  const members = operators.filter(op => op.division_id === divisionId)
  const memberIds = new Set(members.map(member => member.operator_id))
  const records = performanceRecords.filter(record => record.operator_id && memberIds.has(record.operator_id))
  const summary = summarizePerformance(records)
  const ranked = [...members].sort((a, b) => (b.efficiency_pct ?? -1) - (a.efficiency_pct ?? -1))
  const topPerformer = ranked[0]?.nama || '—'
  const bottomPerformer = ranked.length ? ranked[ranked.length - 1]?.nama || '—' : '—'

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-sm shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-[#e5e5e0] z-10">
          <div>
            <h2 className="font-hanken text-sm uppercase tracking-widest text-[#161b29]">Anggota Divisi</h2>
            <p className="font-hanken text-xs text-[#46464c] mt-1">{label}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <X size={18} className="text-[#46464c]" />
          </button>
        </div>

        <div className="p-6">
          <section className="mb-6">
            <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-3">KPI Divisi</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <p className="font-hanken text-xs text-[#46464c]">Average Task Time <strong className="block text-sm text-[#161b29]">{summary.primaryTaskMinutes == null ? '—' : `${Math.round(summary.primaryTaskMinutes)} mnt`}</strong></p>
              <p className="font-hanken text-xs text-[#46464c]">Return Count <strong className="block text-sm text-[#161b29]">{summary.alterCount}</strong></p>
              <p className="font-hanken text-xs text-[#46464c]">Return Rate <strong className="block text-sm text-[#161b29]">{summary.returnRatePct == null ? '—' : `${summary.returnRatePct.toFixed(1)}%`}</strong></p>
              <p className="font-hanken text-xs text-[#46464c]">Productivity <strong className="block text-sm text-[#161b29]">{summary.productivity}</strong></p>
              <p className="font-hanken text-xs text-[#46464c]">Top Performer <strong className="block text-sm text-[#161b29]">{topPerformer}</strong></p>
              <p className="font-hanken text-xs text-[#46464c]">Bottom Performer <strong className="block text-sm text-[#161b29]">{bottomPerformer}</strong></p>
            </div>
          </section>

          <section className="mb-6">
            <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-2">Return Breakdown</p>
            {summary.alterCount === 0 ? <p className="font-hanken text-xs text-[#46464c]">Belum ada return/alter.</p> : (
              <p className="font-hanken text-xs text-[#161b29]">{summary.alterCount} return dari {records.filter(record => record.decision != null).length} keputusan stage.</p>
            )}
          </section>

          <OperatorKpiTable operators={members} performanceRecords={records} onSelectOperator={onSelectOperator} title="Operator Breakdown" />
        </div>
      </div>
    </div>
  )
}
