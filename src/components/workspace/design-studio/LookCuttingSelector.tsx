'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { OptionGroup } from './OptionGroup'

interface LookCuttingSelectorProps {
  options: MasterDataOption[]
  selected: string
  onSelect: (value: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

// Own panel per the brief ("Look Cutting menjadi bagian dari Design
// Selection... letakkan sebagai panel tersendiri"). Options come from the
// 'look_cutting' master data category (default seed: Slim/Standard/Regular
// Fit) — this choice rides along in the Order snapshot as a reference for
// Production's Formulasi Pola stage, without altering that stage itself.
// No label passed to OptionGroup: the Accordion wrapping this selector
// already titles it "Look Cutting" (see GarmentBlueprintPanel).
export function LookCuttingSelector({ options, selected, onSelect, onViewSpec }: LookCuttingSelectorProps) {
  return (
    <OptionGroup options={options} selected={selected} onSelect={onSelect} onViewSpec={onViewSpec} allowNone />
  )
}
