'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { OptionGroup } from './OptionGroup'

interface ModelSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (model: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

// Options come from the 'model_thobe' master data category, not a
// hardcoded list. No label passed to OptionGroup: the Accordion wrapping
// this selector already titles it "Model Busana" (see GarmentBlueprintPanel).
export function ModelSelector({ options, selected, onSelect, onViewSpec }: ModelSelectorProps) {
  return (
    <OptionGroup options={options} selected={selected} onSelect={onSelect} onViewSpec={onViewSpec} allowNone />
  )
}
