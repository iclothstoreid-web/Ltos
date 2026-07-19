'use client'

import type { MasterDataOption } from '@/lib/design/masterData'
import { OptionGroup } from './OptionGroup'

interface CollarCuffSelectorProps {
  collarOptions: MasterDataOption[]
  cuffOptions: MasterDataOption[]
  collar: string
  cuff: string
  onSelectCollar: (value: string) => void
  onSelectCuff: (value: string) => void
  onViewSpec: (option: MasterDataOption) => void
}

export function CollarCuffSelector({
  collarOptions,
  cuffOptions,
  collar,
  cuff,
  onSelectCollar,
  onSelectCuff,
  onViewSpec,
}: CollarCuffSelectorProps) {
  return (
    <div className="space-y-5">
      <OptionGroup label="Kerah" options={collarOptions} selected={collar} onSelect={onSelectCollar} onViewSpec={onViewSpec} />
      <OptionGroup label="Manset" options={cuffOptions} selected={cuff} onSelect={onSelectCuff} onViewSpec={onViewSpec} />
    </div>
  )
}
