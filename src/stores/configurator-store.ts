import { create } from 'zustand'
import { type DesignConfig, type Estimate, emptyDesignConfig, emptyEstimate } from '@/types/configurator'

interface ConfiguratorState {
  config: DesignConfig
  estimate: Estimate
  updateConfig: (patch: Partial<DesignConfig>) => void
  reset: () => void
  setEstimate: (estimate: Estimate) => void
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  config: emptyDesignConfig(),
  estimate: emptyEstimate(),
  updateConfig: (patch) =>
    set((state) => ({ config: { ...state.config, ...patch } })),
  reset: () => set({ config: emptyDesignConfig(), estimate: emptyEstimate() }),
  setEstimate: (estimate) => set({ estimate }),
}))
