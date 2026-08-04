import type { Decision, Priority } from './types'
import { PRIORITY_RANK } from './types'

// Insight Generator — turns Decision Engine's flat `Decision[]` into a
// structure a future UI can render directly (grouped by priority, sorted,
// plus the single top decision) with no further logic of its own. Decision
// Engine has already decided everything about domain/priority/confidence;
// this only organizes/aggregates that output for display, per the Sprint
// D.2 brief ("Insight Generator: Mengubah data mentah menjadi insight yang
// dapat ditampilkan oleh UI tanpa logika tambahan").

export interface OwnerInsightBoard {
  totalCount: number
  byPriority: Record<Priority, Decision[]>
  topDecision: Decision | null
}

function sortByPriorityThenConfidence(decisions: Decision[]): Decision[] {
  return [...decisions].sort((a, b) => {
    const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    return rankDiff !== 0 ? rankDiff : b.confidence - a.confidence
  })
}

export function generateInsights(decisions: Decision[]): OwnerInsightBoard {
  const sorted = sortByPriorityThenConfidence(decisions)

  const byPriority: Record<Priority, Decision[]> = { critical: [], high: [], medium: [], low: [] }
  for (const decision of sorted) {
    byPriority[decision.priority].push(decision)
  }

  return {
    totalCount: sorted.length,
    byPriority,
    topDecision: sorted[0] ?? null,
  }
}
