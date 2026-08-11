import { create } from 'zustand'

interface EstimateRetryState {
  nonce: number
  retry: () => void
}

// New, separate store (W2-5) — not an edit to the locked configurator-store
// or EstimateSync's fetch/debounce/cache logic. EstimateSync adds `nonce`
// as one extra dependency to its existing effect; bumping it here re-runs
// that same effect body unchanged, giving PriceSummaryCard's error state a
// "Coba Lagi" button without duplicating any fetch logic.
export const useEstimateRetryStore = create<EstimateRetryState>((set) => ({
  nonce: 0,
  retry: () => set((s) => ({ nonce: s.nonce + 1 })),
}))
