import type { Operator, OperatorStatus } from '@/lib/production/types'

export type { Operator, OperatorStatus }

export const OPERATOR_STATUS_LABELS: Record<OperatorStatus, string> = {
  aktif: 'Aktif',
  libur: 'Libur',
  cuti: 'Cuti',
  nonaktif: 'Nonaktif',
}

export const OPERATOR_STATUS_OPTIONS: OperatorStatus[] = ['aktif', 'libur', 'cuti', 'nonaktif']
