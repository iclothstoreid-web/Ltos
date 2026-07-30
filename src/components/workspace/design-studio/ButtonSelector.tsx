'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { OptionGroup } from './OptionGroup'

interface ButtonSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (button: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

// Options come from the 'aksesori' master data category — this is the
// "Kancing & Aksesori" pilihan (button/accessory style). No label passed to
// OptionGroup: the Accordion wrapping this selector already titles it
// "Kancing & Aksesori" (see GarmentBlueprintPanel).
export function ButtonSelector({ options, selected, onSelect, onViewSpec }: ButtonSelectorProps) {
  return (
    <OptionGroup options={options} selected={selected} onSelect={onSelect} onViewSpec={onViewSpec} allowNone />
  )
}
