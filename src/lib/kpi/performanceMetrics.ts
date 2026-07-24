import type { OperatorPerformanceRecord } from './types'

export interface PerformanceSummary {
  primaryTaskMinutes: number | null
  alterCount: number
  alterMinutes: number
  returnRatePct: number | null
  productivity: number
  weeklyProductivity: number
  monthlyProductivity: number
  eightWeekHistory: Array<{ label: string; value: number }>
}

function durationMinutes(record: OperatorPerformanceRecord): number | null {
  if (!record.started_at || !record.completed_at) return null
  const duration = (new Date(record.completed_at).getTime() - new Date(record.started_at).getTime()) / 60000
  return Number.isFinite(duration) && duration >= 0 ? duration : null
}

function startOfWeek(date: Date): Date {
  const value = new Date(date)
  const day = value.getDay()
  const diff = day === 0 ? -6 : 1 - day
  value.setDate(value.getDate() + diff)
  value.setHours(0, 0, 0, 0)
  return value
}

function weekKey(date: Date): number {
  return startOfWeek(date).getTime()
}

// One shared calculation for the scorecard table, operator drill-down, and
// division drill-down. It only groups existing stage records and therefore
// cannot drift into a second KPI definition.
export function summarizePerformance(records: OperatorPerformanceRecord[], now = new Date()): PerformanceSummary {
  const completed = records.filter(record => record.completed_at)
  const durations = completed
    .map(durationMinutes)
    .filter((duration): duration is number => duration != null)
  const alterRecords = records.filter(record => record.decision === 'alter')
  const decidedCount = records.filter(record => record.decision != null).length
  const thisWeek = startOfWeek(now).getTime()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const weeklyOrders = new Set<string>()
  const monthlyOrders = new Set<string>()
  const allCompletedOrders = new Set<string>()

  for (const record of completed) {
    const completedAt = new Date(record.completed_at!)
    allCompletedOrders.add(record.order_id)
    if (completedAt.getTime() >= thisWeek) weeklyOrders.add(record.order_id)
    if (completedAt.getTime() >= thisMonth) monthlyOrders.add(record.order_id)
  }

  const historyStart = startOfWeek(now)
  historyStart.setDate(historyStart.getDate() - 7 * 7)
  const countsByWeek = new Map<number, number>()
  for (const record of completed) {
    const completedAt = new Date(record.completed_at!)
    if (completedAt >= historyStart) {
      const key = weekKey(completedAt)
      countsByWeek.set(key, (countsByWeek.get(key) || 0) + 1)
    }
  }
  const eightWeekHistory = Array.from({ length: 8 }, (_, index) => {
    const weekStart = startOfWeek(now)
    weekStart.setDate(weekStart.getDate() - (7 - index) * 7)
    return {
      label: weekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      value: countsByWeek.get(weekStart.getTime()) || 0,
    }
  })

  return {
    primaryTaskMinutes: durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : null,
    alterCount: alterRecords.length,
    alterMinutes: alterRecords.reduce((sum, record) => sum + (durationMinutes(record) || 0), 0),
    returnRatePct: decidedCount ? (alterRecords.length / decidedCount) * 100 : null,
    productivity: allCompletedOrders.size,
    weeklyProductivity: weeklyOrders.size,
    monthlyProductivity: monthlyOrders.size,
    eightWeekHistory,
  }
}

export function getRuleBasedDiagnosis(
  summary: PerformanceSummary,
  maxAlterAttempts: number,
  alterReturnStageLabel: string
): string {
  if (summary.returnRatePct != null && summary.returnRatePct >= 20) {
    return 'Perlu peningkatan kualitas: return rate tinggi pada pekerjaan yang telah diputuskan.'
  }
  if (summary.returnRatePct === 0 && summary.primaryTaskMinutes != null && summary.primaryTaskMinutes >= 480) {
    return 'Akurat tetapi throughput rendah: waktu tugas utama perlu ditinjau.'
  }
  if (summary.alterCount > 0) {
    return `Ada ${summary.alterCount} alter. Production Rules membatasi ${maxAlterAttempts} percobaan dan QC kembali ke ${alterReturnStageLabel}.`
  }
  if (summary.productivity === 0) return 'Belum ada pekerjaan selesai untuk diagnosis.'
  return 'Kualitas dan throughput berada pada pola yang stabil.'
}
