'use client'

import { X } from 'lucide-react'
import type { OperatorKpiRow } from '@/lib/kpi/types'
import { OperatorKpiTable } from './OperatorKpiTable'

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
  onClose,
  onSelectOperator,
}: {
  divisionId: string | null
  label: string
  operators: OperatorKpiRow[]
  onClose: () => void
  onSelectOperator: (operatorId: string) => void
}) {
  const members = operators.filter(op => op.division_id === divisionId)

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
          <OperatorKpiTable operators={members} onSelectOperator={onSelectOperator} title="Anggota Divisi" />
        </div>
      </div>
    </div>
  )
}
