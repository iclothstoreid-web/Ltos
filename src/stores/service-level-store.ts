import { create } from 'zustand'
import type { ServiceLevel } from '@/lib/order/service'

interface ServiceLevelState {
  serviceLevel: ServiceLevel
  setServiceLevel: (level: ServiceLevel) => void
}

// Separate from configurator-store.ts (locked as of W2-1/W2-2) — service
// level is a W2-3 addition and isn't part of DesignConfig, so it gets its
// own small store rather than extending the locked one.
export const useServiceLevelStore = create<ServiceLevelState>((set) => ({
  serviceLevel: 'standard',
  setServiceLevel: (serviceLevel) => set({ serviceLevel }),
}))
